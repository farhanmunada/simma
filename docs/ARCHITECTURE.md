# ARCHITECTURE: Desain Arsitektur & System Design SIMMA

**Tanggal:** 2026-11-07
**Status:** Draft
**Versi:** 2.0
**Referensi:** [RESEARCH.md](RESEARCH.md) | [PRD.md](PRD.md) | [UX-DESIGN.md](UX-DESIGN.md) | [agentVault/02-system-design.md](../../agentVault/02-Architecture-and-Tech/02-system-design.md)

---

## 1. Arsitektur Tingkat Tinggi (High-Level Architecture)

### 1.1 Deployment Topology (Internet Publik)

```
Internet (Guru di rumah, Admin di madrasah, Kamad di mana saja)
  │
  ▼  HTTPS :443
┌──────────────────────────────────────────────────────┐
│  VPS Cloud (4 vCPU, 8GB RAM, 80GB SSD)               │
│  Ubuntu 24.04 LTS                                    │
│                                                      │
│  ┌────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │ Caddy  │───>│ simma-be │───>│ PostgreSQL 16    │  │
│  │ :443   │    │ Fastify  │    │ (:5432 internal) │  │
│  │ (auto  │    │ :3000    │    └──────────────────┘  │
│  │  TLS)  │    └──────────┘                          │
│  │        │    ┌──────────┐                          │
│  │        │───>│ simma-fe │                          │
│  │        │    │ static   │                          │
│  │        │    └──────────┘                          │
│  └────────┘                                          │
│                                                      │
│  Docker Compose (5 containers)                       │
│  - caddy (reverse proxy + auto-TLS Let's Encrypt)   │
│  - simma-be (Node 22 LTS)                           │
│  - simma-fe (Caddy static serve)                    │
│  - postgres (16-alpine, SSD volume)                 │
│  - pg-backup (cron: daily dump)                     │
│                                                      │
│  Firewall: hanya port 22 (SSH) + 443 (HTTPS)        │
│  fail2ban aktif untuk brute-force protection         │
└──────────────────────────────────────────────────────┘
      ▲
      │  HTTPS via internet / WiFi / 4G
      │
  ┌───┴───┐  ┌───────┐  ┌───────┐  ┌──────────┐
  │ Laptop│  │Laptop │  │  HP   │  │ Laptop   │
  │ Guru  │  │Admin  │  │Kamad  │  │Guru(rmh) │
  │(madrs)│  │(madrs)│  │(mana  │  │          │
  └───────┘  └───────┘  │ saja) │  └──────────┘
                        └───────┘
```

### 1.2 Kenapa Arsitektur Ini

| Keputusan | Alasan |
|---|---|
| Decoupled FE/BE | FE bisa di-rebuild tanpa restart BE. Deploy independen. |
| PostgreSQL (bukan SQLite) | Concurrent writes dari 50+ guru simultan. Row-level locking. JSONB untuk field EMIS fleksibel. |
| Docker Compose | Reproducible deployment. `docker compose up -d` tanpa setup manual. |
| Caddy (bukan Nginx) | Auto-TLS via Let's Encrypt tanpa config manual. HTTPS wajib karena akses publik + data sensitif (NIK, nilai). |
| VPS Cloud (bukan on-premise) | Akses publik tanpa port forwarding/tunnel. Uptime 99.9%. Maintenance minimal — madrasah tidak punya IT dedicated. |
| Single server | ~500 siswa + 50 staff. 4 vCPU + 8GB RAM jauh di atas kebutuhan. Tidak perlu Kubernetes/microservices. |
| Internet publik + HTTPS | Guru bisa input nilai dari rumah (malam/weekend). Kamad bisa monitor dari mana saja. |

---

## 2. Tech Stack — Keputusan & Alasan

### 2.1 Backend: Fastify + TypeScript

| Komponen | Pilihan | Alasan |
|---|---|---|
| Runtime | Node.js 22 LTS | Stable, LTS sampai 2027. Worker threads untuk PDF gen. |
| Framework | Fastify 5 | 2-3x lebih cepat dari Express. JSON schema validation built-in. Plugin system yang clean. |
| ORM | Drizzle ORM | Type-safe, SQL-first, zero runtime overhead. Familiar dari project sebelumnya. |
| Database | PostgreSQL 16 | ACID, concurrent writes, JSONB, full-text search, proven. |
| Validation | Zod | Schema-first validation. Shared types FE/BE via monorepo packages. |
| Auth | JWT (jose library) | Stateless auth. Access token 15min + refresh token 7 hari. |
| PDF | @react-pdf/renderer | React-based PDF templates. Familiar sintaks. Server-side render. |
| File upload | @fastify/multipart | Stream-based, memory efficient. |
| Logging | pino (built-in Fastify) | Structured JSON logs. Zero overhead. |

