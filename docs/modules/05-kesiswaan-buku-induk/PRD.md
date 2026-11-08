# PRD: 05. Administrasi Kesiswaan & Buku Induk Siswa

**Modul:** Kesiswaan & Buku Induk Siswa  
**Urutan:** Modul 05 — Fondasi Kesiswaan & Master Siswa  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** Standar Pendataan EMIS 4.0 Ditjen Pendis Kemenag RI, Pedoman Penyelenggaraan Administrasi Madrasah, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Buku Induk Siswa adalah dokumen negara yang bersifat abadi (permanen) di madrasah. Seluruh rekam jejak akademik, identitas kependudukan, latar belakang keluarga, riwayat kesehatan, dan status kelulusan peserta didik tercatat secara mendalam di dalam Buku Induk dan Buku Klapper.

Di era digitalisasi madrasah, Buku Induk bukan sekadar daftar nama di lemari arsip, melainkan **sumber kebenaran tunggal (Single Source of Truth / SSOT)** untuk:
1. Sinkronisasi data ke EMIS 4.0 Kementerian Agama RI dan Verval PD Pusdatin Kemendikbudristek.
2. Penempatan peserta didik ke dalam rombongan belajar (rombel) semester berjalan.
3. Pencatatan presensi, capaian tahfidz, dan penilaian rapor resmi.
4. Penerbitan dokumen dinas tata usaha (Surat Keterangan Siswa Aktif, SKL, Ijazah).

Modul ini menghubungkan output seleksi PPDB langsung menjadi nomor register stambuk Buku Induk, memvalidasi kelayakan data sesuai standar EMIS, mengelola penempatan rombel kelas, dan mencetak lembar Buku Induk fisik standar Kemenag.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Buku Induk Siswa | Penempatan Rombel | Kelola Data Orang Tua | Cetak Lembar Induk | Export EMIS |
|---|---|---|---|---|---|
| `admin_tu` | Full CRUD | Full CRUD | Full CRUD | Ya (Per Siswa / Kelas) | Ya (CSV/Excel) |
| `waka_kesiswaan` | Read Only | Validasi Rombel | Read Only | Ya | Monitoring |
| `kepala_madrasah` | Read Only | Read Only | Read Only | Ya | Read Only |
| `wali_kelas` | Read Rombelnya | Read Rombelnya | Read Rombelnya | Ya (Rombel Sendiri) | - |
| `guru_mapel` | Read (Nama & NISN) | Read Rombel Ajar | - | - | - |
| `siswa` / `orang_tua` | Read (Profil Sendiri) | Read Rombel Sendiri | Update Kontak Mandiri | - | - |

---

## 3. Alur Proses Bisnis

### 3.1 Siklus Hidup Data Siswa di Madrasah
```
[Calon Siswa PPDB Dinyatakan Lulus & Daftar Ulang]
                    │
                    ▼
[Admin TU: Mutasi Atomik ke Buku Induk Siswa]
- Alokasi Nomor Induk Siswa (NIS / Stambuk Madrasah)
- Registrasi Data Pribadi, NIK, NISN, Orang Tua, & Asal Sekolah
- Status: "Aktif"
                    │
                    ▼
[Admin TU / Waka Kesiswaan: Penempatan Rombongan Belajar (Rombel)]
- Ditempatkan ke Kelas X (contoh: X-A, X-B) pada Semester Aktif
- Penetapan Nomor Urut Absen
                    │
                    ▼
[Siklus Akademik Harian (Phase 2 & 3)]
- Presensi Harian / Mapel
- Setoran Tahfidz & Tasmi'
- Asesmen Pembelajaran & Rapor RDM
                    │
                    ▼
[Kenaikan Kelas / Mutasi / Kelulusan]
- Kenaikan ke Kelas XI & XII
- Mutasi Masuk / Keluar (Pencatatan No. Surat Pindah)
- Kelulusan Kelas XII (Alokasi No. Seri Ijazah) -> Status: "Lulus"
                    │
                    ▼
[Arsip Abadi Buku Induk & Buku Klapper]
```

### 3.2 Penomoran Stambuk / NIS Madrasah
Format penomoran NIS madrasah ditetapkan secara otomatis berbasis pola tahun masuk:
`[2 Digit Tahun Masuk][4 Digit Nomor Urut Stambuk]`
Contoh: Masuk tahun ajaran 2024/2025 siswa urut ke-45 -> NIS: `240045`.
NIS ini bersifat unik seumur hidup dan tidak akan pernah digunakan ulang meskipun siswa bersangkutan mutasi atau keluar.

### 3.3 Penempatan Siswa ke Rombongan Belajar (Class Placement)
1. Setiap awal semester baru, Admin TU membuka menu **Penempatan Rombel**.
2. Siswa aktif yang belum memiliki kelas pada semester tersebut disaring (unassigned students pool).
3. Admin memilih rombel tujuan (misal: `X-MIPA-1`) dan menetapkan siswa secara perorangan maupun massal (bulk assignment).
4. Sistem memeriksa batas kapasitas maksimum kelas (standar: 32 atau 36 siswa).
5. Sistem mengurutkan nomor absen siswa secara alfabetis (A-Z) atau berdasarkan NIS.

---

