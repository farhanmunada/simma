# SIMMA Production Deployment Research

> Research date: 2026-11-07
> Scenario: 30-50 teachers simultaneously inputting grades (30-40 students each) on modest hardware (Core i3/i5, 8-16GB RAM, SSD)
> Stack: Fastify + Drizzle ORM + PostgreSQL 16 + React (Vite), Docker Compose, Ubuntu Server LAN-only

---

## 1. PostgreSQL Tuning for Concurrent Grade Writes

### 1.1 Connection & Memory Parameters (8GB RAM Server)

```ini
# /etc/postgresql/16/main/postgresql.conf (or via Docker command args)

# --- Connections ---
max_connections = 100          # 50 teachers + pool overhead + admin headroom
                               # Formula: pool_max × app_instances + 10 admin

# --- Memory ---
shared_buffers = 2GB           # 25% of 8GB RAM (official recommendation)
effective_cache_size = 6GB     # 75% of RAM — planner hint, not allocation
work_mem = 32MB                # Per-operation sort/hash memory
                               # Careful: 50 connections × 32MB = 1.6GB worst case
maintenance_work_mem = 512MB   # VACUUM, CREATE INDEX operations

# --- WAL (Write-Ahead Log) ---
wal_buffers = 16MB             # Upper limit, auto-set from shared_buffers
min_wal_size = 512MB           # Minimum WAL retention
max_wal_size = 2GB             # Soft limit before checkpoint trigger
checkpoint_completion_target = 0.9  # Spread writes over 90% of checkpoint interval
                                    # Smooths I/O spikes during grade entry bursts

# --- Parallelism (modest CPU) ---
max_parallel_workers_per_gather = 2  # i3/i5 has 2-4 cores
max_parallel_workers = 4
max_worker_processes = 4

# --- I/O (SSD) ---
random_page_cost = 1.1         # SSD: sequential ≈ random cost
effective_io_concurrency = 200 # SSD can handle parallel I/O

# --- Autovacuum ---
autovacuum_max_workers = 2     # Keep modest on small server
autovacuum_vacuum_cost_delay = 10ms
autovacuum_vacuum_cost_limit = 1000

# --- Safety Timeouts ---
idle_in_transaction_session_timeout = 30s  # Kill abandoned transactions
statement_timeout = 30s                    # Prevent runaway queries
```

**For 16GB RAM server, adjust:**
- `shared_buffers = 4GB`
- `effective_cache_size = 12GB`
- `work_mem = 64MB`
- `maintenance_work_mem = 1GB`
- `max_wal_size = 4GB`

### 1.2 Batch INSERT Optimization for Grade Submission

Grade writes should use multi-row INSERT, not individual inserts:

```sql
-- ❌ BAD: One INSERT per student (40 round trips, 40 transaction logs)
INSERT INTO grades (student_id, subject_id, score) VALUES (1, 101, 85);
INSERT INTO grades (student_id, subject_id, score) VALUES (2, 101, 92);

-- ✅ GOOD: Multi-row INSERT (1 round trip, 1 transaction)
INSERT INTO grades (student_id, subject_id, score, term_id, teacher_id)
VALUES
  (1, 101, 85, 'T1-2026', 42),
  (2, 101, 92, 'T1-2026', 42),
  (3, 101, 78, 'T1-2026', 42)
ON CONFLICT (student_id, subject_id, term_id)
DO UPDATE SET score = EXCLUDED.score, updated_at = NOW();
```

**Key pattern: ON CONFLICT for upsert** — teachers re-submitting grades won't cause duplicate errors. This is atomic under high concurrency.

**Lock contention mitigation:**
- Each teacher writes to different student-subject combinations → natural row-level partitioning, minimal lock contention
- Use `pg_advisory_xact_lock` only if teachers could write same rows simultaneously
- INSERT without unique index conflicts won't block concurrent activity (PostgreSQL docs)

### 1.3 Sources
- https://wiki.postgresql.org/wiki/Tuning_Your_PostgreSQL_Server
- https://www.postgresql.org/docs/current/runtime-config-resource.html
- https://www.snowflake.com/en/developers/postgres/scaling/
- https://learn.arm.com/learning-paths/servers-and-cloud-computing/postgresql_tune/tuning/
- https://www.postgresql.org/docs/current/sql-insert.html (ON CONFLICT concurrency)
- https://www.postgresql.org/docs/current/populate.html (batch insert optimization)
- https://techcommunity.microsoft.com/blog/adforpostgresql/turbocharge-your-azure-postgresql-database-mastering-the-art-of-fast-inserts/4374108