### 2.2 Frontend: React + Vite + TypeScript

| Komponen | Pilihan | Alasan |
|---|---|---|
| Framework | React 19 | Ecosystem besar, banyak library kompatibel. |
| Build tool | Vite 6 | HMR instant, build cepat, output kecil. |
| Router | React Router 7 | File-based routing, lazy loading per route. |
| UI Components | Tailwind CSS + Headless UI | Utility-first, treeshake, no JS overhead untuk styling. Accessible primitives dari Headless UI. |
| State | Zustand | Minimal boilerplate, 1KB gzipped. Cukup untuk app ini. |
| Data fetching | TanStack Query (React Query) | Cache, refetch, optimistic updates, offline support. |
| Table/Grid | TanStack Table + TanStack Virtual | Headless table logic + virtualized rendering untuk grid 40+ rows. |
| Forms | React Hook Form + Zod resolver | Performant forms, shared Zod schema dengan BE. |
| Icons | Lucide React | Tree-shakeable, consistent. |
| Date | date-fns | Modular, tree-shakeable. Tidak perlu Moment/Day.js. |

### 2.3 Shared (Monorepo)

```
simma/
├── simma-be/          # Backend Fastify
├── simma-fe/          # Frontend React Vite
├── packages/
│   └── shared/        # Shared Zod schemas, types, constants
├── docker-compose.yml
├── docs/
└── README.md
```

`packages/shared` berisi:
- Zod schemas (validation rules dipakai FE dan BE)
- TypeScript types/interfaces
- Constants (enum status, kode mapel, dll)
- Utility functions (format tanggal, format rupiah, dll)

Tool: pnpm workspaces (bukan Turborepo/Nx — overkill untuk 3 packages).

---

## 3. Alur Data (Data Flow)

### 3.1 Request Flow — Input Nilai (Contoh Kritis)

```
Browser (Guru)
  │
  │  POST /api/grades { studentId, assessmentId, value: 85 }
  │  Header: Authorization: Bearer <access_token>
  │
  ▼
Nginx (:80)
  │  rate-limit: 100 req/min per IP
  │  proxy_pass -> :3000
  │
  ▼
Fastify (:3000)
  │
  ├─ [1] Auth Plugin (JWT verify)
  │    └─ Decode token -> { userId, role, teacherId }
  │    └─ Reject 401 jika expired/invalid
  │
  ├─ [2] RBAC Middleware
  │    └─ Check: role === 'guru' && teacherId has access to this class+subject
  │    └─ Reject 403 jika tidak authorized
  │
  ├─ [3] Zod Validation (Input DTO)
  │    └─ Validate: { studentId: uuid, assessmentId: uuid, value: number 0-100 }
  │    └─ Reject 400 jika invalid
  │
  ├─ [4] Service Layer (GradeService.upsertGrade)
  │    └─ Business logic:
  │       - Cek student exists & aktif
  │       - Cek assessment exists & belum dikunci
  │       - Upsert grade (INSERT ON CONFLICT UPDATE)
  │       - Recalculate semester grade (rata-rata sumatif)
  │       - Write audit log
  │    └─ Throw NotFoundError / ValidationError jika gagal
  │
  ├─ [5] Repository Layer (DrizzleORM)
  │    └─ Parameterized query -> PostgreSQL
  │    └─ Transaction: grade upsert + audit log dalam 1 tx
  │
  ▼
Response: 200 { grade: { id, value, semesterAvg, updatedAt } }
```

### 3.2 Error Flow — Centralized (Pola A dari agentVault)

```typescript
// src/core/errors/app-error.ts — sesuai agentVault/02-system-design.md
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(404, id ? `${resource} dengan ID ${id} tidak ditemukan` : `${resource} tidak ditemukan`, 'NOT_FOUND');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Anda tidak memiliki akses') {
    super(403, message, 'FORBIDDEN');
  }
}

// Error handler middleware di Fastify
app.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: { code: error.code, message: error.message }
    });
  }
  // Unexpected error -> log full stack, return generic message
  request.log.error(error);
  return reply.status(500).send({
    error: { code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan sistem' }
  });
});
```

