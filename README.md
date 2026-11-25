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
│   ├── PRD.md              # Product Requirement Document & matriks RBAC
│   ├── ARCHITECTURE.md     # Topologi Ubuntu Server, ERD, dan mitigasi konkurensi
│   ├── UX-DESIGN.md        # Panduan token UI/UX & Tailwind styling
│   └── modules/            # PRD spesifik per modul (19 modul)
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

## Status Proyek: Tahap Testing & QA (Seluruh 19 Modul Selesai)

Pengembangan seluruh 19 modul madrasah (Wave 0 hingga Wave 10) telah selesai diimplementasikan pada Backend Fastify dan Frontend React Vite. Sistem saat ini berada pada **Tahap Pengujian Menyeluruh (Testing & Quality Assurance)**.

### Metrik Kualitas & Hasil Pengujian
- **Frontend Unit Tests (Vitest):** 18 test suite, 89 unit tests lulus (100% PASS).
- **Backend Unit Tests (Vitest):** Seluruh modul backend tervalidasi via vitest unit tests.
- **Type Safety (TypeScript):** `pnpm -r run typecheck` (tsc `--noEmit`) 0 error / bersih di kedua workspace (`simma-be` dan `simma-fe`).
- **Defensive Data Guards:** Seluruh payload API terstandardisasi dengan penanganan `unwrapData` dan proteksi non-array (`Array.isArray`) anti-crash di FE.

### Daftar Cakupan 19 Modul (Semua Siap Diuji)

#### Phase 1: MVP (Pondasi Administratif & Siklus Akademik)
- [x] **01. Auth & RBAC (`docs/modules/01-auth-rbac/`):** Autentikasi JWT, multi-role 11 peran madrasah, brute-force lockout, audit trail.
- [x] **02. Master Setup (`docs/modules/02-master-setup/`):** Profil lembaga, aktivasi atomik TA & Semester, rombel, 44 Mapel KMA 347/450, penugasan GTK.
- [x] **03. Tata Usaha & Persuratan (`docs/modules/03-tata-usaha-persuratan/`):** Agenda surat masuk, lembar disposisi Kamad, penomoran otomatis PMA 12/2024, generator surat dinas (SKAS, ST, SKKB) + QR Code.
- [x] **04. PPDB Madrasah (`docs/modules/04-ppdb-madrasah/`):** Portal akun mandiri calon siswa, seleksi 4 jalur Kemenag, upload berkas terisolasi, panel verifikasi TU, mutasi atomik calon siswa diterima ke Buku Induk.
- [x] **05. Kesiswaan & Buku Induk (`docs/modules/05-kesiswaan-buku-induk/`):** Buku Induk Abadi format EMIS 4.0, Buku Klapper A-Z, penempatan rombel semester, audit kelayakan data EMIS.
- [x] **06. Presensi Siswa (`docs/modules/06-presensi-siswa/`):** Presensi harian/mapel, pola default hadir, alert akumulasi alpha, rekap kehadiran ke rapor.
- [x] **07. Tahfidz & Tasmi' (`docs/modules/07-tahfidz-tasmi/`):** Setoran hafalan ziyadah/muraja'ah, penilaian 3 dimensi, ujian tasmi' per juz, heatmap capaian, syahadah.
- [x] **08. Penilaian Akademik (`docs/modules/08-penilaian-akademik/`):** Asesmen TP/LM & SAS, bobot fleksibel, grid spreadsheet, nilai akhir & deskripsi capaian KMA 347/450.
- [x] **09. Rapor & Legger RDM (`docs/modules/09-rapor-rdm/`):** Verifikasi kelengkapan nilai wali kelas, legger kelas, cetak rapor format resmi RDM Kemenag (PDF).

#### Phase 2: Extended (Kokurikuler, Kepondokan & Finansial)
- [x] **10. P5RA (`docs/modules/10-p5ra/`):** Kokurikuler Profil Pelajar Pancasila & Rahmatan Lil 'Alamin (10 nilai Kemenag), matriks penilaian 4 predikat, rapor P5RA.
- [x] **11. Mutaba'ah Yaumiyah (`docs/modules/11-mutabaah-yaumiyah/`):** Monitoring amalan ibadah harian santri (shalat berjamaah, tahajud, dhuha, tilawah, dzikir, puasa sunnah).
- [x] **12. Keuangan SPP & Billing (`docs/modules/12-keuangan-spp/`):** Billing massal bulanan, kasir cepat auto-suggest, kwitansi bernomor seri, dasbor tunggakan, dispensasi ujian.
- [x] **13. Kepegawaian GTK (`docs/modules/13-kepegawaian-gtk/`):** Profil pendidik & tenaga kependidikan EMIS/Simpatika, sertifikasi, verifikasi 24 JTM, arsip digital GTK.
- [x] **14. Jadwal Pelajaran (`docs/modules/14-jadwal-pelajaran/`):** Penjadwalan madrasah formal + diniyah pondok, deteksi bentrok seketika, multi-view jadwal.

#### Phase 3: Complete (Manajemen Lanjut & Ekosistem Nasional)
- [x] **15. Mutasi & Kelulusan (`docs/modules/15-mutasi-siswa/`):** Mutasi masuk, clearance bebas tanggungan 3 dimensi (SPP/perpus/tatib), surat pindah Kemenag, kelulusan XII.
- [x] **16. Tatib & Poin Kedisiplinan (`docs/modules/16-tatib-kedisiplinan/`):** Sistem kredit poin pelanggaran & reward prestasi, eskalasi SP-1 s/d SP-3, surat panggilan ortu, catatan BK.
- [x] **17. Ekstrakurikuler (`docs/modules/17-ekstrakurikuler/`):** Direktori ekskul, pendaftaran mandiri, presensi latihan mingguan, penilaian capaian rapor RDM.
- [x] **18. Integrasi & Ekspor EMIS 4.0 (`docs/modules/18-emis-export/`):** Pra-validasi kepatuhan data NIK/NISN, dasbor kesiapan data, ekspor format resmi portal EMIS Kemenag.
- [x] **19. Sarana Prasarana (`docs/modules/19-sarana-prasarana/`):** Inventarisasi gedung/ruang/alat, stiker QR Code fisik, alur peminjaman fasilitas, helpdesk kerusakan.

