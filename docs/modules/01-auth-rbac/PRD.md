# PRD: 01. Autentikasi & Role-Based Access Control (RBAC)

**Modul:** Autentikasi & RBAC  
**Urutan:** Modul 01 — Fondasi Autentikasi & Keamanan  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** KMA Regulasi Madrasah, [docs/ARCHITECTURE.md](../../ARCHITECTURE.md), [docs/UX-DESIGN.md](../../UX-DESIGN.md)

---

## 1. Latar Belakang & Visi Modul

SIMMA digunakan oleh beragam pemangku kepentingan madrasah aliyah dan pondok pesantren: pimpinan (Kepala Madrasah), staf tata usaha (Admin TU), guru mata pelajaran, wali kelas, guru tahfidz, pembina ekstrakurikuler, calon siswa baru, serta siswa/wali murid. 

Modul Autentikasi & RBAC menjamin keamanan data sensitif madrasah (NIK, data keluarga, nilai akademik, berkas resmi dinas) dengan menerapkan verifikasi identitas terpusat, penguncian sesi stateless (JWT), pembatasan hak akses berbasis peran (least privilege), dan pencatatan jejak audit (audit log) pada setiap mutasi data.

---

## 2. Aktor & Matriks Hak Akses

### 2.1 Daftar Aktor

| Peran (`role`) | Deskripsi & Batasan Lingkup |
|---|---|
| `super_admin` | Pengelola teknis sistem / Proktor madrasah. Hak akses penuh konfigurasi sistem, audit log, kelola user, dan troubleshooting. |
| `kepala_madrasah` | Pimpinan madrasah (Kamad). Hak monitoring eksekutif, persetujuan (approval) mutasi/disposisi surat/kelulusan, pengesahan dokumen resmi, tidak mengedit data teknis harian. |
| `admin_tu` | Staf Tata Usaha. Pengelola operasional administratif: buku induk siswa, agenda surat masuk/keluar, penerbitan surat dinas, data GTK, dan verifikasi berkas PPDB. |
| `waka_kurikulum` | Wakil Kepala Bidang Kurikulum. Pengawas proses akademik, pemetaan mapel, monitoring kelengkapan nilai, dan kalender pendidikan. |
| `waka_kesiswaan` | Wakil Kepala Bidang Kesiswaan. Pembina tata tertib kesiswaan, organisasi siswa, dan monitoring kehadiran madrasah. |
| `wali_kelas` | Guru yang ditugaskan sebagai pembina rombel tertentu. Hak verifikasi legger kelasnya, catatan perkembangan siswa, dan pencetakan rapor semester. |
| `guru_mapel` | Tenaga pendidik madrasah. Hak mencatat asesmen nilai dan presensi siswa hanya pada rombel & mata pelajaran yang diampunya. |
| `guru_tahfidz` | Penguji/penyimak hafalan Al-Qur'an santri. Hak input setoran ziyadah/muraja'ah dan ujian tasmi'. |
| `siswa` | Peserta didik aktif. Hak melihat biodata mandiri, jadwal, absensi, capaian tahfidz, dan rekap nilai pribadi. |
| `orang_tua` | Wali murid. Hak monitoring kehadiran harian anak, tagihan SPP, dan capaian hafalan/rapor. |
| `calon_siswa` | Pendaftar PPDB baru. Akses terisolasi pada portal pendaftaran, pengunggahan berkas, pemantauan verifikasi, dan cetak kartu bukti pendaftaran. |

---

## 3. Alur Proses Bisnis

### 3.1 Alur Login Staf & Pendidik
1. Pengguna membuka portal SIMMA (`/login`).
2. Pengguna memasukkan `username` (atau email resmi) dan `password`.
3. Backend memvalidasi format input, mencocokkan password hash (bcrypt), dan memeriksa status keaktifan akun (`isActive = true`).
4. Jika valid, backend menerbitkan `accessToken` (masa berlaku 15 menit) dan `refreshToken` (masa berlaku 7 hari).
5. Frontend menyimpan token pada memory/Zustand dan menyimpan state terenkripsi pada local storage sesi.
6. Frontend mengarahkan pengguna ke Dashboard sesuai peran (role-based redirection).