FE menerjemahkan error code ke pesan ramah guru (lihat UX-DESIGN.md Bagian 7.1).

---

## 4. Database Design

### 4.1 Prinsip

- Normalize sampai 3NF, denormalize hanya kalau terbukti lambat
- JSONB untuk field EMIS yang sering berubah format (mitigasi risiko #1 di RESEARCH.md)
- Soft delete (deleted_at) untuk data siswa & GTK — madrasah sering perlu data historis
- Semua tabel punya: id (UUID v7), created_at, updated_at
- Audit trail via tabel terpisah (entity_type, entity_id, action, old_value, new_value, user_id, timestamp)

### 4.2 ERD — Core Entities

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   institutions  │     │  academic_years │     │    semesters    │
│─────────────────│     │─────────────────│     │─────────────────│
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ nsm             │     │ name            │     │ academic_year_id│
│ npsn            │     │ start_date      │     │ type (1/2)      │
│ name            │     │ end_date        │     │ is_active       │
│ status          │     │ is_active       │     │ start_date      │
│ address         │     └─────────────────┘     │ end_date        │
│ logo_path       │                              └─────────────────┘
│ emis_data(JSONB)│
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    students     │     │     parents     │     │  student_parents│
│─────────────────│     │─────────────────│     │─────────────────│
│ id (PK)         │     │ id (PK)         │     │ student_id (FK) │
│ nik (16 chr)    │     │ nik             │     │ parent_id (FK)  │
│ nisn (10 chr)   │     │ name            │     │ relation_type   │
│ nis             │     │ birth_place     │     │ is_guardian      │
│ full_name       │     │ birth_date      │     └─────────────────┘
│ birth_place     │     │ gender          │
│ birth_date      │     │ education       │     ┌─────────────────┐
│ gender          │     │ occupation      │     │   classrooms    │
│ mother_name     │     │ income          │     │─────────────────│
│ status          │     │ phone           │     │ id (PK)         │
│ photo_path      │     │ address         │     │ semester_id (FK)│
│ emis_data(JSONB)│     │ emis_data(JSONB)│     │ name (X-A, X-B) │
│ deleted_at      │     └─────────────────┘     │ grade_level     │
└─────────────────┘                              │ homeroom_teacher│
                                                 │ capacity        │
┌─────────────────┐     ┌─────────────────┐     └─────────────────┘
│   teachers      │     │    subjects     │
│─────────────────│     │─────────────────│     ┌─────────────────┐
│ id (PK)         │     │ id (PK)         │     │ class_students  │
│ user_id (FK)    │     │ code            │     │─────────────────│
│ nik             │     │ name            │     │ classroom_id(FK)│
│ nuptk           │     │ group           │     │ student_id (FK) │
│ full_name       │     │ jp_per_week     │     │ nis_in_class    │
│ employment_type │     │ is_required     │     └─────────────────┘
│ certification   │     │ phase           │
│ emis_data(JSONB)│     └─────────────────┘
│ deleted_at      │
└─────────────────┘     ┌─────────────────┐
                        │ teaching_assign │
┌─────────────────┐     │─────────────────│
│     users       │     │ id (PK)         │
│─────────────────│     │ teacher_id (FK) │
│ id (PK)         │     │ subject_id (FK) │
│ username        │     │ classroom_id(FK)│
│ password_hash   │     │ semester_id(FK) │
│ role            │     └─────────────────┘
│ teacher_id (FK) │
│ is_active       │
│ last_login      │
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  assessments    │     │     grades      │     │ semester_grades │
│─────────────────│     │─────────────────│     │─────────────────│
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ teaching_id(FK) │     │ assessment_id   │     │ teaching_id(FK) │
│ type (SLM/SAS)  │     │ student_id (FK) │     │ student_id (FK) │
│ sequence_num    │     │ value (0-100)   │     │ avg_sumatif     │
│ description     │     │ updated_by (FK) │     │ sas_value       │
│ min_threshold   │     │ updated_at      │     │ final_value     │
│ weight_config   │     └─────────────────┘     │ competency_desc │
└─────────────────┘                              │ status (draft/  │
                                                 │  submitted)     │
┌─────────────────┐     ┌─────────────────┐     └─────────────────┘
│   attendance    │     │   tahfidz       │
│─────────────────│     │─────────────────│     ┌─────────────────┐
│ id (PK)         │     │ id (PK)         │     │   violations    │
│ student_id (FK) │     │ student_id (FK) │     │─────────────────│
│ classroom_id(FK)│     │ teacher_id (FK) │     │ id (PK)         │
│ date            │     │ type (Z/M)      │     │ student_id (FK) │
│ status (H/S/I/  │     │ juz             │     │ type_id (FK)    │
│  A/T)           │     │ surah           │     │ points          │
│ recorded_by(FK) │     │ ayah_start      │     │ date            │
│ updated_at      │     │ ayah_end        │     │ description     │
└─────────────────┘     │ tajwid_score    │     │ recorded_by(FK) │
                        │ makhroj_score   │     └─────────────────┘
┌─────────────────┐     │ fluency_score   │
│   payments      │     │ status (pass/   │     ┌─────────────────┐
│─────────────────│     │  retry)         │     │   audit_logs    │
│ id (PK)         │     │ notes           │     │─────────────────│
│ student_id (FK) │     │ date            │     │ id (PK)         │
│ billing_id (FK) │     └─────────────────┘     │ entity_type     │
│ amount          │                              │ entity_id       │
│ paid_date       │     ┌─────────────────┐     │ action          │
│ method          │     │    billings     │     │ old_value(JSONB)│
│ receipt_no      │     │─────────────────│     │ new_value(JSONB)│
│ received_by(FK) │     │ id (PK)         │     │ user_id (FK)    │
└─────────────────┘     │ student_id (FK) │     │ ip_address      │
                        │ type_id (FK)    │     │ created_at      │
                        │ month           │     └─────────────────┘
                        │ year            │
                        │ amount          │
                        │ status          │
                        │ due_date        │
                        └─────────────────┘
```

### 4.3 Index Strategy

| Tabel | Index | Tipe | Alasan |
|---|---|---|---|
| students | nik | UNIQUE | Lookup EMIS, validasi duplikat |
| students | nisn | UNIQUE (nullable) | Lookup EMIS |
| students | full_name | GIN (trigram) | Fuzzy search nama siswa |
| grades | (assessment_id, student_id) | UNIQUE | Prevent duplicate grades |
| attendance | (student_id, classroom_id, date) | UNIQUE | 1 record per siswa per kelas per hari |
| payments | (student_id, billing_id) | UNIQUE | Prevent double payment |
| audit_logs | (entity_type, entity_id) | BTREE | Lookup audit per entity |
| audit_logs | created_at | BTREE (DESC) | Recent audit first |
| teaching_assignments | (teacher_id, semester_id) | BTREE | Lookup jadwal guru |

### 4.4 JSONB Strategy untuk EMIS Compatibility

Field `emis_data` (JSONB) di tabel students, parents, teachers, institutions menyimpan data EMIS yang:
- Sering berubah format antar tahun ajaran
- Tidak dipakai untuk query/filter
- Hanya untuk export ke CSV EMIS

Contoh `students.emis_data`:
```json
{
  "citizenship": "WNI",
  "religion": "Islam",
  "aspiration": "Guru/Dosen",
  "hobby": "Membaca",
  "pre_school": true,
  "immunization": true,
  "residence_type": 1,
  "transport": 3,
  "distance": 2,
  "travel_time": 3,
  "financial_support": "Orang Tua",
  "special_needs": [],
  "kip_number": null,
  "kk_number": "3515xxxxxxxxxx",
  "kk_head_name": "Budi Santoso"
}
```

Data yang SERING di-query (nama, NIK, NISN, status, kelas) tetap di kolom relasional — bukan di JSONB.

---

## 5. API Design

### 5.1 Konvensi

- Base path: `/api/v1`
- Format: JSON
- Auth: Bearer JWT di header Authorization
- Pagination: `?page=1&limit=20` -> response `{ data: [], meta: { page, limit, total, totalPages } }`
- Sort: `?sort=name&order=asc`
- Filter: `?status=active&grade_level=10&search=ahmad`
- Bulk operations: POST/PATCH dengan array body
- Idempotency: upsert pattern (INSERT ON CONFLICT UPDATE)

### 5.2 Endpoint Map (Core)

```
Auth
  POST   /api/v1/auth/login          { username, password } -> { accessToken, refreshToken }
  POST   /api/v1/auth/refresh         { refreshToken } -> { accessToken }
  POST   /api/v1/auth/logout          Invalidate refresh token
  GET    /api/v1/auth/me              Current user profile

Students
  GET    /api/v1/students             List (paginated, filterable)
  GET    /api/v1/students/:id         Detail
  POST   /api/v1/students             Create
  PATCH  /api/v1/students/:id         Update
  DELETE /api/v1/students/:id         Soft delete
  GET    /api/v1/students/:id/parents Parents of student
  POST   /api/v1/students/import      Import from CSV

Classrooms
  GET    /api/v1/classrooms           List
  POST   /api/v1/classrooms           Create
  PATCH  /api/v1/classrooms/:id       Update
  GET    /api/v1/classrooms/:id/students  Students in classroom
  POST   /api/v1/classrooms/:id/students  Assign students (batch)

Grades
  GET    /api/v1/grades/teaching/:teachingId       Grid: all students, all assessments
  PATCH  /api/v1/grades                             Upsert batch [{studentId, assessmentId, value}]
  POST   /api/v1/grades/teaching/:teachingId/submit  Submit (lock) grades

Assessments
  GET    /api/v1/assessments/teaching/:teachingId   List assessments for teaching
  POST   /api/v1/assessments                        Create assessment
  PATCH  /api/v1/assessments/:id                    Update
  DELETE /api/v1/assessments/:id                    Delete (only if no grades)

Attendance
  GET    /api/v1/attendance/classroom/:classId/date/:date   Get/create today
  PATCH  /api/v1/attendance/bulk                            Upsert [{studentId, status}]
  GET    /api/v1/attendance/student/:studentId/summary      Monthly summary

Reports (Rapor)
  GET    /api/v1/reports/classroom/:classId/status          Completion status per subject
  GET    /api/v1/reports/student/:studentId/semester/:semId  Full report data
  GET    /api/v1/reports/student/:studentId/semester/:semId/pdf  Generate PDF
  GET    /api/v1/reports/classroom/:classId/legger           Legger (all students, all subjects)

Tahfidz
  GET    /api/v1/tahfidz/student/:studentId         History
  POST   /api/v1/tahfidz                            Record memorization
  GET    /api/v1/tahfidz/student/:studentId/progress  Juz completion map

Payments
  GET    /api/v1/payments/student/:studentId         Outstanding billings
  POST   /api/v1/payments                            Record payment
  GET    /api/v1/payments/classroom/:classId/summary  Class payment status
  GET    /api/v1/payments/:id/receipt                 Receipt PDF

Dashboard
  GET    /api/v1/dashboard/teacher     Teacher's classes, grade progress, today's schedule
  GET    /api/v1/dashboard/admin       Overview: students, attendance, SPP, grade completion
  GET    /api/v1/dashboard/principal   Kamad view: attendance %, SPP %, grade submission %
```

---

## 6. Concurrency & Performance Design

### 6.1 Problem Statement

50 guru input nilai secara bersamaan. Masing-masing input ke kelas dan mapel berbeda, tapi ke tabel `grades` yang sama.

### 6.2 Strategi

| Concern | Solusi |
|---|---|
| Write contention | Row-level locking PostgreSQL. Unique constraint (assessment_id, student_id) -> upsert tanpa deadlock. |
| Read during write | MVCC PostgreSQL — reader tidak di-block oleh writer. |
| Autosave burst | Debounce 500ms di FE. BE batch upsert (1 request per 500ms, bukan per keystroke). |
| PDF generation | Worker thread (Node.js worker_threads). Tidak block event loop. |
| Large grid render | TanStack Virtual — FE hanya render visible rows. |
| Connection pooling | pg pool: min 5, max 20 connections. |

### 6.3 Caching

- Tidak perlu Redis untuk skala ini (< 500 user total, LAN, < 50 concurrent)
- In-memory cache Fastify plugin untuk data statis (daftar mapel, kelas, TA aktif) — invalidate on change
- TanStack Query cache di FE (staleTime: 5 menit untuk data referensi)

---

## 7. Offline & Autosave Architecture

### 7.1 Autosave Flow

```
User ketik nilai di sel
  │
  ▼  [Debounce 500ms]
Queue change: { assessmentId, studentId, value, timestamp }
  │
  ├─ Online? ──Yes──> PATCH /api/v1/grades (batch)
  │                     │
  │                     ├─ 200 OK -> Update local state, show "Tersimpan ✓"
  │                     └─ Error  -> Retry 3x, then show "Gagal, coba lagi"
  │
  └─ Offline? ──> Save to IndexedDB queue
                    │
                    └─ On reconnect -> Replay queue (FIFO, conflict: server wins)
```

### 7.2 Conflict Resolution

- Last-write-wins berdasarkan timestamp server
- Jika guru edit offline dan admin juga edit online, server value menang
- FE menampilkan notifikasi jika nilai berubah dari yang di-save offline

---

## 8. File Structure

### 8.1 Backend (simma-be)

```
simma-be/
├── src/
│   ├── app.ts                    # Fastify instance, plugin registration
│   ├── server.ts                 # Entry point, listen
│   ├── core/
│   │   ├── errors/               # AppError, NotFoundError, etc.
│   │   ├── auth/                 # JWT verify, RBAC middleware
│   │   ├── database/             # Drizzle config, connection
│   │   └── plugins/              # Fastify plugins (cors, rate-limit, etc.)
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.schema.ts    # Zod schemas
│   │   │   └── auth.routes.ts
│   │   ├── students/
│   │   │   ├── students.controller.ts
│   │   │   ├── students.service.ts
│   │   │   ├── students.repository.ts
│   │   │   ├── students.schema.ts
│   │   │   └── students.routes.ts
│   │   ├── grades/
│   │   ├── attendance/
│   │   ├── reports/
│   │   ├── tahfidz/
│   │   ├── payments/
│   │   ├── classrooms/
│   │   ├── subjects/
│   │   ├── teachers/
│   │   └── settings/
│   ├── db/
│   │   ├── schema/               # Drizzle table definitions
│   │   │   ├── students.ts
│   │   │   ├── grades.ts
│   │   │   ├── attendance.ts
│   │   │   └── ...
│   │   └── migrations/           # Drizzle migrations
│   └── utils/
│       ├── pdf/                  # PDF templates (rapor, kwitansi, surat)
│       └── csv/                  # CSV import/export helpers
├── drizzle.config.ts
├── tsconfig.json
├── package.json
└── Dockerfile
```

### 8.2 Frontend (simma-fe)

```
simma-fe/
├── src/
│   ├── main.tsx                  # Entry
│   ├── App.tsx                   # Router setup
│   ├── api/                      # API client (axios/fetch wrapper)
│   │   ├── client.ts             # Base client with auth interceptor
│   │   ├── students.api.ts
│   │   ├── grades.api.ts
│   │   └── ...
│   ├── components/
│   │   ├── ui/                   # Reusable primitives (Button, Input, Modal, etc.)
│   │   ├── layout/               # Sidebar, Header, PageContainer
│   │   ├── grades/               # GradeGrid, GradeCell, GradeToolbar
│   │   ├── attendance/           # AttendanceList, StatusBadge
│   │   └── ...
│   ├── pages/
│   │   ├── login.tsx
│   │   ├── dashboard/
│   │   ├── attendance/
│   │   ├── grades/
│   │   ├── students/
│   │   ├── reports/
│   │   ├── tahfidz/
│   │   ├── payments/
│   │   └── settings/
│   ├── hooks/                    # Custom hooks (useAuth, useGrades, etc.)
│   ├── stores/                   # Zustand stores
│   ├── lib/                      # Utilities
│   └── styles/
│       └── globals.css           # Tailwind imports
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── Dockerfile
```

### 8.3 Module Dependency Rules (Batasan Import)

```
pages -> components, hooks, stores, api
components -> hooks, stores, lib
hooks -> api, stores, lib
api -> lib, @simma/shared
stores -> lib

DILARANG:
- api -> components (data layer tidak boleh tahu UI)
- components/ui -> stores (primitives harus stateless)
- pages -> db (FE tidak boleh akses DB langsung)
```

---

## 9. Backup & Recovery

### 9.1 Strategi Backup

| Tipe | Frekuensi | Retensi | Tool |
|---|---|---|---|
| Daily full dump | 02:00 WIB | 7 hari | pg_dump via cron container |
| Weekly full dump | Minggu 02:00 | 4 minggu | pg_dump |
| Monthly full dump | Tanggal 1 02:00 | 6 bulan | pg_dump |
| Manual backup | On-demand via UI | Unlimited (admin manages) | pg_dump + download |

### 9.2 Recovery

- Restore via UI: upload SQL dump -> restore to new database -> swap
- RTO (Recovery Time Objective): < 30 menit
- RPO (Recovery Point Objective): < 24 jam (worst case: data sejak backup terakhir hilang)
- File uploads (foto, dokumen) di-backup terpisah (rsync ke external drive)

---

## 10. Monitoring & Observability

- Fastify built-in request logging (pino) -> JSON ke stdout -> Docker logs
- Health check endpoint: GET /api/health -> { status: 'ok', db: 'connected', uptime }
- Disk space monitoring: alert jika < 10% free (cron script)
- PostgreSQL: pg_stat_activity untuk connection monitoring

Tidak perlu Prometheus/Grafana untuk skala ini. Log + health check cukup.

---

## 11. Security (Internet Publik)

### 11.1 Transport & Network

| Layer | Mekanisme |
|---|---|
| TLS | Caddy auto-provision Let's Encrypt cert, auto-renew. HSTS header. |
| Firewall (ufw) | Default deny. Allow: 22/tcp (SSH), 443/tcp (HTTPS). Tidak ada port lain terbuka. |
| SSH | Key-only auth (disable password auth). fail2ban: ban setelah 5 failed attempts, 1 jam. |
| Database | PostgreSQL hanya listen di docker internal network (127.0.0.1 / docker bridge). TIDAK exposed ke host port. |
| Docker | Container non-root. Read-only filesystem kecuali volume data. |

### 11.2 Application Security

| Concern | Mekanisme |
|---|---|
| Authentication | bcrypt hash (cost 12). JWT access token 15 menit + refresh token 7 hari (httpOnly cookie). |
| Brute-force login | Rate limit: 5 attempts per username per 15 menit. Lockout 30 menit setelah 10 failed. |
| API rate limiting | 100 req/menit per user (token bucket). 20 req/menit untuk unauthenticated. |
| CORS | Whitelist domain FE only (simma.namalembaga.sch.id). |
| Input validation | Zod schema di setiap endpoint. Reject unknown fields (`.strict()`). |
| SQL injection | Drizzle ORM parameterized queries — tidak ada raw SQL kecuali di migration. |
| XSS | React auto-escapes by default. CSP header via Caddy. Sanitize user-generated HTML (deskripsi TP/LM). |
| CSRF | SameSite=Strict cookie + custom header check. |
| File upload | Whitelist extension (jpg, png, pdf). Max 2MB. Virus scan basic (file magic byte check). Serve dari path terpisah, bukan dari API route. |
| Audit | Semua write operations logged: user_id, IP, timestamp, action, before/after value. |
| Sensitive data | NIK, NISN di-mask di log (***). Password hash TIDAK pernah di-return ke FE. |

### 11.3 Backup Security

- Backup dumps encrypted at rest (gpg symmetric)
- Backup download via UI memerlukan Super Admin auth + re-enter password
- Off-site backup: rsync ke cloud storage (opsional, per kebijakan madrasah)

---

## 12. Risiko Teknis & Mitigasi

| # | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| 1 | VPS provider down | Sistem tidak bisa diakses | Backup harian, siap restore ke VPS lain dalam < 1 jam |
| 2 | PostgreSQL crash | Data corruption | WAL + checkpoint, daily backup, restore tested |
| 3 | 50 guru concurrent input | Slow response | Connection pool (min 5, max 20), row-level locking, upsert pattern |
| 4 | Laptop guru freeze saat grid besar | UX buruk | TanStack Virtual, limit visible rows |
| 5 | Internet putus saat input nilai | Data hilang | IndexedDB queue, autosave, sync on reconnect |
| 6 | Format EMIS berubah | Export gagal | JSONB field, template configurable |
| 7 | Admin lupa password | Lockout | Super admin bisa reset password via CLI (docker exec) |
| 8 | PDF rapor lambat (36 siswa) | Wali kelas menunggu lama | Worker thread, generate async, progress bar |
| 9 | DDoS / brute-force dari internet | Overload server, data breach | Rate limiting, fail2ban, Cloudflare proxy (opsional) |
| 10 | SSL cert expired | Browser reject HTTPS | Caddy auto-renew (check 30 hari sebelum expiry) |
