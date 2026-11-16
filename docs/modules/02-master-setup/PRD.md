# PRD: 02. Pengaturan Master Data Madrasah (Master Setup)

**Modul:** Pengaturan Master Data Madrasah  
**Urutan:** Modul 02 — Fondasi Konfigurasi Lembaga & Kurikulum  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** KMA 347/2022, KMA 450/2024, Juknis Pendis Kemenag RI, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Setiap satuan pendidikan Madrasah Aliyah memiliki siklus administratif tahunan yang terikat pada kalender pendidikan Kementerian Agama. Master Setup adalah jantung konfigurasi seluruh sistem SIMMA: menentukan periode operasional madrasah, struktur rombongan belajar (rombel), katalog kurikulum mata pelajaran nasional & keagamaan, serta penugasan tenaga pendidik.

Modul Master Setup dirancang agar staf madrasah (Admin TU dan Waka Kurikulum) dapat mengonfigurasi lembaga secara presisi tanpa perlu menyentuh basis data secara manual.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Profil Lembaga | Tahun Ajaran & Semester | Rombel / Kelas | Master Mapel | Data Guru & Penugasan |
|---|---|---|---|---|---|
| `super_admin` | Full CRUD | Full CRUD + Aktivasi | Full CRUD | Full CRUD | Full CRUD |
| `admin_tu` | Full CRUD | Full CRUD + Aktivasi | Full CRUD | Read-Only | Full CRUD |
| `waka_kurikulum`| Read-Only | Read-Only | Full CRUD | Full CRUD | Full CRUD (Penugasan) |
| `kepala_madrasah`| Read-Only | Read-Only | Read-Only | Read-Only | Read-Only |
| `guru_mapel` | Read-Only | Read-Only | Read (Kelas Ajar) | Read-Only | Read (Jadwal Sendiri) |

---

## 3. Alur Proses Bisnis

### 3.1 Siklus Pergantian Tahun Ajaran & Semester
1. Admin TU atau Waka Kurikulum membuat entitas Tahun Ajaran Baru (misal: `2025/2026`) beserta rentang tanggal mulainya.
2. Admin TU mendaftarkan Semester (Ganjil & Genap) di bawah tahun ajaran tersebut.
3. Saat tahun pelajaran berganti, admin melakukan aksi **Aktivasi Tahun Ajaran & Semester** (`set-active`).
4. **Aturan Mutlak Integritas:** Sistem secara atomik menonaktifkan tahun ajaran dan semester sebelumnya, sehingga hanya ada tepat 1 Tahun Ajaran Aktif dan 1 Semester Aktif dalam satu waktu operasional. Seluruh modul downstream (presensi, nilai, absensi, PPDB) langsung merujuk pada periode aktif ini.

### 3.2 Penyusunan Rombel & Penetapan Wali Kelas
1. Admin TU membuat daftar rombel kelas untuk semester aktif (Tingkat X, XI, XII).
2. Admin TU menetapkan kapasitas siswa per kelas (standar Kemenag: 32-36 siswa).
3. Admin menetapkan Guru Wali Kelas dari daftar GTK aktif. Satu guru hanya boleh menjadi wali kelas di satu rombel aktif pada semester yang sama.

### 3.3 Katalog Kurikulum Merdeka Madrasah
1. Waka Kurikulum mengelola 44 katalog mata pelajaran sesuai regulasi KMA 347/2022 & KMA 450/2024:
   - **Kelompok A (Umum):** Pendidikan Pancasila, Bahasa Indonesia, Matematika, Bahasa Inggris, Sejarah, PJOK, Seni Budaya.
   - **Kelompok B (Ciri Khas Keagamaan Islam Madrasah):** Al-Qur'an Hadis, Akidah Akhlak, Fikih, Sejarah Kebudayaan Islam (SKI), Bahasa Arab.
   - **Kelompok C (Pilihan Fase F Kelas XI-XII):** Peminatan MIPA (Fisika, Kimia, Biologi, Matematika Lanjut), Peminatan IPS (Sosiologi, Ekonomi, Geografi, Antropologi), Peminatan Bahasa (Bahasa Asing), Peminatan Keagamaan/IIK (Tafsir, Hadis, Ushul Fikih, Ilmu Kalam, Bahasa Arab Peminatan).
   - **Muatan Lokal & Vokasi:** Keterampilan praktis madrasah, Tahfidz Al-Qur'an terprogram.
2. Setiap mapel memiliki alokasi beban belajar resmi (Jam Pembelajaran / JP per minggu) dan Fase Kurikulum (Fase E untuk Kelas X, Fase F untuk Kelas XI-XII).

### 3.4 Penugasan Mengajar (Teaching Assignments)
1. Waka Kurikulum memasangkan: `Guru Pengampu` + `Mata Pelajaran` + `Rombel Kelas` + `Semester Aktif`.
2. Penugasan ini menjadi kunci otorisasi pada modul Asesmen Nilai dan Presensi. Guru hanya dapat menginput nilai pada pasangan mapel dan rombel yang terdaftar dalam penugasannya.