### 3.2 Alur Refresh Token Otomatis
1. Saat access token kedaluwarsa (HTTP 401 `TOKEN_EXPIRED`), API client secara transparan mengirimkan `refreshToken` ke endpoint `/api/v1/auth/refresh`.
2. Backend memvalidasi keabsahan token penyegar pada database.
3. Jika valid, backend menerbitkan `accessToken` baru tanpa memutus aktivitas kerja guru (mencegah kehilangan data saat input nilai/presensi).
4. Jika `refreshToken` kedaluwarsa atau dicabut, pengguna diarahkan ke `/login` dengan notifikasi sesi berakhir.

### 3.3 Alur Penguncian & Proteksi Brute-Force
1. Sistem menghitung kegagalan login berturut-turut per username/IP.
2. Jika terjadi 5 kali kegagalan dalam rentang waktu 15 menit, sistem memberlakukan jeda waktu (lockout) selama 15 menit untuk mencegah serangan kamus (dictionary attack).
3. Setiap upaya login gagal dicatat dalam audit trail keamanan.

---

## 4. Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-AUT-01** | Login Pengguna Staf | Menerima username/email dan password, validasi ke database, menghasilkan JWT auth payload dan profil pengguna. |
| **F-AUT-02** | Refresh Token | Memperpanjang sesi aktif secara aman tanpa meminta input kredensial ulang dari pengguna. |
| **F-AUT-03** | Logout & Sesi Revoke | Menghapus token di sisi klien dan mencabut status refresh token di server. |
| **F-AUT-04** | Profil Pengguna Terotentikasi (`/me`) | Mengembalikan data identitas aktor aktif, peran, relasi guru/staf, dan izin yang berlaku. |
| **F-AUT-05** | Manajemen Akun Pengguna | Super Admin dapat menambah akun, mereset password, menonaktifkan akun, dan menetapkan peran. |
| **F-AUT-06** | Ubah Password Mandiri | Pengguna yang sedang login dapat memperbarui password pribadi dengan memverifikasi password lama. |
| **F-AUT-07** | Role Guarding & Permissions | Middleware API Fastify memvalidasi hak akses token pada level rute (`requireRole`, `requireAuth`). |
| **F-AUT-08** | Audit Log Aktivitas Keamanan | Mencatat aktivitas login, logout, perubahan password, dan penolakan akses (403 Forbidden). |

---

## 5. Aturan Validasi & Integritas Data

1. **Format Username:** Minimal 3 karakter, alfanumerik, garis bawah, atau strip (`^[a-zA-Z0-9_-]{3,50}$`).
2. **Kebijakan Password:**
   - Minimal 8 karakter.
   - Wajib mengandung kombinasi huruf dan angka.
   - Disimpan menggunakan algoritma hashing `bcrypt` dengan cost factor 10 (atau argon2id). Plaintext dilarang disimpan atau dicatat dalam log.
3. **Penyimpanan Token:**
   - Access token memuat payload: `sub` (userId), `username`, `role`, `teacherId` (opsional), `exp`, `iat`.
   - Token dilarang memuat informasi rahasia (password, hash, NIK lengkap).
4. **Keunikan Data:** Username dan Email harus unik di seluruh tabel `users`.
5. **Penonaktifan Akun:** Akun non-aktif (`isActive = false`) otomatis ditolak saat autentikasi dengan pesan "Akun Anda dinonaktifkan, hubungi administrator".

---

## 6. Kriteria Penerimaan (Acceptance Criteria)

### Skenario 1: Login Berhasil dengan Kredensial Valid
- **GIVEN** Akun aktif dengan username `admin_tu` dan password benar terdaftar di database.
- **WHEN** Pengguna mengirim permintaan login ke `/api/v1/auth/login`.
- **THEN** Sistem mengembalikan status HTTP 200 dengan `accessToken`, `refreshToken`, data user, dan mencatat log login sukses.

### Skenario 2: Penolakan Password Salah & Proteksi Brute-force
- **GIVEN** Pengguna salah memasukkan password sebanyak 5 kali berturut-turut dalam 15 menit.
- **WHEN** Pengguna mencoba login ke-6 kalinya.
- **THEN** Sistem menolak permintaan dengan status HTTP 429 Too Many Requests dan pesan bahwa akun terkunci sementara.

### Skenario 3: Penolakan Akses Endpoint Tanpa Wewenang (RBAC)
- **GIVEN** Guru mata pelajaran login dan memiliki token dengan role `guru_mapel`.
- **WHEN** Guru mapel mengakses rute manajemen pengguna `/api/v1/users` yang khusus diperuntukkan bagi `super_admin`.
- **THEN** Middleware backend menolak permintaan dengan HTTP 403 Forbidden dan tidak mengeksekusi logika bisnis.
