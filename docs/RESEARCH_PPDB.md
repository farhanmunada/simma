# Riset & Spesifikasi Resmi PPDB Madrasah Aliyah (Kemenag)

> Dokumen acuan standar sistem PPDB Madrasah Aliyah berbasis Juknis Dirjen Pendis Kemenag & SNPDB Madrasah.
> Sumber: Juknis PPDBM Dirjen Pendidikan Islam Kemenag RI, SNPDB Kemenag (snpdb-madrasah.kemenag.go.id), dan PPDB Madrasah Terpadu.

---

## 1. Landasan Regulasi & Konteks Madrasah

Penerimaan Peserta Didik Baru Madrasah (PPDBM) dan Seleksi Nasional Peserta Didik Baru (SNPDB) Madrasah Aliyah memiliki aturan baku yang dikeluarkan oleh Direktorat Jenderal Pendidikan Islam Kementerian Agama RI:
1. **Pemisahan Jalur Penerimaan**:
   - **Jalur Reguler**: Seleksi berbasis tes akademik/potensi belajar dan nilai rapor MTs/SMP semester 1–5.
   - **Jalur Prestasi**: Khusus peraih juara sains/KSM/OSN, seni, olahraga, dan **Tahfidz Al-Qur'an** (syahadah minimal 3, 5, atau 10 juz).
   - **Jalur Afirmasi**: Siswa dari keluarga ekonomi kurang mampu pemegang KIP (Kartu Indonesia Pintar), PKH, atau terdaftar di DTKS Kemenkes/Kemensos.
   - **Jalur Perpindahan Tugas**: Anak guru/GTK madrasah atau perpindahan tugas kedinasan orang tua.
2. **Prinsip Validitas Data EMIS & Pusdatin**:
   - Pendaftaran wajib mengunci **NISN** dan **NIK** terverifikasi.
   - Data profil madrasah asal harus terdaftar dengan **NPSN** resmi.

---

## 2. Alur Sistem & Peran Calon Siswa vs Panitia Madrasah

### 2.1 Alur Calon Siswa (Sisi Eksternal)

```
[Buka Portal Resmi] 
       │
       ▼
[Registrasi Akun Calon Siswa] ─── Input NIK, NISN, Email/No. WA & Password
       │
       ▼
[Login Calon Siswa] ───────────── Masuk ke Dashboard Pendaftar
       │
       ▼
[Lengkapi Formulir Pendaftaran] ─ Data Diri, Orang Tua, Asal Madrasah, Pilihan Jurusan
       │
       ▼
[Unggah Dokumen Persyaratan] ──── Pas Foto, KK, Akta, Rapor, SKL, Dokumen Prestasi/KIP
       │
       ▼
[Kunci Data (Finalisasi)] ─────── Data terkunci, nomor registrasi resmi diterbitkan, cetak Kartu Bukti Pendaftaran
       │
       ▼
[Pantau Pengumuman Kelulusan] ── Status kelulusan muncul di dashboard akun masing-masing
       │
       ▼
[Daftar Ulang] ────────────────── Konfirmasi kelulusan & upload bukti daftar ulang
```

### 2.2 Alur Panitia PPDB / Staf TU (Sisi Internal Madrasah)

```
[Konfigurasi PPDB] ──────── Kuota jurusan, timeline gelombang, syarat berkas
       │
       ▼
[Verifikasi Berkas] ─────── Panitia melihat berkas upload (PDF/gambar) via previewer.
                            Setiap berkas diberi status: Valid / Ditolak (catatan revisi).
       │
       ▼
[Input Nilai Seleksi] ───── Input skor tes potensi/akademik, wawancara, dan tes tahfidz.
       │
       ▼
[Penetapan Kelulusan] ───── Rapat seleksi -> ubah status pendaftar: DITERIMA / CADANGAN / DITOLAK.
       │
       ▼
[Verifikasi Daftar Ulang] ─ Pendaftar diterima melakukan daftar ulang (online/tatap muka).
       │
       ▼
[Mutasi ke Buku Induk] ──── Calon siswa di-enroll secara atomik ke tabel `students` 
                            (status: Aktif Tanpa Rombel) dan dibuatkan entitas `parents`.
```

---

## 3. Spesifikasi Dokumen & Standar Penyimpanan (Storage)

### 3.1 Dokumen Wajib & Opsional

