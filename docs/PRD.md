# PRD: Product Requirement Document SIMMA

**Tanggal:** 2026-11-07
**Status:** Draft
**Versi:** 2.0
**Domain:** Sistem Informasi Madrasah Aliyah
**Referensi:** [RESEARCH.md](RESEARCH.md) | [UX-DESIGN.md](UX-DESIGN.md) | [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 1. Visi Produk

SIMMA adalah sistem informasi terpadu untuk Madrasah Aliyah yang mengelola seluruh siklus akademik, kesiswaan, keuangan, dan pelaporan sesuai regulasi Kemenag RI — dirancang agar guru dengan literasi digital rendah bisa mengoperasikannya dengan cepat dan tanpa ribet.

---

## 2. Pengguna & Peran (RBAC)

### 2.1 Matriks Peran

| Peran | Deskripsi | Jumlah per MA |
|---|---|---|
| Super Admin / Proktor | Setup awal, EMIS sync, backup, kelola akun | 1-2 |
| Kepala Madrasah (Kamad) | Dashboard monitoring, approval, tanda tangan rapor | 1 |
| Waka Kurikulum | Monitoring input nilai, setup jadwal & mapel | 1 |
| Waka Kesiswaan | Tatib, poin pelanggaran, ekskul, presensi overview | 1 |
| Waka Sarpras | Inventaris, data ruangan | 1 |
| Guru Mapel | Input nilai, presensi, deskripsi TP/LM | 20-40 |
| Wali Kelas | Verifikasi nilai, catatan, cetak rapor | 12 (1/kelas) |
| Guru Tahfidz | Input setoran hafalan | 2-5 |
| Pembina Ekskul | Input nilai ekskul | 3-8 |
| Admin TU | PPDB, mutasi, SPP, cetak surat, data EMIS | 1-3 |
| Bendahara | Keuangan SPP & laporan | 1 |

### 2.2 Matriks Akses per Modul

| Modul | Super Admin | Kamad | Waka Kur | Waka Sis | Guru | Wali Kelas | Admin TU | Bendahara |
|---|---|---|---|---|---|---|---|---|
| Dashboard | Full | Full | Akademik | Kesiswaan | Sendiri | Kelasnya | Operasional | Keuangan |
| Presensi | R | R | R | RW | RW (kelasnya) | R (kelasnya) | R | - |
| Input Nilai | R | R | R | - | RW (mapel+kelasnya) | R (kelasnya) | - | - |
| Rapor | Full | R+Sign | R | - | - | RW+Print | - | - |
| P5RA | Full | R | R | - | RW | R | - | - |
| Data Siswa | Full | R | R | R | R (kelasnya) | R (kelasnya) | RW | - |
| PPDB | Full | Approve | - | - | - | - | RW | - |
| Mutasi | Full | Approve | - | - | - | - | RW | - |
| Tahfidz | Full | R | R | - | RW (penguji) | R | - | - |
| Tatib/Poin | Full | R | - | RW | R | R (kelasnya) | - | - |
| Ekskul | Full | R | - | R | RW (pembinannya) | - | - | - |
| SPP | Full | R+Report | - | - | - | - | RW | RW+Report |
| Data GTK | Full | R | R | - | R (profilnya) | R (profilnya) | RW | - |
| Jadwal | Full | R | RW | - | R | R | R | - |
| Sarana Prasarana | Full | R | - | - | - | - | RW | - |
| EMIS Sync | Full | - | - | - | - | - | R | - |
| Pengaturan | Full | R | - | - | - | - | - | - |
| Akun | Full | - | - | - | - | - | - | - |

R = Read, RW = Read/Write, Full = CRUD + admin

### 2.3 Aturan Akses

- Guru HANYA bisa akses kelas yang diampu (berdasarkan jadwal mengajar)
- Wali Kelas HANYA bisa akses kelas perwaliannya
- Waka Kurikulum bisa lihat semua data akademik, tidak bisa edit nilai
- Kamad bisa lihat semua, tidak bisa edit data — hanya approve
- Super Admin bisa semua, termasuk impersonate user lain untuk troubleshoot

---

## 3. Modul Fungsional — Detail

### 3.1 Modul Presensi Siswa

**Deskripsi:** Pencatatan kehadiran harian siswa per mata pelajaran atau per hari (konfigurasi madrasah).

**Fungsionalitas:**
- F-PRE-01: Default semua siswa hadir, guru hanya tap yang tidak hadir
- F-PRE-02: Status: H (Hadir), S (Sakit), I (Izin), A (Alpha), T (Terlambat)
- F-PRE-03: Auto-select kelas berdasarkan jadwal saat ini
- F-PRE-04: Rekap presensi per siswa per bulan/semester
- F-PRE-05: Rekap presensi per kelas per hari
- F-PRE-06: Alert untuk siswa yang alpha > 3x berturut-turut
- F-PRE-07: Data presensi masuk ke rapor (field Ketidakhadiran: Sakit/Izin/Alpha)
- F-PRE-08: Riwayat presensi bisa diedit (dengan audit trail)
- F-PRE-09: Export rekap presensi ke Excel

**Validasi:**
- Presensi tidak bisa diisi untuk tanggal di masa depan
- Presensi ganda (guru sama, kelas sama, tanggal sama, jam sama) dicegah
- Presensi hari libur/tanggal merah dicegah (berdasarkan kalender akademik)

### 3.2 Modul Input Nilai (Asesmen Sumatif & SAS)

**Deskripsi:** Input, kalkulasi, dan pengelolaan nilai akademik sesuai formula RDM Kemenag.

**Fungsionalitas:**
- F-NIL-01: Grid spreadsheet — baris siswa, kolom asesmen sumatif per TP/LM
- F-NIL-02: Inline edit (klik sel, ketik, Tab/Enter pindah)
- F-NIL-03: Auto-calculate rata-rata sumatif dan nilai rapor sesuai bobot
- F-NIL-04: Setting bobot per guru per mapel (default 75:25, configurable)
- F-NIL-05: Deskripsi Tujuan Pembelajaran (TP/LM) per sumatif — wajib diisi sebelum input nilai
- F-NIL-06: Batas ketercapaian per sumatif (warna hijau/merah otomatis)
- F-NIL-07: Autosave per sel (debounce 500ms)
- F-NIL-08: Undo/Redo per sesi
- F-NIL-09: Progress bar: "28/36 siswa terisi"
- F-NIL-10: Status "Draft" vs "Dikirim" — guru kirim nilai, wali kelas verifikasi
- F-NIL-11: Deskripsi capaian kompetensi auto-generated dari TP/LM tertinggi & terendah
- F-NIL-12: Import nilai dari CSV/Excel (format RDM compatible)
- F-NIL-13: Export nilai ke CSV/Excel
- F-NIL-14: Audit trail perubahan nilai (siapa, kapan, dari-ke)

**Formula:**
```
Nilai_Rapor = (Rata2_Sumatif x Bobot_S + Nilai_SAS x Bobot_SAS) / (Bobot_S + Bobot_SAS)
```

**Validasi:**
- Range nilai: 0-100 (integer)
- Tidak bisa kirim nilai jika ada siswa yang belum lengkap
- Deskripsi TP/LM wajib diisi sebelum input nilai (tidak boleh kosong)

### 3.3 Modul Rapor & Legger

**Deskripsi:** Generate, preview, dan cetak rapor sesuai format PDF RDM Kemenag.

**Fungsionalitas:**
- F-RAP-01: Generate PDF rapor per siswa sesuai format RDM (lihat RESEARCH.md Bagian 3.6)
- F-RAP-02: Preview rapor di browser sebelum cetak
- F-RAP-03: Batch print rapor per kelas
- F-RAP-04: Input catatan wali kelas (per siswa, per semester)
- F-RAP-05: Input sikap spiritual & sosial (deskripsi naratif)
- F-RAP-06: Input data ekstrakurikuler (dari pembina ekskul)
- F-RAP-07: Input prestasi siswa
- F-RAP-08: Data ketidakhadiran auto-populated dari modul presensi
- F-RAP-09: Verifikasi wali kelas — checklist "Semua nilai lengkap?"
- F-RAP-10: Legger per kelas (rekap semua mapel semua siswa) — PDF + Excel
- F-RAP-11: Rekap Nilai akumulatif (Kelas X s/d XII) — PDF + Excel
- F-RAP-12: Rapor P5RA terpisah — format sesuai Kemenag
- F-RAP-13: Watermark & barcode otomatis
- F-RAP-14: Logo Kemenag + logo madrasah di kop (upload via pengaturan)
- F-RAP-15: Tanda tangan digital Kamad & Wali Kelas (gambar TTD upload)

**Dependency:**
- Semua guru mapel di kelas tersebut harus sudah "Kirim Nilai" (status 100%)
- Pembina ekskul harus sudah input nilai ekskul
- Data presensi harus sudah lengkap

### 3.4 Modul P5RA

**Deskripsi:** Pencatatan dan pelaporan Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil 'Alamin.

**Fungsionalitas:**
- F-P5R-01: Setup projek per semester (2-3 projek, tema berbeda)
- F-P5R-02: Mapping projek ke dimensi/elemen P5 dan nilai P5RA
- F-P5R-03: Input penilaian per siswa per projek: 4 predikat (MB, SB, BSH, SAB)
- F-P5R-04: Deskripsi capaian naratif per dimensi
- F-P5R-05: Generate rapor P5RA terpisah (PDF)
- F-P5R-06: Rekap per kelas

### 3.5 Modul Data Siswa & PPDB

**Deskripsi:** Pengelolaan data pokok peserta didik sesuai format EMIS 4.0.

**Fungsionalitas:**
- F-SIS-01: CRUD data siswa sesuai field EMIS 4.0 (lihat RESEARCH.md Bagian 4.4)
- F-SIS-02: 6 field identitas terkunci (NIK, Nama, Tempat/Tgl Lahir, Jenis Kelamin, Nama Ibu) — hanya Super Admin
- F-SIS-03: PPDB: pencarian siswa dari EMIS (NIK/NISN/Nama+TTL)
- F-SIS-04: Assign siswa ke rombel
- F-SIS-05: Kenaikan kelas batch (akhir tahun ajaran)
- F-SIS-06: Kelulusan batch
- F-SIS-07: Data orang tua (ayah, ibu, wali) lengkap sesuai EMIS
- F-SIS-08: Upload foto siswa (jpg/png, maks 2MB)
- F-SIS-09: Upload dokumen (KK, KIP) — pdf/jpg/png
- F-SIS-10: Pencarian & filter siswa (nama, kelas, status, NIS, NISN)
- F-SIS-11: Export data siswa ke CSV (format EMIS compatible)
- F-SIS-12: Print biodata siswa
- F-SIS-13: Status keaktifan: Aktif, Tidak Aktif, Aktif Tanpa Rombel, Lulus, Mutasi Keluar, DO

### 3.6 Modul Mutasi

**Deskripsi:** Proses transfer siswa masuk dan keluar.

**Fungsionalitas:**
- F-MUT-01: Mutasi masuk: input data siswa + lembaga asal + upload surat pindah
- F-MUT-02: Mutasi keluar: pilih siswa + tujuan + alasan + cetak surat pindah
- F-MUT-03: Approval Kamad untuk setiap mutasi
- F-MUT-04: Audit trail mutasi (tanggal, alasan, disetujui oleh)

### 3.7 Modul Tahfidz & Tasmi'

**Deskripsi:** Pencatatan setoran hafalan Al-Qur'an dan ujian tasmi'.

**Fungsionalitas:**
- F-TAH-01: Input setoran: jenis (ziyadah/muraja'ah), surah, ayat, juz
- F-TAH-02: Penilaian 3 dimensi: tajwid, makhrajul huruf, kelancaran
- F-TAH-03: Status: Lulus / Perlu Perbaikan
- F-TAH-04: Pencarian siswa cepat (nama/NIS)
- F-TAH-05: Visualisasi progress hafalan per siswa (heatmap juz)
- F-TAH-06: Target hafalan per semester (configurable)
- F-TAH-07: Rekap capaian hafalan per kelas
- F-TAH-08: Riwayat setoran per siswa (timeline)
- F-TAH-09: Ujian Tasmi': per juz, format ujian terpisah

### 3.8 Modul Mutaba'ah Yaumiyah

**Deskripsi:** Pemantauan amalan ibadah harian.

**Fungsionalitas:**
- F-MBY-01: Checklist harian per siswa: sholat wajib, dhuha, tahajud, tilawah, puasa sunnah
- F-MBY-02: Konfigurasi amalan yang dipantau (per madrasah)
- F-MBY-03: Rekap mingguan/bulanan per siswa
- F-MBY-04: Pola "default centang" (sama seperti presensi — mayoritas siswa melaksanakan)

### 3.9 Modul Tata Tertib & Kedisiplinan

**Deskripsi:** Poin pelanggaran dan apresiasi prestasi siswa.

**Fungsionalitas:**
- F-TAT-01: Master daftar pelanggaran & bobot poin (configurable)
- F-TAT-02: Input pelanggaran: pilih siswa, pilih jenis, tanggal, keterangan
- F-TAT-03: Input apresiasi/prestasi: pilih siswa, jenis, tanggal, keterangan
- F-TAT-04: Akumulasi poin per siswa (realtime)
- F-TAT-05: Alert otomatis saat poin mendekati ambang SP1/SP2/SP3
- F-TAT-06: Cetak Surat Peringatan (PDF)
- F-TAT-07: Rekap per kelas (ranking kedisiplinan)
- F-TAT-08: Riwayat per siswa

### 3.10 Modul Keuangan (SPP & Billing)

**Deskripsi:** Pengelolaan tagihan dan pembayaran SPP serta pos biaya lainnya.

**Fungsionalitas:**
- F-KEU-01: Master pos tagihan (SPP, LKS, seragam, gedung, infaq/komite)
- F-KEU-02: Generate tagihan bulanan batch per kelas
- F-KEU-03: Pencarian siswa cepat untuk pembayaran (auto-suggest)
- F-KEU-04: Input pembayaran: pilih bulan + pos -> jumlah auto-populated
- F-KEU-05: Cetak kwitansi (PDF)
- F-KEU-06: Status tunggakan per siswa (lunas/sebagian/belum bayar)
- F-KEU-07: Rekap per kelas (warna: hijau/kuning/merah)
- F-KEU-08: Laporan keuangan bulanan (pendapatan vs target)
- F-KEU-09: Dispensasi ujian (Kamad bisa approve siswa dengan tunggakan)
- F-KEU-10: Export laporan ke Excel

### 3.11 Modul Data GTK (Guru & Tenaga Kependidikan)

**Deskripsi:** Data pendidik dan tenaga kependidikan sesuai EMIS 4.0.

**Fungsionalitas:**
- F-GTK-01: Data diri GTK sesuai format EMIS (lihat RESEARCH.md Bagian 6)
- F-GTK-02: Status kepegawaian (PNS, PPPK, GTY, GTT)
- F-GTK-03: Data sertifikasi (NRG, mapel, LPTK)
- F-GTK-04: Jadwal mengajar per guru
- F-GTK-05: Rekap beban mengajar (JP/minggu)
- F-GTK-06: Export data GTK ke CSV (format EMIS)

### 3.12 Modul Jadwal & Kalender Akademik

**Fungsionalitas:**
- F-JDW-01: Setup jadwal pelajaran per kelas per hari
- F-JDW-02: Kalender akademik (tanggal libur, UTS, UAS, kegiatan)
- F-JDW-03: Tampilan jadwal per guru (auto-generated dari jadwal kelas)
- F-JDW-04: Deteksi konflik jadwal (guru dijadwalkan 2 kelas bersamaan)

### 3.13 Modul EMIS Sync & Export

**Fungsionalitas:**
- F-EMI-01: Export data siswa ke CSV format EMIS template (lihat RESEARCH.md Bagian 4.9)
- F-EMI-02: Export data GTK ke CSV format EMIS template
- F-EMI-03: Export data ruangan ke CSV format EMIS template
- F-EMI-04: Validasi data sebelum export (NIK 16 digit, NISN 10 digit, field wajib)
- F-EMI-05: Log history sync/export

### 3.14 Modul Sarana Prasarana

**Fungsionalitas:**
- F-SAR-01: Data ruangan (kode, nama, jenis, kapasitas, kondisi)
- F-SAR-02: Inventaris per ruangan
- F-SAR-03: Export data ruangan ke EMIS format

### 3.15 Modul Pengaturan Sistem

**Fungsionalitas:**
- F-SET-01: Profil madrasah (NSM, NPSN, nama, alamat, logo)
- F-SET-02: Setup tahun ajaran & semester aktif
- F-SET-03: Setup kelas & rombel
- F-SET-04: Setup mata pelajaran (wajib PAI + umum + pilihan)
- F-SET-05: Mapping guru -> mapel -> kelas
- F-SET-06: Setting bobot nilai default
- F-SET-07: Kelola akun pengguna & peran
- F-SET-08: Backup database manual (download SQL dump)
- F-SET-09: Restore database (upload SQL dump)
- F-SET-10: Audit log (siapa login kapan, aksi apa)

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Metrik | Target |
|---|---|
| Halaman login -> dashboard | < 2 detik |
| Load grid 40 siswa | < 1 detik |
| Autosave per sel | < 200ms |
| Generate PDF rapor (1 siswa) | < 5 detik |
| Batch print rapor (36 siswa) | < 3 menit |
| Concurrent users (puncak) | 50 guru simultan input nilai |
| API response time (p95) | < 500ms |

### 4.2 Availability & Reliability

- Target uptime: 99% selama jam kerja (07:00-17:00 WIB)
- Downtime terencana: maintenance weekend (Sabtu malam)
- Data tidak boleh hilang — backup otomatis harian
- Autosave mencegah data loss saat browser crash

### 4.3 Security

- Autentikasi: username + password (bcrypt hash)
- Session: JWT (access token 15 menit, refresh token 7 hari)
- RBAC enforcement di backend (bukan hanya UI)
- Rate limiting: 100 req/menit per user
- Input sanitization: semua input di-sanitize untuk XSS
- SQL injection: dicegah oleh Drizzle ORM parameterized queries
- File upload: validasi tipe file, ukuran, scan malware basic
- Audit log: semua aksi write dicatat (user, timestamp, action, before/after)
- Password policy: minimal 8 karakter (jangan terlalu strict — guru sudah cukup repot)

### 4.4 Deployment

- Docker Compose di Ubuntu Server 24.04 LTS
- LAN only (tidak exposed ke internet)
- Nginx reverse proxy (port 80)
- PostgreSQL 16 dengan volume SSD
- Backup otomatis harian (7 daily, 4 weekly, 6 monthly retention)

---

## 5. Prioritas Implementasi (MVP -> Full)

### Phase 1: MVP (10-12 minggu)
1. Autentikasi & RBAC
2. Data Siswa (CRUD + search + filter)
3. Presensi (default hadir, toggle status)
4. Input Nilai (grid, autosave, auto-calculate)
5. Rapor (generate PDF format RDM)
6. Tahfidz & Tasmi' (pondok pesantren priority)
7. Setup (TA, semester, kelas, mapel, mapping guru)

### Phase 2: Extended (6-8 minggu)
8. P5RA
9. Mutaba'ah Yaumiyah (pondok pesantren)
10. SPP & Keuangan
11. Data GTK
12. Jadwal (madrasah + pondok)

### Phase 3: Complete (4-6 minggu)
13. Mutasi
14. Tatib/Poin
15. Ekskul
16. EMIS Export
17. Sarana Prasarana

---

## 6. Profil Madrasah Target

| # | Pertanyaan | Jawaban |
|---|---|---|
| 1 | RDM online atau manual? | Sudah online (RDM aktif) |
| 2 | Jumlah siswa & staff? | ~500 siswa, ~50 staff (guru + tenaga kependidikan) |
| 3 | Akses dari luar LAN? | Ya — diusahakan akses via internet publik (bukan LAN-only) |
| 4 | Program khusus? | Ada pondok pesantren dalam 1 yayasan dengan madrasah |
| 5 | Spek server? | Belum tersedia — terbuka rekomendasi arsitektur, spek, server, dan jaringan |

### 6.1 Implikasi terhadap Desain

**Internet publik:**
- Wajib HTTPS (TLS) — data siswa, NIK, nilai adalah data sensitif
- Domain publik diperlukan (atau Cloudflare Tunnel sebagai zero-trust alternative tanpa IP publik/port forwarding)
- Rate limiting + brute-force protection lebih ketat (bukan LAN trusted)
- CORS whitelist domain FE

**Pondok pesantren 1 yayasan:**
- Modul Tahfidz & Mutaba'ah Yaumiyah menjadi PRIORITAS (bukan nice-to-have) — naik ke Phase 1
- Data santri mukim (tinggal di asrama) vs santri kalong (pulang ke rumah) — field `residence_type` sudah cover di EMIS
- Potensi multi-lembaga dalam 1 yayasan (MA + Pondok) — sistem harus bisa isolasi data per lembaga atau shared view yayasan
- Jadwal lebih kompleks: jadwal madrasah (pagi-siang) + jadwal pondok (malam-subuh: tahajud, ngaji, muraja'ah)

**500 siswa + 50 staff:**
- ~12-14 kelas (36-40 siswa/kelas)
- 50 concurrent users adalah skenario realistis (semua guru input nilai bersamaan menjelang deadline rapor)
- PostgreSQL + Fastify sanggup handle ini di 1 server VPS kecil

---

## 7. Rekomendasi Server & Jaringan

### 7.1 Opsi Hosting (Internet Publik)

| Opsi | Spek Minimum | Biaya/bulan | Kelebihan | Kekurangan |
|---|---|---|---|---|
| **A: VPS Cloud (Rekomendasi)** | 4 vCPU, 8GB RAM, 80GB SSD | Rp 150-300rb | Uptime 99.9%, backup otomatis, akses publik langsung, managed by provider | Butuh internet stabil untuk akses, biaya bulanan |
| **B: Server Lokal + Cloudflare Tunnel** | Mini PC (Intel N100, 16GB RAM, 256GB SSD) | Rp 0 (setelah beli hardware ~3-5jt) | Satu kali bayar, data di madrasah, LAN cepat | Butuh internet madrasah stabil, maintenance sendiri, listrik harus stabil (UPS) |
| **C: Server Lokal + VPN (Tailscale)** | Sama dengan B | Rp 0 | Lebih aman (private network), simple setup | Setiap user harus install Tailscale client |

**Rekomendasi: Opsi A (VPS Cloud)** — paling reliable untuk akses publik, maintenance minimal, cocok untuk madrasah yang belum punya IT dedicated.

### 7.2 Spek Server yang Direkomendasikan

**VPS Cloud (Opsi A):**

| Komponen | Minimum | Recommended |
|---|---|---|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Storage | 40 GB SSD | 80 GB SSD |
| OS | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |
| Bandwidth | 1 TB/bulan | Unlimited |
| Backup | Manual | Daily snapshot |

Kapasitas load: 4 vCPU + 8GB RAM bisa handle 100+ concurrent users dengan PostgreSQL + Fastify (jauh di atas kebutuhan 50 concurrent).

**Server Lokal (Opsi B/C):**

| Komponen | Spesifikasi | Contoh Device |
|---|---|---|
| CPU | Intel N100 / N305 / i3-12100 | Beelink Mini S12 Pro / ASUS PN-series |
| RAM | 16 GB DDR4 | - |
| Storage | 256 GB NVMe SSD (OS+app) + 1TB HDD (backup) | - |
| UPS | Minimal 30 menit backup power | APC BX650 (~Rp 800rb) |
| Internet | Minimal 10 Mbps upload (untuk akses publik) | ISP dedicated / IndiHome Bisnis |

### 7.3 Domain & SSL

| Komponen | Rekomendasi | Biaya |
|---|---|---|
| Domain | .sch.id (khusus sekolah Indonesia) | Rp 50-100rb/tahun |
| SSL | Let's Encrypt (free, auto-renew via Caddy/Certbot) | Gratis |
| DNS | Cloudflare (free tier) | Gratis |

### 7.4 Arsitektur Deployment (Internet Publik)

```
Internet
  │
  ▼
┌──────────────────────────────────────────────┐
│  VPS / Server                                │
│                                              │
│  ┌────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Caddy  │───>│ simma-be │───>│PostgreSQL│  │
│  │ :443   │    │ Fastify  │    │ 16       │  │
│  │ (auto  │    │ :3000    │    │ (:5432)  │  │
│  │  TLS)  │    └──────────┘    └──────────┘  │
│  │        │    ┌──────────┐                  │
│  │        │───>│ simma-fe │                  │
│  │        │    │ static   │                  │
│  │        │    └──────────┘                  │
│  └────────┘                                  │
│                                              │
│  Docker Compose (4 containers)               │
│  - caddy (reverse proxy + auto-TLS)          │
│  - simma-be (Node 22)                        │
│  - simma-fe (Caddy/Nginx static)             │
│  - postgres (16-alpine)                      │
│  - pg-backup (cron)                          │
└──────────────────────────────────────────────┘
```

**Perubahan dari arsitektur LAN-only:**
- Nginx diganti Caddy — auto-TLS (Let's Encrypt) tanpa config manual
- Port 443 (HTTPS) bukan 80 (HTTP)
- Firewall: hanya port 22 (SSH) dan 443 (HTTPS) yang terbuka
- fail2ban untuk brute-force SSH protection
- PostgreSQL TIDAK exposed ke publik (hanya docker internal network)