---

## Urutan Pengembangan (Development Waves)

Pengembangan mengutamakan **Fondasi Administratif Sekolah** (Tata Usaha, Persuratan, PPDB, Buku Induk) sebelum modul akademik harian:

1. **Wave 1 — Auth & Master Setup:** Autentikasi terpusat & konfigurasi lembaga (TA, Semester, Rombel, GTK, Mapel).
2. **Wave 2 — Tata Usaha & Persuratan:** Agenda surat masuk/keluar, disposisi Kamad, penomoran resmi Kemenag, generator surat dinas.
3. **Wave 3 — Pintu Masuk Kesiswaan (PPDB):** Pendaftaran mandiri calon siswa, berkas persyaratan, verifikasi TU, mutasi atomik ke Buku Induk.
4. **Wave 4 — Kesiswaan & Buku Induk Siswa:** Master data siswa EMIS 4.0, Buku Klapper, penempatan rombel, riwayat mutasi.
5. **Wave 5 — Pembiasaan & Aktivitas Harian (Presensi & Tahfidz):** Presensi harian/mapel, setoran hafalan Al-Qur'an santri & ujian tasmi'.
6. **Wave 6 — Asesmen & Penilaian Kurikulum Merdeka:** Input nilai TP/LM/SAS, formula capaian kompetensi KMA 347/450.
7. **Wave 7 — Pelaporan Akhir Semester (Rapor RDM):** Legger nilai kelas, verifikasi kelulusan semester, cetak rapor resmi Kemenag (PDF).

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

# 4. Migrate & Seed DB
pnpm --filter simma-be run db:generate
pnpm --filter simma-be run db:migrate
pnpm --filter simma-be run db:seed

# 5. Dev
pnpm dev:be &   # Terminal 1
pnpm dev:fe     # Terminal 2
```

### Kredensial Login Internal GTK (Development / Seed)

Setelah menjalankan `pnpm --filter simma-be run db:seed` (sumber: `simma-be/src/db/seed.ts`), sistem autentikasi baru menggunakan **Kode Unik 4 Digit Angka** (`2 digit gugus tugas + 2 digit nomor urut`) sebagai **Username dan Password awal**.

> Guru dan Tenaga Kependidikan **tidak dapat mengubah password sendiri**; pembuatan akun, penerbitan kode, reset password, dan delegasi tugas (Wali Kelas / Guru Mapel / Pembina Ekskul) dikelola sepenuhnya oleh **Operator** melalui modul Kepegawaian GTK (`/teachers`).

| Kode (Username & Password) | Role Utama (`users.role`) | Role Tambahan / Delegasi Tugas | Keterangan |
|---|---|---|---|
| `1001` | `super_admin` | — | Super Admin Sistem |
| `1101` | `operator` | — | Operator Madrasah (Pengelola Akun & Kepegawaian GTK) |
| `1201` | `kepala_madrasah` | — | Kepala Madrasah (Drs. H. Ahmad Fauzi, M.Pd.I) |
| `1301` | `admin_tu` | — | Staf Tata Usaha (Bambang Triyono, S.Sos.) |
| `2101` | `wali_kelas` | `guru_mapel` | Wali Kelas **Kelas XI** & Guru Mapel Fikih Kelas XI |
| `2201` | `guru_mapel` | — | Guru Mapel Al-Qur'an Hadis **Kelas X** |
| `2301` | `guru_diniyah` | — | Guru Diniyah / Bahasa Arab |
| `2401` | `guru_tahfidz` | `wali_kelas` | Pembina Tahfidz & Wali Kelas **Kelas XII** |
| `2501` | `guru_bk` | — | Guru Bimbingan Konseling (Layanan Konseling Privat) |
| `2601` | `waka_kurikulum` | `wali_kelas`, `guru_mapel` | Waka Kurikulum, Wali Kelas **Kelas X**, & Guru Mapel Matematika |
| `2701` | `waka_kesiswaan` | — | Waka Kesiswaan |
| `2801` | `waka_sarpras` | — | Waka Sarana & Prasarana |
| `3101` | `pembina_ekskul` | — | Pembina Ekskul **Pramuka** & **Paskibra** |
| `3201` | `musyrif` | — | Musyrif / Pendamping Asrama |
| `3301` | `bendahara` | — | Bendahara Madrasah (Kasir POS SPP) |

> **Catatan:** Kredensial di atas hanya untuk environment development/testing lokal. Segera reset kode / nonaktifkan akun dummy sebelum deployment produksi.

---

## Verification & Testing Suite

Jalankan seluruh pengujian dan pengecekan kode:

```bash
# 1. Typecheck (TypeScript strict mode)
pnpm -r run typecheck

# 2. Unit Testing (Vitest - Backend & Frontend)
pnpm -r run test

# Jalankan pengujian per workspace:
pnpm --filter simma-fe exec vitest run     # 18 test suite, 89 unit tests frontend
pnpm --filter simma-be exec vitest run     # Unit tests controller & service backend

# 3. Linter
pnpm -r run lint

# 4. Production Build
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
