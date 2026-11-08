# Direktori Modul & Spesifikasi Kebutuhan SIMMA

Dokumentasi spesifikasi kebutuhan produk (PRD), rancangan arsitektur, diagram aktivitas, dan ERD disusun secara modular per folder di `docs/modules/<nomor>-<nama-modul>/` sesuai urutan tahapan implementasi sistem.

---

## Urutan Pengembangan Modul Sistem (Development Sequence)

```
[01. Auth & RBAC]
       │
       ▼
[02. Master Setup] ─── (Tahun Ajaran, Semester, Rombel, GTK, Mapel)
       │
       ├─────────────────────────────────────────┐
       ▼                                         ▼
[03. Tata Usaha & Persuratan]            [04. PPDB Madrasah]
(Surat Masuk, Disposisi, Surat Keluar)   (Pendaftaran, Berkas, Seleksi)
       │                                         │
       │                                         ▼ (Mutasi Atomik)
       └────────────────────────────────> [05. Kesiswaan & Buku Induk]
                                                 │
                                                 ▼
                                         [06. Presensi Siswa]
                                                 │
                                                 ▼
                                         [07. Tahfidz & Tasmi']
                                                 │
                                                 ▼
                                         [08. Penilaian Akademik]
                                                 │
                                                 ▼
                                         [09. Rapor & Legger RDM]
```

---

## Daftar Status Dokumen Modul

| No | Modul | Fokus Bisnis Utama | Dokumen Tersedia |
|---|---|---|---|
| **01** | `01-auth-rbac` | Autentikasi, JWT stateless, 11 peran madrasah, brute-force lockout, audit trail. | [PRD.md](./01-auth-rbac/PRD.md) |
| **02** | `02-master-setup` | Profil lembaga, aktivasi atomik TA & Semester, rombel, 44 Mapel KMA 347/450, penugasan GTK. | [PRD.md](./02-master-setup/PRD.md) |
| **03** | `03-tata-usaha-persuratan` | Agenda surat masuk, lembar disposisi Kamad, penomoran otomatis PMA 12/2024, generator surat dinas (SKAS, ST, SKKB) + QR Code. | [PRD.md](./03-tata-usaha-persuratan/PRD.md) |
| **04** | `04-ppdb-madrasah` | Portal akun mandiri calon siswa, seleksi 4 jalur Kemenag, upload berkas terisolasi, panel verifikasi TU, mutasi atomik calon siswa diterima ke Buku Induk. | [PRD.md](./04-ppdb-madrasah/PRD.md) |
| **05** | `05-kesiswaan-buku-induk` | Buku Induk Abadi format EMIS 4.0 Kemenag, Buku Klapper A-Z, alokasi NIS stambuk, penempatan rombel semester, validasi pra-audit EMIS. | [PRD.md](./05-kesiswaan-buku-induk/PRD.md) |
| **06** | `06-presensi-siswa` | Presensi harian/mapel, pola default hadir, alert akumulasi alpha, rekap kehadiran ke rapor. | *Upcoming* |
| **07** | `07-tahfidz-tasmi` | Setoran hafalan ziyadah/muraja'ah, penilaian 3 dimensi, ujian tasmi' per juz, heatmap capaian. | *Upcoming* |
| **08** | `08-penilaian-akademik` | Asesmen TP/LM & SAS, bobot fleksibel, grid nilai spreadsheet, nilai akhir & deskripsi capaian KMA 347/450. | *Upcoming* |
| **09** | `09-rapor-rdm` | Verifikasi kelengkapan nilai, legger kelas, cetak rapor format resmi RDM Kemenag (PDF). | *Upcoming* |

---

## Standar Isi per Folder Modul
Setiap folder modul memuat:
1. `PRD.md` — Spesifikasi kebutuhan bisnis, aktor, aturan validasi, dan acceptance criteria.
2. `ARCHITECTURE.md` — Kontrak API endpoint, DTO Zod, alur service, state machine.
3. `activity-diagram.html` — Diagram aktivitas workflow aktor via `archify`.
4. `erd.html` — Diagram skema entitas basis data via `archify`.
