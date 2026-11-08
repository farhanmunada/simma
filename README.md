# SIMMA — Sistem Informasi Madrasah Aliyah

Platform terpadu tata kelola akademik kurikulum Kemenag, kesiswaan standar EMIS 4.0, monitoring tahfidz, dan e-rapor (RDM) untuk Madrasah Aliyah berbasis Ubuntu Server on-premise.

---

## Arsitektur Repositori Decoupled

Sistem dipisahkan menjadi dua bagian utama berbasis TypeScript/JavaScript murni:
```text
D:\Coding\simma\
├── README.md               # Indeks & dokumentasi proyek
├── .gitignore              # Proteksi secret, env, dan cache
├── docs/                   # Spesifikasi & riset sistem
│   ├── RESEARCH.md         # Analisis regulasi Kemenag (KMA 347/450, EMIS, RDM, Tahfidz)
│   ├── PRD.md              # Product Requirement Document & matriks RBAC
│   └── ARCHITECTURE.md     # Topologi Ubuntu Server, ERD, dan mitigasi konkurensi
├── simma-be/               # Backend API: Node.js (v22 LTS) + Fastify (TS) + Drizzle + PostgreSQL
└── simma-fe/               # Frontend Client: Vite + React (TS) + TanStack Table + Tailwind CSS
```

---

## Ringkasan Teknologi Terpilih

- **Server Target:** Ubuntu Server 24.04 LTS (On-premise LAN madrasah via Docker Compose).
- **Backend (`simma-be`):** Node.js v22 LTS + Fastify TypeScript (throughput I/O tinggi, memory footprint rendah).
- **Database Access:** Drizzle ORM + Connection Pooling PostgreSQL 16 (anti-lock, ACID compliant).
- **Frontend (`simma-fe`):** React + Vite TypeScript + TanStack Table Virtualization (ringan di laptop guru untuk ribuan sel nilai).
- **Tanpa Next.js, Tanpa PHP.**

---

## Status Proyek
- [x] Phase 1: Inisiasi Repositori, Guardrails & .gitignore.
- [x] Phase 2: Riset Regulasi Kemenag & Domain Madrasah (`docs/RESEARCH.md`).
- [x] Phase 3: Product Requirement Document (`docs/PRD.md`).
- [x] Phase 4: Arsitektur Sistem, Mitigasi Konkurensi & Skema Basis Data (`docs/ARCHITECTURE.md`).
- [x] Phase 5: Wave 0 Foundation — monorepo scaffold, core errors, DB config, shared types, AGENTS.md.
- [ ] Phase 6: Gerbang Persetujuan + Wave 1 (Worker A: Auth & RBAC, Worker B: Setup).

---

## Wave-Based Development

**Wave 0 (Leader):** ✅ DONE
- pnpm-workspace.yaml, root package.json
- BE: Fastify scaffold, AppError + error-handler, env config, DB client
- FE: React + Vite + Tailwind minimal
- Shared: Zod auth schemas, role/status/gender constants
- Docker: PostgreSQL 16 dev container
- Docs: AGENTS.md, decision.md (vault log)

**Wave 1 (Worker A + B):** 🔄 NEXT
- Worker A: `feat/auth` — Login, JWT, password hash, token refresh
- Worker B: `feat/setup` — TA, semester, kelas, mapel, guru mapping

**Wave 2 (Worker C + D):** ⏳ Blocked on Wave 1
- Worker C: `feat/students` — Siswa CRUD, parent, class assignments
- Worker D: `feat/tahfidz` — Memorization tracking, review session

**Wave 3 (Worker E + F):** ⏳ Blocked on Wave 2
- Worker E: `feat/attendance` — Daily attendance toggle, reports
- Worker F: `feat/grades` — Assessment input, auto-calculate, submission

**Wave 4 (Worker G):** ⏳ Blocked on Wave 3
- Worker G: `feat/reports` — Rapor PDF generation (RDM format)

---

## Quick Start

```bash
# 1. Setup env
cp simma-be/.env.example simma-be/.env
# Edit: DATABASE_URL, JWT_*_SECRET

# 2. Start DB
docker-compose up -d

# 3. Install deps (when pnpm resolves)
pnpm install

# 4. Migrate DB
pnpm --filter simma-be run db:generate
pnpm --filter simma-be run db:migrate

# 5. Dev
pnpm dev:be &   # Terminal 1
pnpm dev:fe     # Terminal 2
```

---

## Verification

```bash
pnpm -r run typecheck
pnpm -r run lint
pnpm -r run test
pnpm -r run build
```

---

## Rules (See AGENTS.md)

1. **Deny-first security** — no .env, tokens, keys
2. **No test tampering** — fix code, not assertions
3. **Worker boundary** — your module only
4. **3-strike rule** — fail 3x, stop, rollback, report
5. **Atomic commits** — `feat(module): desc`
6. **Build/test green** — proof required

---

## Vault & Logs

- Core rules: `agentVault/01-Core-Rules/non-negotiables.md`
- System design: `agentVault/02-Architecture-and-Tech/02-system-design.md`
- Code review: `agentVault/03-Implementation-and-Clean-Code/04-code-review-checklist.md`
- Decisions log: `agentVault/99-Project-Logs/simma/decisions.md`
- Bugs log: `agentVault/99-Project-Logs/simma/bugs.md`
- Agent eval: `agentVault/99-Project-Logs/simma/agent-eval.md`