---

## 2. Fastify + Node.js Connection Pooling

### 2.1 Pool Sizing Formula

```
pool_size = (core_count × 2) + effective_spindle_count
```
- **SSD shortcut:** `core_count × 2 + 1`
- **i3 (2-core):** pool = 5 connections
- **i5 (4-core):** pool = 9 connections
- **Practical recommendation:** 10-20 per Node.js process

### 2.2 Drizzle/pg Pool Configuration

```typescript
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Pool settings for 30-50 concurrent teachers
  max: 20,                       // Max connections — fits within max_connections=100
  min: 5,                        // Keep 5 warm connections (25% of max)
  idleTimeoutMillis: 30000,      // Close idle after 30s
  connectionTimeoutMillis: 5000, // Fail fast if DB unreachable
  maxUses: 7500,                 // Recycle after 7500 queries (prevents memory leaks)
  allowExitOnIdle: false,        // Keep pool alive
});

const db = drizzle(pool);
```

### 2.3 Critical Rules

1. **Always use `pool.query()` for simple queries** — auto checkout/release
2. **For transactions, always `client.release()` in `finally`**
3. **Never set pool max > 80% of `max_connections`** — leave headroom for admin, migrations
4. **Budget formula:** `(app_instances × pool_max) + 10 < max_connections`
5. **Set `connectionTimeoutMillis`** — default 0 (wait forever) is dangerous in production
6. **Single Node.js process with max=20 is enough for 50 teachers** — queries are fast (<50ms), connections recycle rapidly

### 2.4 Fastify Server Tuning

```typescript
const app = fastify({
  logger: true,
  connectionTimeout: 30000,   // 30s connection timeout
  keepAliveTimeout: 72000,    // 72s keep-alive
  bodyLimit: 1048576,         // 1MB — enough for grade batch JSON
  trustProxy: false,          // LAN-only: no proxy
});

// Graceful shutdown — finish in-flight grade submissions
import closeWithGrace from 'close-with-grace';
closeWithGrace({ delay: 30000 }, async ({ signal }) => {
  app.log.info({ signal }, 'Shutting down gracefully');
  await app.close();
  await pool.end();
});

// Health check endpoint
app.get('/health', async () => {
  const result = await pool.query('SELECT 1');
  return { status: 'ok', db: result.rows.length > 0 };
});
```

### 2.5 Sources
- https://www.thomas-lambert-dev.com/en/articles/postgresql-nodejs/
- https://asifthewebguy.me/posts/postgresql-optimization-nodejs-complete-guide.html
- https://www.hirenodejs.com/blog/nodejs-database-connection-pooling-2026
- https://www.grizzlypeaksoftware.com/library/connection-pooling-in-nodejs-postgresql-and-mongodb-pn3apzgq
- https://www.mefjudev.com/blog/postgresql-connection-pooling
- https://github.com/mcollina/skills/blob/main/skills/fastify/rules/deployment.md (Fastify maintainer's own deployment rules)
- https://fastify.dev/docs/latest/Guides/Recommendations.md

---

## 3. Docker Compose Production Config (LAN-Only)

### 3.1 Production docker-compose.yml

```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "${LAN_IP:-0.0.0.0}:3000:3000"   # Bind to LAN interface
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 256M
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1"]
      interval: 30s
      timeout: 5s
      start_period: 10s
      retries: 3

  db:
    image: postgres:16-alpine
    # PostgreSQL tuning via command args (no custom config file needed)
    command:
      - postgres
      - -c
      - max_connections=100
      - -c
      - shared_buffers=2GB
      - -c
      - effective_cache_size=6GB
      - -c
      - work_mem=32MB
      - -c
      - maintenance_work_mem=512MB
      - -c
      - wal_buffers=16MB
      - -c
      - min_wal_size=512MB
      - -c
      - max_wal_size=2GB
      - -c
      - checkpoint_completion_target=0.9
      - -c
      - random_page_cost=1.1
      - -c
      - effective_io_concurrency=200
      - -c
      - max_parallel_workers_per_gather=2
      - -c
      - max_parallel_workers=4
      - -c
      - idle_in_transaction_session_timeout=30s
      - -c
      - statement_timeout=30s
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      # Loopback-only: Docker published ports bypass ufw
      # For external DB access, use SSH tunnel
      - "127.0.0.1:5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 3G      # shared_buffers(2GB) + OS overhead
        reservations:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    shm_size: '256mb'      # Prevent /dev/shm exhaustion with shared_buffers

  # Automated backup sidecar
  db-backup:
    image: prodrigestivill/postgres-backup-local:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_HOST: db
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      SCHEDULE: "@daily"                    # Run daily at midnight
      BACKUP_KEEP_DAYS: 7                   # Keep 7 daily backups
      BACKUP_KEEP_WEEKS: 4                  # Keep 4 weekly backups
      BACKUP_KEEP_MONTHS: 6                 # Keep 6 monthly backups
      POSTGRES_EXTRA_OPTS: "-Z6 --clean --if-exists"  # gzip level 6, self-cleaning restore
      TZ: "Asia/Ho_Chi_Minh"
      HEALTHCHECK_PORT: 8080
    volumes:
      # Host bind mount — NOT a named volume
      # Keeps dumps directly reachable for off-site copy
      - /opt/simma-backups/postgres:/backups
    depends_on:
      db:
        condition: service_healthy
    security_opt:
      - no-new-privileges:true

volumes:
  pgdata:
    driver: local

networks:
  default:
    driver: bridge
    # LAN-only: no external access needed
```