| Jenis Dokumen | Format | Ukuran Maksimal | Wajib/Opsional | Deskripsi |
|---|---|---|---|---|
| **Pas Foto Siswa** | JPG, PNG | 1 MB | Wajib | Formal latar belakang merah/biru |
| **Kartu Keluarga (KK)** | PDF, JPG, PNG | 2 MB | Wajib | Verifikasi NIK, domisili, dan nama ortu |
| **Akta Kelahiran** | PDF, JPG, PNG | 2 MB | Wajib | Verifikasi tempat tanggal lahir & nama ibu |
| **Ijazah / SKL / Surat Ket. Kelas 9** | PDF, JPG, PNG | 2 MB | Wajib | Bukti kelulusan dari jenjang MTs/SMP |
| **Rapor MTs/SMP Semester 1–5** | PDF | 5 MB | Wajib (Jalur Reguler/Tes) | Lembar nilai semester 1 s/d 5 |
| **Syahadah Tahfidz / Sertifikat Lomba** | PDF, JPG, PNG | 3 MB | Wajib jika Jalur Prestasi | Bukti hafalan Al-Qur'an atau juara KSM/OSN |
| **Kartu Bantuan (KIP/PKH/KKS)** | PDF, JPG, PNG | 2 MB | Wajib jika Jalur Afirmasi | Bukti penerima bantuan program sosial |
| **Surat Pernyataan (SPTJM)** | PDF, JPG, PNG | 2 MB | Wajib saat finalisasi | Pernyataan kebenaran data bermaterai |

### 3.2 Arsitektur Penyimpanan & Keamanan Berkas

1. **Upload Engine**:
   - Menggunakan `@fastify/multipart` dengan limit memory & stream to storage.
   - Validasi file:
     - Validasi Ekstensi (`.pdf`, `.jpg`, `.jpeg`, `.png`).
     - Validasi MIME type (`application/pdf`, `image/jpeg`, `image/png`).
     - Validasi Magic Bytes (mencegah file `.exe` / `.php` / `.sh` yang disamarkan).
2. **Penyimpanan Fisik Terisolasi**:
   - Berkas **dilarang keras** ditaruh di folder publik web server yang dapat dieksekusi skripnya.
   - Folder penyimpanan lokal: `storage/uploads/ppdb/<applicantId>/<documentType>_<fileHash>.<ext>`.
   - Nama berkas asli di-sanitize dan diganti UUID/hash acak untuk mencegah *Path Traversal attack*.
3. **Akses Dokumen (Secure Streaming)**:
   - File tidak memiliki URL publik statis langsung.
   - Akses file lewat endpoint terautentikasi: `GET /api/v1/ppdb/documents/:documentId/download` atau `GET /api/v1/ppdb/documents/:documentId/preview`.
   - Guard akses: Hanya pemilik akun calon siswa yang bersangkutan atau staf panitia (role `admin_tu`, `super_admin`, `kepala_madrasah`) yang memiliki izin membaca berkas.

---

## 4. Desain Skema Database Terintegrasi

Tabel baru pendukung modul PPDB profesional:
1. `ppdb_users` / integrasi `users` dengan role `calon_siswa`:
   - Calon siswa memiliki akun terautentikasi dengan token JWT.
2. `ppdb_applicants`:
   - Data biodata, jalur pendaftaran, peminatan, status verifikasi berkas, skor seleksi, status pendaftaran (`draft`, `submitted`, `verified`, `accepted`, `rejected`, `enrolled`).
3. `ppdb_documents`:
   - Tabel riwayat berkas: `applicant_id`, `document_type`, `file_name`, `original_name`, `file_path`, `file_size`, `mime_type`, `verification_status` (`pending`, `valid`, `invalid`), `rejection_reason`.
4. `ppdb_exam_scores`:
   - Nilai seleksi tes CBT, tes baca Quran/tahfidz, dan wawancara.

---

## 5. Rencana Refaktor & Implementasi Nyata

1. **Backend**:
   - Pasang `@fastify/multipart` untuk streaming upload berkas.
   - Tambahkan skema tabel `ppdb_documents` dan relasi file.
   - Endpoint autentikasi calon siswa: `POST /api/v1/ppdb/auth/register` dan `POST /api/v1/ppdb/auth/login`.
   - Endpoint upload dan pengelolaan berkas berizin.
   - Endpoint verifikasi dokumen per-item untuk panitia dengan catatan revisi.
2. **Frontend Calon Siswa (`/ppdb`)**:
   - Halaman registrasi akun dan login mandiri calon siswa.
   - Dashboard calon siswa yang rapi: formulir multi-tab, zona drag-and-drop upload berkas (dengan preview & progress bar), dan tombol finalisasi kunci data.
   - Kartu Peserta Pendaftaran resmi (dapat diunduh PDF/cetak).
3. **Frontend Panitia (`/ppdb-admin`)**:
   - Dokumen previewer interaktif (bisa melihat PDF & gambar KTP/KK/Akta/Rapor langsung di browser tanpa harus download manual).
   - Tombol verifikasi dokumen per item (Valid / Tolak dengan alasan).
   - Tombol pengumuman dan enroll resmi ke Buku Induk.
