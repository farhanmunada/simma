# Product Requirement Document (PRD) — SIMMA (Sistem Informasi Madrasah Aliyah)

## 1. Visi Produk
SIMMA adalah sistem informasi terpadu berbasis web responsif untuk Madrasah Aliyah yang memadukan manajemen akademik Kemenag (RDM & Kurikulum Merdeka KMA 450/2024), kesiswaan berstandar EMIS 4.0, monitoring tahfidz & ibadah, serta keuangan madrasah.

---

## 2. Batas Tanggung Jawab Arsitektur Decoupled

| Komponen | Lokasi Folder | Tanggung Jawab |
|---|---|---|
| **Backend API (`simma-be`)** | `D:\Coding\simma\simma-be\` | REST API, autentikasi session/JWT, kalkulasi nilai RDM, batch write concurency, transaksi ACID pembayaran SPP, akses PostgreSQL via Drizzle ORM |
| **Frontend UI (`simma-fe`)** | `D:\Coding\simma\simma-fe\` | Client SPA (Vite + React + TS), virtual table untuk rendering nilai masal, formulir validasi Zod, dashboard responsif Tailwind + shadcn/ui |

---

## 3. Matriks Peran Pengguna (RBAC)

1. **Super Admin:** Manajemen konfigurasi sistem, hak akses, audit log.
2. **Kepala Madrasah (Kamad):** Monitoring KPI madrasah, approval kelulusan & e-rapor.
3. **Waka Kurikulum:** Konfigurasi tahun ajaran, plotting rombel, distribusi jam, jadwal KBM anti-bentrok.
4. **Waka Kesiswaan:** PPDB online, buku pelanggaran & prestasi, beasiswa PIP.
5. **Bendahara / Waka Keuangan:** Setting tarif SPP & komite, billing, loket pembayaran kasir.
6. **Guru Mata Pelajaran:** Presensi kelas per mapel, jurnal harian guru, input asesmen harian (batch).
7. **Wali Kelas:** Rekap presensi rombel, catatan sikap/karakter, cetak e-rapor PDF.
8. **Pembina Tahfidz:** Input setoran ayat/surat, evaluasi kelancaran & tajwid, tasmi'.
9. **Staf Tata Usaha (TU):** Buku induk siswa, mutasi masuk/keluar, ekspor/impor template EMIS 4.0.
10. **Siswa & Wali Murid:** Monitoring kehadiran, jadwal KBM, setoran tahfidz, status tagihan, kartu ujian, akses rapor.

---

## 4. Rincian Modul Fungsional

### FR-01: Kelembagaan & Profil Madrasah
- Master data madrasah: NSM (12 digit), NPSN (8 digit), akreditasi, kepala madrasah, alamat.
- Multi-tahun ajaran (Ganjil/Genap) dengan status satu tahun ajaran aktif.
- Master ruangan kelas dan rombel.

### FR-02: Kesiswaan & PPDB Terstandar EMIS 4.0
- Pendaftaran calon santri baru online.
- Validasi data pokok: NIK (16 digit), NISN (10 digit), No. KK.
- Pengelolaan status siswa: Aktif, Lulus, Mutasi Keluar, Drop Out.
- Buku kedisiplinan (akumulasi poin pelanggaran dan poin prestasi).

### FR-03: Kurikulum Kemenag & Penjadwalan KBM
- Kategorisasi mata pelajaran resmi:
  - Rumpun PAI Wajib (Al-Qur'an Hadis, Akidah Akhlak, Fikih, SKI).
  - Bahasa Arab.
  - Mapel Umum Nasional.
  - Mapel Peminatan Fase F (MIPA, IPS, Bahasa, Keagamaan).
  - Muatan Lokal.
- Generator & validator jadwal KBM mingguan bebas bentrok guru dan ruangan.

### FR-04: Presensi & Jurnal KBM Guru
- Presensi dua lapis: Presensi madrasah harian (Wali Kelas) + Presensi per mapel (Guru Mapel).
- Jurnal KBM harian (materi bahasan, capaian tujuan pembelajaran, catatan siswa).

### FR-05: Penilaian Rapor Kemenag (RDM & P5RA)
- Input asesmen formatif dan sumatif dengan dukungan *Batch Upsert* untuk efisiensi konkurensi input puluhan guru.
- Kalkulasi otomatis nilai akhir dan deskripsi capaian berbasis KKM/KKTP.
- Penilaian P5RA berbasis 10 nilai Rahmatan Lil 'Alamin dengan 4 predikat (MB, SB, BSH, SAB).
- Generator cetak Rapor Semester format PDF standar RDM.

### FR-06: Tahfidz & Amalan Yaumiyah
- Logbook setoran hafalan: Tanggal, Nama Surah, Rentang Ayat, Juz, Nilai Kelancaran (*Fashahah*), Nilai Tajwid.
- Pengujian Tasmi' Al-Qur'an sekali duduk.
- Mutaba'ah Yaumiyah: Checklist ibadah harian santri (sholat jamaah, dhuha, tilawah).

### FR-07: Keuangan & Billing SPP
- Pembuatan pos tagihan otomatis per tingkat/kelas.
- Loket kasir TU & status pembayaran (`UNPAID`, `PARTIAL`, `PAID`).
- Validasi syarat cetak kartu ujian: tombol kartu ujian terkunci jika memiliki tunggakan tanpa dispensasi.

### FR-08: Interoperabilitas & Ekspor EMIS 4.0
- Ekspor data siswa, guru, dan rombel ke format file spreadsheet (.xlsx/.csv) sesuai template resmi EMIS 4.0 Kemenag.
- Impor massal data siswa dari spreadsheet untuk migrasi awal.

---

## 5. Non-Functional Requirements (Konkurensi & Kinerja Lokal)
1. **High Concurrency Input:** Backend Fastify mampu menerima batch write nilai dari puluhan sesi guru secara simultan tanpa timeout atau database lock.
2. **Virtual Rendering:** Frontend React menggunakan virtualization untuk menampilkan tabel ratusan data siswa/nilai tanpa drop framerate di laptop klien.
3. **Integritas Transaksi:** Pembayaran SPP dan mutasi nilai rapor wajib dibungkus transaction block PostgreSQL (ACID).