### 3.2 Dockerfile (Multi-stage)

```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Production stage
FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
USER nodejs
EXPOSE 3000
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

### 3.3 LAN Security Notes

- **DB port `127.0.0.1:5432` only** — Docker published ports bypass ufw/firewall
- **No `POSTGRES_HOST_AUTH_METHOD=trust`** — always use password auth
- **`no-new-privileges:true`** on all containers
- **`shm_size: 256mb`** — prevents `/dev/shm` exhaustion when `shared_buffers` is large
- **Named volumes for data, bind mounts for backups** — backups must survive `docker compose down -v`

### 3.4 Sources
- https://docs.docker.com/compose/how-tos/production/
- https://github.com/mcollina/skills/blob/main/skills/fastify/rules/deployment.md
- https://github.com/jgouviergmail/LIA-Assistant/blob/main/docker-compose.prod.yml
- https://github.com/chuanghiduoc/nestjs-fastify-nx/blob/main/docs/deployment.md (PgBouncer sizing)
- https://dev.to/polliog/docker-compose-for-production-lessons-from-deploying-a-log-management-platform-37eo

---

## 4. Backup Strategy for On-Premise School Server

### 4.1 Three-Layer Backup Approach

| Layer | Method | Frequency | Retention | Tool |
|-------|--------|-----------|-----------|------|
| **L1: Logical dump** | pg_dump (gzip, custom format) | Daily 2 AM | 7 daily, 4 weekly, 6 monthly | `prodrigestivill/postgres-backup-local` sidecar |
| **L2: File copy** | rsync backup dir → USB/NAS | Weekly | 4 copies | cron + rsync |
| **L3: Critical period** | Pre-exam snapshot | Before grade entry season | Until verified | Manual pg_dump |

### 4.2 Docker Sidecar Backup (Recommended — Zero Config)

Using `prodrigestivill/postgres-backup-local` image (see Docker Compose above):
- Runs pg_dump on cron schedule inside container
- Auto-rotation: daily/weekly/monthly
- Dumps stored on host filesystem at `/opt/simma-backups/postgres/`
- Restore: `gunzip -c backup.sql.gz | docker exec -i simma-db-1 psql -U $DB_USER -d $DB_NAME`

### 4.3 Manual/Script Backup for Extra Safety

```bash
#!/bin/bash
# /opt/simma-backups/manual-backup.sh
# Run before exam season or major data entry periods

BACKUP_DIR="/opt/simma-backups/manual"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="simma-db-1"

mkdir -p "$BACKUP_DIR"

# Custom format (most flexible for selective restore)
docker exec "$DB_CONTAINER" pg_dump \
  -U "$DB_USER" \
  -Fc \
  --clean --if-exists \
  "$DB_NAME" > "$BACKUP_DIR/simma_${TIMESTAMP}.dump"

# Also create plain SQL (human-readable, version-portable)
docker exec "$DB_CONTAINER" pg_dump \
  -U "$DB_USER" \
  --clean --if-exists \
  "$DB_NAME" | gzip > "$BACKUP_DIR/simma_${TIMESTAMP}.sql.gz"

# Verify backup is non-empty
DUMP_SIZE=$(stat -c%s "$BACKUP_DIR/simma_${TIMESTAMP}.dump" 2>/dev/null || echo 0)
if [ "$DUMP_SIZE" -lt 1024 ]; then
  echo "ERROR: Backup file suspiciously small ($DUMP_SIZE bytes)" >&2
  exit 1
fi

