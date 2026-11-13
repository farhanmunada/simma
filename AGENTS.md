# AGENTS.md — SIMMA

> Aturan universal untuk semua agent (Leader + Worker) yang bekerja di project SIMMA.
> Knowledge base lintas-projek: `C:\Users\vola\agentVault`

---

## 1. Aturan Inti (Wajib Dipatuhi)

1. **Keamanan deny-first** — jangan baca/tulis/cetak/commit file rahasia (`.env`, `.env.*`, `*.pem`, `id_rsa`, token cloud).
2. **Jangan curangi tes** — perbaiki kode bisnis, bukan asersi tes.
3. **Jangan halusinasi dependensi** — stdlib → terpasang → mandiri → minta izin Leader.
4. **Batas 3 kali** — gagal 3x: stop, rollback via git, lapor ke Leader.
5. **Jangan klaim selesai palsu** — linter, build, typecheck, test harus hijau.
6. **Tulis ke file, bukan chat** — riset/arsitektur ke `docs/`. Chat maks 5 baris status.
7. **Jangan mengarang fakta** — klaim wajib punya sumber. Belum yakin → "belum diverifikasi".
8. **Agnostik platform** — project ini decoupled monorepo: Fastify BE + React Vite FE.

---

## 2. Spesifikasi Project

- **Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)
- **Stack BE:** Fastify 5, Drizzle ORM, PostgreSQL 16, Zod, JWT (jose)
- **Stack FE:** React 19, Vite 6, React Router 7, Tailwind CSS, Headless UI, Zustand, TanStack Query, TanStack Table, React Hook Form
- **Shared:** pnpm workspaces, `packages/shared` (Zod schemas, types, constants)
- **Bahasa kode & komentar:** Inggris
- **Bahasa docs/:** Indonesia (istilah teknis tetap Inggris)

---

## 3. Struktur Monorepo

```
D:\Coding\simma\              <- Root monorepo (Leader: main branch)
├── simma-be/                 <- Backend Fastify
├── simma-fe/                 <- Frontend React Vite
├── packages/
│   └── shared/               <- Shared Zod schemas, types, constants
├── docs/                     <- PRD, ARCHITECTURE, UX-DESIGN, RESEARCH
├── docker-compose.yml
├── pnpm-workspace.yaml
├── AGENTS.md                 <- File ini
└── README.md
```

---

## 4. Aturan Orchestration (Orca)

### 4.1 Model Assignment

| Role | Model | Fallback |
|---|---|---|
| Leader | `tinker-claude` | `worker-gemini` |
| Worker (coding) | `worker-gemini` | — |
| Worker (review & security) | `worker-gemini` | — |

### 4.2 Wave-Based Development (Prioritas Administratif Sekolah)

Pengembangan mengutamakan penyelesaian **Fondasi Administratif Sekolah** (Tata Usaha, Persuratan, PPDB, Buku Induk Siswa) sebelum modul akademik harian. Urutan wave:

| Wave | Worker | Modul | Boundary & Ketergantungan |
|---|---|---|---|
| 0 | Leader saja | Monorepo init, DB, shared types, auth core, migration setup | — |
| 1 | Worker A + B | (A) `01-auth-rbac`, (B) `02-master-setup` (TA, Semester, Kelas, Mapel, GTK) | Wave 0 |
| 2 | Worker C + D | (C) `03-tata-usaha-persuratan` (Surat Masuk/Keluar, Disposisi, Naskah Dinas), (D) `04-ppdb-madrasah` (Portal Calon Siswa & Seleksi) | Wave 1 |
| 3 | Worker E | `05-kesiswaan-buku-induk` (Buku Induk EMIS 4.0, Rombel, Mutasi dari PPDB) | Wave 2 |
| 4 | Worker F + G | (F) `06-presensi-siswa`, (G) `07-tahfidz-tasmi` | Wave 3 |
| 5 | Worker H + I | (H) `08-penilaian-akademik`, (I) `09-rapor-rdm` (PDF RDM Kemenag) | Wave 4 |
| 6 | Worker J + K | (J) `10-p5ra` (Kokurikuler & Rapor P5RA), (K) `11-mutabaah-yaumiyah` (Amalan Harian Santri) | Wave 5 |
| 7 | Worker L + M | (L) `12-keuangan-spp` (Billing Kasir & SPP), (M) `13-kepegawaian-gtk` (Simpatika/24 JTM) | Wave 1 & 5 |
| 8 | Worker N | `14-jadwal-pelajaran` (Jadwal Dual-Kurikulum & Anti-Bentrok) | Wave 1 & 7 |
| 9 | Worker O + P | (O) `15-mutasi-siswa` (Mutasi & Kelulusan), (P) `16-tatib-kedisiplinan` (Poin & BK) | Wave 3 & 7 |
| 10 | Worker Q + R | (Q) `17-ekstrakurikuler` (Ekskul & Nilai Rapor), (R) `18-emis-export` (Sinkronisasi EMIS 4.0), (S) `19-sarana-prasarana` (Aset QR & Tiket) | Wave 3, 5 & 9 |

