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
- [ ] Phase 5: Gerbang Persetujuan (Gate Approval) sebelum inisiasi folder `simma-be` & `simma-fe`.