echo "Backup complete: $BACKUP_DIR/simma_${TIMESTAMP}.dump ($DUMP_SIZE bytes)"

# Delete manual backups older than 90 days
find "$BACKUP_DIR" -name "simma_*.dump" -mtime +90 -delete
find "$BACKUP_DIR" -name "simma_*.sql.gz" -mtime +90 -delete
```

### 4.4 Off-Site Copy (USB/NAS/Network Drive)

```bash
# Weekly cron: copy backups to USB or network share
# crontab -e → 0 3 * * 0 /opt/simma-backups/offsite-sync.sh

#!/bin/bash
BACKUP_SOURCE="/opt/simma-backups/postgres"
OFFSITE_TARGET="/media/usb-backup/simma"  # or NFS mount

rsync -avz --delete "$BACKUP_SOURCE/" "$OFFSITE_TARGET/"
echo "$(date): Off-site sync complete" >> /var/log/simma-backup.log
```

### 4.5 Restore Procedures

```bash
# From custom format (selective restore possible)
docker exec -i simma-db-1 pg_restore \
  -U $DB_USER \
  -d $DB_NAME \
  --clean --if-exists \
  < /opt/simma-backups/manual/simma_20261107.dump

# From plain SQL
gunzip -c /opt/simma-backups/postgres/daily/simma-2026-11-07.sql.gz \
  | docker exec -i simma-db-1 psql -U $DB_USER -d $DB_NAME

# Verify after restore
docker exec simma-db-1 psql -U $DB_USER -d $DB_NAME \
  -c "SELECT COUNT(*) FROM grades; SELECT COUNT(*) FROM students;"
```

### 4.6 Critical Exam Season Protocol

1. **Before grade entry opens:** Run manual full backup + verify
2. **During entry period:** Switch to twice-daily automated backups (`SCHEDULE: "0 2,14 * * *"`)
3. **After all grades submitted:** Full backup + off-site copy
4. **Test restore** on throwaway container before each semester

### 4.7 Sources
- https://wiki.postgresql.org/wiki/Automated_Backup_on_Linux
- https://www.postgresql.org/docs/current/backup.html
- https://www.postgresql.org/docs/current/backup-dump.html
- https://www.postgresql.org/docs/current/continuous-archiving.html
- https://ubuntu.com/server/docs/install-and-configure-postgresql/
- https://ubuntu.com/server/docs/how-to/backups/
- https://github.com/prodrigestivill/docker-postgres-backup-local (backup sidecar image)

---

## 5. Capacity Estimate for SIMMA Scenario

### Peak Load Calculation
- 50 teachers × 1 batch submit per 5 minutes = 10 batch requests/minute
- Each batch = 40 student grades = 1 multi-row INSERT with ON CONFLICT
- PostgreSQL handles 1000+ simple INSERT/s on modest hardware
- **Conclusion:** This workload is well within a single i5 + SSD server capacity

### Connection Budget
```
Pool max:                  20
App instances:              1
Admin/migration headroom:  10
Total needed:              30
PostgreSQL max_connections: 100  ← plenty of room
```

### Memory Budget (8GB server)
```
PostgreSQL shared_buffers:  2.0 GB
PostgreSQL work_mem peak:   ~0.6 GB (20 connections × 32MB worst case)
OS + file cache:            ~3.5 GB
Node.js + app:              ~0.5 GB
Docker overhead:            ~0.2 GB
Headroom:                   ~1.2 GB
```

### When to Scale Up
- **PgBouncer needed when:** multiple app instances × pool_max > max_connections
- **Read replica needed when:** report generation slows grade entry
- **For this scenario:** single-instance, no PgBouncer, no replica needed

---

## 6. Quick Reference: Production Checklist

- [ ] PostgreSQL tuned via Docker command args (shared_buffers, work_mem, WAL)
- [ ] `shm_size: 256mb` on DB container
- [ ] DB port bound to `127.0.0.1` only
- [ ] Pool max=20, connection timeout=5s, idle timeout=30s
- [ ] Grade submission uses multi-row INSERT with ON CONFLICT
- [ ] Automated daily backup sidecar running
- [ ] Backup dir is host bind mount, not named volume
- [ ] Off-site backup sync (USB/NAS) weekly
- [ ] Manual backup script ready for exam season
- [ ] Restore procedure tested on throwaway container
- [ ] `NODE_ENV=production` set
- [ ] Graceful shutdown with close-with-grace
- [ ] Health check endpoints on both API and DB
- [ ] `statement_timeout` and `idle_in_transaction_session_timeout` set