## 4. Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-SIS-01** | Direktori Buku Induk Siswa | Tabel data seluruh siswa madrasah dengan pencarian multi-parameter (Nama, NISN, NIS, NIK, Kelas, Status). |
| **F-SIS-02** | Profil Lengkap Siswa (Lembar Induk) | Halaman detail komprehensif 6 tab: (1) Biodata Pribadi, (2) Alamat & Tempat Tinggal, (3) Riwayat Asal Sekolah, (4) Data Orang Tua & Wali, (5) Data Bantuan KIP/PKH, (6) Riwayat Rombel & Kenaikan Kelas. |
| **F-SIS-03** | Manajemen Data Orang Tua & Wali | Pengelolaan detail ayah, ibu kandung, dan wali (NIK 16 digit, pekerjaan, penghasilan bulanan, pendidikan, no HP) terintegrasi tabel `parents`. |
| **F-SIS-04** | Penempatan Rombel Kelas | Pengalokasian siswa ke rombel tertentu pada semester aktif, mutasi antar kelas paralel, dan penetapan nomor urut absen. |
| **F-SIS-05** | Riwayat Akademik & Mutasi | Pencatatan rekam jejak status siswa: Kenaikan kelas, tinggal kelas, mutasi pindah madrasah (dengan lampiran no surat pindah), dikeluarkan (DO), atau meninggal dunia. |
| **F-SIS-06** | Buku Klapper Digital | Daftar indeks alfabetis seluruh siswa sepanjang sejarah madrasah (berdasarkan huruf awal nama A-Z) yang memuat NIS, Nama, Tgl Masuk, dan Tgl Keluar/Lulus. |
| **F-SIS-07** | Cetak Lembar Buku Induk (PDF) | Ekspor lembar buku induk resmi berukuran F4/Folio standar Kementerian Agama lengkap dengan pas foto dan data historis siswa. |
| **F-SIS-08** | Validasi & Pra-Audit EMIS 4.0 | Modul pemeriksa kelayakan data siswa untuk sinkronisasi EMIS: deteksi anomali NIK < 16 digit, NISN tidak valid, nama ibu kandung kosong, atau tanggal lahir di luar batas wajar. |
| **F-SIS-09** | Ekspor Format EMIS 4.0 | Ekspor data siswa ke dalam template file CSV/Excel resmi EMIS 4.0 Kemenag RI siap unggah. |

---

## 5. Aturan Validasi & Integritas Data

1. **Validasi Kependudukan & Kemenag:**
   - **NISN:** Wajib tepat 10 digit angka (`^[0-9]{10}$`), bersifat unik di seluruh madrasah.
   - **NIK Siswa:** Wajib tepat 16 digit angka (`^[0-9]{16}$`), divalidasi keunikan dan pola tanggal lahir.
   - **NIK Ayah & Ibu:** Wajib 16 digit angka jika status orang tua masih hidup.
   - **Nama Lengkap:** Wajib sesuai dokumen Ijazah jenjang sebelumnya / Akta Kelahiran resmi.
2. **Integritas Rombel:**
   - Seorang siswa hanya boleh aktif di maksimal **1 rombongan belajar** pada semester aktif yang sama (Constraint: Unique `(student_id, semester_id)`).
   - Kapasitas rombel tidak boleh melampaui batas maksimum yang ditentukan pada master setup tanpa konfirmasi override pimpinan.
3. **Immutability Data Historis:**
   - Data riwayat kelas semester lampau tidak boleh terhapus saat siswa naik kelas ke semester berikutnya (`class_students` disimpan sebagai ledger historis permanen).
   - Siswa yang telah memiliki nilai rapor atau presensi dilarang dihapus secara permanen (hanya boleh dinonaktifkan statusnya: `mutasi_keluar`, `drop_out`, atau `lulus`).

---

## 6. Kriteria Penerimaan (Acceptance Criteria)

### Skenario 1: Penerimaan Data Siswa dari Hasil PPDB
- **GIVEN** Calon siswa PPDB bernama "Siti Aisyah" dengan status pendaftaran "accepted" dan telah menyelesaikan daftar ulang.
- **WHEN** Admin TU mengeklik "Daftarkan ke Buku Induk Siswa".
- **THEN** Sistem secara atomik membuat rekor baru di tabel `students`, mengalokasikan nomor stambuk NIS unik terbaru, menyalin data orang tua ke tabel `parents`, dan mengubah status PPDB menjadi "enrolled".

### Skenario 2: Pencegahan Penempatan Rombel Ganda pada Semester yang Sama
- **GIVEN** Siswa "Ahmad Fauzi" sudah terdaftar sebagai anggota kelas `X-A` pada Semester Ganjil 2024/2025.
- **WHEN** Admin TU secara tidak sengaja mencoba memasukkan Ahmad Fauzi ke rombel `X-B` pada semester yang sama tanpa memindahkannya terlebih dahulu.
- **THEN** Sistem menolak mutasi dengan pesan error "Siswa sudah terdaftar di kelas X-A pada semester aktif ini".

### Skenario 3: Deteksi Anomali Validasi EMIS 4.0
- **GIVEN** Terdapat 3 siswa yang kolom NIK-nya hanya berisi 15 digit atau nama ibu kandungnya belum diisi.
- **WHEN** Admin TU membuka menu "Audit Kelengkapan Data EMIS".
- **THEN** Sistem menampilkan daftar 3 siswa tersebut dengan tanda peringatan merah (flag invalid), menunjukkan secara presisi field yang kurang, dan mencegah ekspor data EMIS sampai anomali diperbaiki.