---

## 4. Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-SET-01** | Profil Lembaga Madrasah | Mengelola NSM (Nomor Statistik Madrasah 12 digit), NPSN (8 digit), Nama Resmi Madrasah, Akreditasi, Alamat, Kontak, Logo Madrasah, dan Logo Kemenag untuk kop dokumen. |
| **F-SET-02** | Manajemen Tahun Ajaran | CRUD Tahun Ajaran (contoh format: `2024/2025`). Validasi tanggal mulai < tanggal selesai. |
| **F-SET-03** | Aktivasi Tahun Ajaran | Menetapkan 1 tahun ajaran aktif melalui transaksi atomik database (`is_active = true`, yang lain `false`). |
| **F-SET-04** | Manajemen Semester | CRUD Semester di bawah Tahun Ajaran tertentu (`type: 1` untuk Ganjil, `type: 2` untuk Genap). |
| **F-SET-05** | Aktivasi Semester | Menetapkan 1 semester aktif (`set-active`). |
| **F-SET-06** | Manajemen Rombel Kelas | CRUD Rombongan Belajar (contoh: `X-A`, `XI-IPA-1`). Mengaitkan dengan semester aktif dan guru wali kelas. |
| **F-SET-07** | Katalog Mata Pelajaran | CRUD Master Mapel berbasis KMA 347/2022 & 450/2024. Kode mapel unik, nama resmi, kelompok (A, B, Pilihan, Mulok), jumlah JP/minggu, dan fase belajar. |
| **F-SET-08** | Manajemen Data Guru (GTK) | CRUD Tenaga Pendidik: NIK (16 digit), NUPTK/PegID, Nama Lengkap, Gelar, Status Kepegawaian (PNS, PPPK, GTY, GTT), Sertifikasi, dan Akun Login tertaut. |
| **F-SET-09** | Penugasan Mengajar Guru | Menghubungkan guru ke mapel dan rombel pada semester aktif. Validasi pencegahan penugasan guru ganda pada jam/kelas yang sama. |

---

## 5. Aturan Validasi & Integritas Data

1. **Integritas Periode Aktif:**
   - Dilarang keras terdapat lebih dari satu baris `academic_years` dengan `is_active = true`.
   - Dilarang keras terdapat lebih dari satu baris `semesters` dengan `is_active = true`.
2. **Keunikan Identitas Lembaga:**
   - NSM: Wajib 12 digit numerik unik.
   - NPSN: Wajib 8 digit numerik unik.
3. **Format Rombel & Wali Kelas:**
   - Nama rombel unik dalam semester yang sama (misal tidak boleh ada dua rombel `X-1` di semester yang sama).
   - Wali kelas bersifat opsional saat draf pembuatan kelas, namun wajib sebelum semester dibuka untuk penilaian rapor.
4. **Katalog Mapel:**
   - Kode mapel unik (misal: `QRD-MA-X`, `FQH-MA-X`).
   - JP (Jam Pembelajaran) berkisar antara 1 hingga 6 JP/minggu.
5. **Foreign Key Protection:**
   - Tahun ajaran atau semester yang sudah memiliki riwayat penilaian/presensi dilarang dihapus (`RESTRICT` delete foreign key).

---

## 6. Kriteria Penerimaan (Acceptance Criteria)

### Skenario 1: Aktivasi Tahun Ajaran Baru Menggantikan yang Lama
- **GIVEN** Tahun ajaran `2024/2025` berstatus `is_active = true`.
- **WHEN** Admin TU mengaktifkan tahun ajaran `2025/2026` via endpoint `POST /api/v1/setup/academic-years/:id/set-active`.
- **THEN** Status tahun ajaran `2025/2026` berubah menjadi `is_active = true` dan tahun ajaran `2024/2025` berubah menjadi `is_active = false` secara instan dalam 1 transaksi DB.

### Skenario 2: Pencegahan Duplikasi Kode Mata Pelajaran
- **GIVEN** Mata pelajaran Fikih dengan kode `FQH-MA-10` sudah ada di database.
- **WHEN** Pengguna mencoba menambahkan mata pelajaran baru dengan kode `FQH-MA-10`.
- **THEN** Sistem menolak dengan HTTP 400 Bad Request / 409 Conflict dan pesan "Kode mata pelajaran sudah digunakan".

### Skenario 3: Penugasan Mengajar Menjadi Otorisasi Modul Nilai
- **GIVEN** Guru Ahmad ditugaskan mengajar mapel Matematika di kelas `X-A` pada semester aktif.
- **WHEN** Guru Ahmad membuka modul penilaian di kelas `X-A`, dan mencoba menginput nilai di kelas `X-B`.
- **THEN** Sistem mengizinkan akses nilai di kelas `X-A`, dan menolak akses di kelas `X-B` dengan pesan HTTP 403 Forbidden.