Setiap selesai wave → Worker Review & Security → Leader merge → wave berikutnya.

### 4.3 Git Worktree

```bash
# Leader bikin worktree per worker
git worktree add ../simma-wt/feat-auth -b feat/auth
git worktree add ../simma-wt/feat-setup -b feat/setup
# dst per wave

# Setelah merge
git worktree remove ../simma-wt/feat-auth
```

- Orca otomatis buka terminal per worktree, tutup setelah selesai.
- Worker kerja di folder worktree-nya, BUKAN di `D:\Coding\simma\`.

### 4.4 Aturan Worker

1. **Hanya edit file di dalam folder modul sendiri.**
   - Contoh Worker Auth: hanya edit `simma-be/src/modules/auth/*` dan file terkait.
   - DILARANG edit: `simma-be/src/core/*`, `packages/shared/*`, file worker lain.
2. **Dilarang merge ke `main`.** Leader yang merge.
3. **Dilarang `git push --force`.**
4. **Commit atomik konvensional:** `feat(auth): add login endpoint`, `fix(grades): fix null check`.
5. **Jika butuh perubahan di `core/` atau `shared/`:** lapor ke Leader, jangan edit sendiri.
6. **Jika ada konflik:** Leader akan sync `main` ke branch worker → worker resolve → push ulang.
7. **Baca vault node yang relevan** sebelum mulai coding (lihat Section 7).

### 4.5 Worker Review & Security

Berjalan sebagai gatekeeper setelah setiap wave selesai. Tugas:
1. Review semua branch worker wave tersebut.
2. Gunakan checklist: `C:\Users\vola\agentVault\03-Implementation-and-Clean-Code\04-code-review-checklist.md`
3. Cek: dead code, security (S1-S6), correctness (C1-C6), data integrity (D1-D4).
4. Laporan format terstruktur (lihat vault checklist Section 3).
5. FAIL → kirim balik ke worker. PASS → Leader merge.

---

## 5. File Boundary per Modul

| Modul | Folder BE | Folder FE | DB Schema |
|---|---|---|---|
| 01. Auth & RBAC | `src/modules/auth/` | `src/features/auth/` | `src/db/schema/users.ts` |
| 02. Setup | `src/modules/setup/` | `src/features/settings/` | `src/db/schema/setup.ts` |
| 03. Tata Usaha & Surat | `src/modules/letters/` | `src/features/letters/` | `src/db/schema/letters.ts` |
| 04. PPDB Madrasah | `src/modules/ppdb/` | `src/features/ppdb/` | `src/db/schema/ppdb.ts` |
| 05. Kesiswaan (Buku Induk) | `src/modules/students/` | `src/features/students/` | `src/db/schema/students.ts` |
| 06. Presensi | `src/modules/attendance/` | `src/features/attendance/` | `src/db/schema/attendance.ts` |
| 07. Tahfidz | `src/modules/tahfidz/` | `src/features/tahfidz/` | `src/db/schema/tahfidz.ts` |
| 08. Input Nilai | `src/modules/grades/` | `src/features/grades/` | `src/db/schema/grades.ts` |
| 09. Rapor RDM | `src/modules/reports/` | `src/features/reports/` | Konsumsi data grades & students |
| 10. P5RA | `src/modules/p5ra/` | `src/features/p5ra/` | `src/db/schema/p5ra.ts` |
| 11. Mutaba'ah Yaumiyah | `src/modules/mutabaah/` | `src/features/mutabaah/` | `src/db/schema/mutabaah.ts` |
| 12. Keuangan & SPP | `src/modules/finance/` | `src/features/finance/` | `src/db/schema/finance.ts` |
| 13. Kepegawaian GTK | `src/modules/teachers/` | `src/features/teachers/` | `src/db/schema/teachers.ts` |
| 14. Jadwal Pelajaran | `src/modules/schedules/` | `src/features/schedules/` | `src/db/schema/schedules.ts` |
| 15. Mutasi Siswa | `src/modules/transfers/` | `src/features/transfers/` | `src/db/schema/transfers.ts` |
| 16. Tatib & Disiplin | `src/modules/discipline/` | `src/features/discipline/` | `src/db/schema/discipline.ts` |
| 17. Ekstrakurikuler | `src/modules/extracurricular/` | `src/features/extracurricular/` | `src/db/schema/extracurricular.ts` |
| 18. Ekspor EMIS 4.0 | `src/modules/emis/` | `src/features/emis/` | Konsumsi data agregat students/gtk |
| 19. Sarana Prasarana | `src/modules/facilities/` | `src/features/facilities/` | `src/db/schema/facilities.ts` |

---

## 6. File Pattern per Modul (Konvensi Penamaan)

### BE (Fastify)
```
src/modules/<module>/
├── <module>.routes.ts        # Route definitions
├── <module>.controller.ts    # HTTP parse & response
├── <module>.service.ts       # Business logic
├── <module>.repository.ts    # Drizzle queries
├── <module>.schema.ts        # Zod input/output DTOs
├── <module>.types.ts         # Type definitions
└── <module>.spec.ts          # Co-located unit test
```

### FE (React Vite)
```
src/features/<feature>/
├── components/               # Feature-specific components
├── hooks/                    # Custom hooks
├── api/<feature>.api.ts      # TanStack Query hooks + fetch
├── stores/<feature>.store.ts # Zustand store (if needed)
├── types.ts
└── index.ts                  # Public barrel export
```

---

## 7. Referensi Vault (Baca Sesuai Kebutuhan)

**WAJIB baca sebelum mulai coding:**

| Konteks | Vault Node |
|---|---|
| Semua agent | `agentVault/01-Core-Rules/non-negotiables.md` |
| Git & branching | `agentVault/01-Core-Rules/git-discipline.md` |
| System design & error handling | `agentVault/02-Architecture-and-Tech/02-system-design.md` |
| Clean code | `agentVault/03-Implementation-and-Clean-Code/01-clean-code-standards.md` |
| File structure | `agentVault/03-Implementation-and-Clean-Code/02-file-structure-patterns.md` |
| Code review (Worker Review) | `agentVault/03-Implementation-and-Clean-Code/04-code-review-checklist.md` |
| Testing | `agentVault/04-Quality-and-Repeated-Testing/01-multi-stage-testing.md` |
| Security | `agentVault/04-Security/risk-tiers-and-sandboxing.md` |

**Spesifikasi project (tersedia di `docs/`):**

| Doc | Isi |
|---|---|
| `docs/modules/<nomor>-<modul>/PRD.md` | PRD granular per modul, aturan validasi, kriteria penerimaan |
| `docs/modules/README.md` | Peta ketergantungan dan alur integrasi antar-modul |
| `docs/PRD.md` | Overview sistem, domain model makro, modul fungsional |
| `docs/ARCHITECTURE.md` | Tech stack, mitigasi konkurensi, file structure monorepo |
| `docs/UX-DESIGN.md` | UI/UX patterns, component specs, Tailwind CSS v4 |
| `docs/RESEARCH.md` & `RESEARCH_PPDB.md` | Regulasi Kemenag (KMA 347/450, PMA 12/2024, EMIS, RDM, SNPDB) |

---

## 8. Project Logs (Vault)

Semua log disimpan di vault untuk evaluasi lintas-projek:

| Log | Path | Isi |
|---|---|---|
| Keputusan | `agentVault/99-Project-Logs/simma/decisions.md` | Keputusan arsitektur + alasan |
| Bug registry | `agentVault/99-Project-Logs/simma/bugs.md` | Bug, root cause, fix, worker |
| Agent eval | `agentVault/99-Project-Logs/simma/agent-eval.md` | Performa worker per wave |

**Aturan log:**
- Bug ditemukan → catat di `bugs.md` (modul, deskripsi, root cause, fix, worker yang bikin).
- Keputusan teknis penting → catat di `decisions.md`.
- Setelah wave selesai → Leader evaluasi worker di `agent-eval.md`.

---

## 9. Perintah Verifikasi

```bash
# Typecheck
pnpm -r run typecheck          # atau: pnpm --filter simma-be exec tsc --noEmit

# Lint
pnpm -r run lint

# Test
pnpm -r run test

# Build
pnpm -r run build

# Database
pnpm --filter simma-be run db:generate   # Generate Drizzle migration
pnpm --filter simma-be run db:migrate    # Run migration
```

---

## 10. Matriks Perizinan

| Risiko | Aksi | Kebijakan |
|---|---|---|
| Rendah | read, grep, glob, git status/diff, unit test | Auto-allow |
| Sedang | edit kode di modul sendiri, tambah file baru | Auto-allow (dalam boundary) |
| Sedang | edit `core/`, `shared/`, dependency baru | Lapor ke Leader |
| Tinggi | `rm -rf`, `git push -f`, edit `.env`, drop DB | DILARANG |

---

## 11. Alur Kerja Worker

```
1. Baca AGENTS.md
2. Baca vault node yang relevan (Section 7)
3. Baca docs/ yang relevan (PRD, ARCHITECTURE)
4. Coding di folder modul sendiri (Section 5)
5. Self-review pakai vault checklist
6. Typecheck + lint + test hijau
7. Commit atomik konvensional
8. Lapor ke Leader: "modul X selesai, branch feat/X"
```

---

## 12. Alur Kerja Leader

```
1. Wave 0: setup fondasi di main
2. Bikin worktree per worker wave N
3. Kirim job spec ke Orca (modul, boundary, vault refs)
4. Tunggu worker selesai
5. Trigger Worker Review & Security
6. Review PASS → merge branch ke main
7. Review FAIL → kirim balik ke worker + detail temuan
8. Cleanup worktree, sync main
9. Catat evaluasi di agent-eval.md
10. Mulai wave N+1
```

---

## 13. Aturan Wajib Clean Code (Enforced Post-Audit)

Seluruh agent pengembang (Worker maupun Leader) **WAJIB** mematuhi 6 aturan dasar clean code berikut (merujuk audit `docs/CODE_REVIEW.md`):

### 13.1 Batas Maksimal 300 Baris (LOC) per File (Anti God-Component)
- File komponen UI, service, atau repository **DILARANG melebihi 300 baris kode**.
- Jika suatu fitur memiliki formulir multi-langkah (*wizard*), tabel data, kartu metrik, atau modal interaktif, **WAJIB dipecah** menjadi sub-komponen terisolasi dalam folder `components/`.
- Pisahkan state kompleks atau mutasi query panjang ke dalam custom hooks tersendiri (`hooks/use<Feature>.ts`).
- Dilarang keras menaruh CSS cetak (@media print) atau tata letak cetak dokumen fisik ratusan baris langsung di dalam komponen halaman utama; buat berkas layout cetak terpisah (contoh: `<Feature>PrintLayout.tsx`).

### 13.2 Berkas `types.ts` Wajib 100% Deklaratif
- Berkas `types.ts` hanya boleh berisi definisi tipe TypeScript murni: `type`, `interface`, dan `enum` Zod infer.
- **DILARANG KERAS** menyisipkan fungsi manipulasi DOM (`document.createElement`, manipulasi blob browser), fungsi pembantu kalkulasi, atau pemanggilan API di dalam `types.ts`.
- Tempatkan fungsi penolong/utilitas di `src/lib/` atau direktori `utils/` modul terkait.

### 13.3 Wajib Menggunakan Centralized API Endpoints Registry
- Dilarang keras *hardcoded* string URL endpoint di dalam API client atau komponen (contoh: `apiClient("/ppdb/applicants")` ❌).
- Seluruh endpoint wajib didaftarkan dan dikonsumsi melalui konstanta terpusat `API_ENDPOINTS` di `simma-fe/src/config/endpoints.ts` (contoh: `apiClient(API_ENDPOINTS.PPDB.APPLICANTS)` ✔️).

### 13.4 Integritas Transaksi Database Atomik (Multi-Table)
- Setiap operasi mutasi data di backend yang melibatkan 2 tabel atau lebih (misal: mutasi kelulusan pendaftar PPDB ke tabel `students`, `parents`, `studentParents`, dan update status `ppdbApplicants`) **WAJIB dibungkus transaksi atomik**:
  ```ts
  await db.transaction(async (tx) => {
    // operasi mutasi aman menggunakan tx
  });
  ```
- Dilarang menjalankan serangkaian `insert` tanpa transaksi yang dapat menyebabkan *partial write* saat terjadi kegagalan.

### 13.5 Prinsip DRY & Single Source of Truth
- Skema validasi DTO, enum domain, konstanta status, dan formula skor/bobot madrasah dilarang diduplikasi secara terpisah di FE dan BE.
- Wajib didefinisikan satu kali di `packages/shared` (`@simma/shared`) lalu dikonsumsi bersama oleh `simma-be` dan `simma-fe`.

### 13.6 Standardisasi Konsumsi API & Penanganan Error
- FE dilarang memanipulasi struktur response secara ad-hoc per-fitur jika sudah ditangani oleh wrapper `apiClient`.
- Backend wajib melempar error menggunakan hierarki `AppError` terstruktur (`NotFoundError`, `BadRequestError`, `ForbiddenError`, `ConflictError`) agar HTTP status code dan format pesan error konsisten.

