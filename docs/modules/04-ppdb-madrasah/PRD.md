# PRD: 04. Penerimaan Peserta Didik Baru (PPDB Madrasah)

**Modul:** Penerimaan Peserta Didik Baru (PPDB)  
**Urutan:** Modul 04 — Pintu Masuk Siswa & Administrasi Kesiswaan  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** Juknis PPDBM Ditjen Pendidikan Islam Kemenag RI, Standar SNPDB Madrasah Aliyah Unggulan, [docs/RESEARCH_PPDB.md](../../RESEARCH_PPDB.md)

---

## 1. Latar Belakang & Visi Modul

PPDB adalah pintu gerbang awal seluruh data di madrasah aliyah. Berdasarkan regulasi Kementerian Agama Republik Indonesia (Direktorat Jenderal Pendidikan Islam), PPDB Madrasah Aliyah mengadopsi seleksi transparan, akuntabel, dan nondiskriminatif melalui sistem mandiri berbasis akun calon siswa (mengacu pada sistem SNPDB Kemenag RI).

Seluruh calon siswa yang mendaftar harus melalui tahapan pembuatan akun, pengisian formulir, unggah dokumen persyaratan digital yang terisolasi aman, verifikasi berkas oleh Panitia TU, seleksi jalur, hingga penetapan kelulusan. 

Data peserta yang dinyatakan **Lulus Seleksi** dan menyelesaikan daftar ulang akan dimutasi secara atomik ke **Buku Induk Siswa (`students`)** tanpa ada re-entry data manual.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Pendaftaran & Akun Mandiri | Upload Berkas | Verifikasi Berkas | Penetapan Kelulusan | Mutasi ke Buku Induk |
|---|---|---|---|---|---|
| `calon_siswa` | Register, Login, Isi Biodata | Upload Dokumennya | Read Status & Catatan | Read Pengumuman | - |
| `admin_tu` (Panitia) | Monitoring | Read Dokumen Pendaftar | Set Status Valid/Invalid | Draft Kelulusan | Eksekusi Mutasi Atomik |
| `kepala_madrasah` | Monitoring Statistik | Read Dokumen | Read Verifikasi | Pengesahan Kelulusan | Read Only |
| `waka_kesiswaan` | Monitoring Jalur | Read Dokumen | Supervisi Berkas | Rekomendasi Seleksi | Read Only |

---

## 3. Jalur Seleksi Resmi Kemenag

Sesuai regulasi Dirjen Pendis Kemenag RI, PPDB SIMMA mendukung 4 jalur seleksi resmi:

1. **Jalur Reguler:**
   Seleksi berbasis nilai rata-rata rapor jenjang MTs/SMP (Semester 1 s.d. 5) dan/atau tes potensi akademik/keagamaan.
2. **Jalur Prestasi (Tahfidz & Akademik/Non-Akademik):**
   - **Kategori Tahfidz:** Calon siswa yang memiliki hafalan Al-Qur'an minimal 3 atau 5 Juz dibuktikan dengan Syahadah/Piagam dari pondok pesantren/lembaga tahfidz terakreditasi.
   - **Kategori Prestasi Akademik/Non-Akademik:** Juara minimal tingkat Kabupaten/Kota pada kompetisi resmi: KSM (Kompetisi Sains Madrasah), OSN, Myres, MTQ, POSPENAS, atau turnamen olahraga/seni resmi.
3. **Jalur Afirmasi:**
   Diperuntukkan bagi calon peserta didik dari keluarga ekonomi tidak mampu dan/atau penyandang disabilitas ringan, dengan bukti kepemilikan Kartu Indonesia Pintar (KIP / PIP), Kartu Keluarga Sejahtera (KKS), atau Program Keluarga Harapan (PKH).
4. **Jalur Perpindahan Tugas Orang Tua / Anak GTK:**
   Bagi anak dari orang tua yang berpindah tugas kedinasan (dibuktikan surat mutasi kerja) atau anak kandung dari Guru & Tenaga Kependidikan yang mengabdi di madrasah bersangkutan.

---

## 4. Dokumen Persyaratan Digital (File Upload)

Penyimpanan berkas persyaratan pendaftar diatur secara terisolasi di server lokal (`storage/uploads/ppdb/`) dengan penamaan berkas berbasis UUID, pencegahan eksekusi skrip, dan akses hanya melalui endpoint streaming terotentikasi JWT (`GET /api/v1/ppdb/documents/:id/file`):

1. **Pas Foto Formal (`pas_foto`):** 3x4 latar belakang merah/biru (JPG/PNG maks 2MB).
2. **Kartu Keluarga (`kartu_keluarga`):** Scan asli KK (PDF/JPG maks 3MB).
3. **Akta Kelahiran (`akta_kelahiran`):** Scan asli Akta Lahir (PDF/JPG maks 3MB).
4. **Ijazah / Surat Keterangan Lulus (`ijazah_skl`):** Scan Ijazah/SKL MTs/SMP sederajat (PDF/JPG maks 3MB).
5. **Rapor SMP/MTs Semester 1-5 (`rapor`):** Scan nilai rapor semester 1 s.d. 5 (PDF maks 5MB).
6. **Piagam Prestasi / Syahadah Tahfidz (`piagam_prestasi`):** Wajib bagi pendaftar Jalur Prestasi (PDF/JPG maks 5MB).
7. **Kartu Bantuan Sosial KIP/PKH (`kartu_bantuan`):** Wajib bagi pendaftar Jalur Afirmasi (PDF/JPG maks 3MB).
8. **Surat Pernyataan Tanggung Jawab Mutlak (`sptjm`):** Surat pernyataan kebenaran data bermeterai Rp10.000 (PDF/JPG maks 3MB).

---

## 5. Alur Proses Bisnis End-to-End

```
[Tahap 1: Registrasi Akun Mandiri]
Calon Siswa mendaftar dengan NIK, NISN, Nama Lengkap, No HP/WA, dan Password
                │
                ▼
[Tahap 2: Pengisian Formulir Lengkap & Pilih Jalur]
Calon Siswa login -> Mengisi biodata pribadi, alamat, asal sekolah, orang tua, 
memilih jalur seleksi (Reguler/Prestasi/Afirmasi/Perpindahan), dan peminatan jurusan
                │
                ▼
[Tahap 3: Unggah Berkas Persyaratan Digital]
Calon Siswa mengunggah dokumen sesuai jalur seleksi yang dipilih
                │
                ▼
[Tahap 4: Finalisasi & Penguncian Data Pendaftaran]
Calon Siswa menyetujui pernyataan keabsahan dan mengunci (finalize) formulir.
Sistem menerbitkan Kartu Tanda Peserta PPDB Resmi ber-barcode/QR Code
                │
                ▼
[Tahap 5: Verifikasi Dokumen oleh Panitia Seleksi (TU)]
Panitia meninjau dokumen pendaftar secara in-app:
- Jika berkas lengkap & absah -> Set Status Dokumen: "VALID"
- Jika berkas buram/salah -> Set Status Dokumen: "INVALID" + beri catatan revisi
  (Calon siswa dapat notifikasi untuk mengunggah ulang berkas perbaikan)
                │
                ▼
[Tahap 6: Sidang Kelulusan & Pengumuman Hasil]
Panitia & Kepala Madrasah menetapkan status kelulusan: "LULUS" atau "TIDAK LULUS"
Pengumuman dapat dicek langsung di portal akun calon siswa
                │
                ▼
[Tahap 7: Daftar Ulang & Mutasi Atomik ke Buku Induk Siswa]
Siswa yang LULUS melakukan registrasi ulang administratif di madrasah.
Panitia menekan tombol "Daftarkan ke Buku Induk" -> Sistem otomatis membuat 
entitas Siswa Aktif di Buku Induk (`students`), mengalokasikan NIS Stambuk, 
dan mengubah status pendaftar menjadi "ENROLLED".
```

---

## 6. Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-PDB-01** | Registrasi Akun Calon Siswa | Pembuatan akun dengan NIK 16 digit, NISN 10 digit, dan password terenkripsi bcrypt. |
| **F-PDB-02** | Login Portal Calon Siswa | Autentikasi calon siswa menggunakan Nomor Pendaftaran/NISN dan password, menerbitkan JWT role `calon_siswa`. |
| **F-PDB-03** | Profil & Formulir Multi-Tahap | Form online 5 bagian: Identitas Diri, Alamat, Asal Madrasah/SMP, Data Orang Tua, Peminatan & Jalur. Fitur simpan draf (drafting) sebelum finalisasi. |
| **F-PDB-04** | Unggah Dokumen Persyaratan Multipart | Pengunggahan file digital multipart berkapasitas 2-5MB per berkas, validasi MIME type, dan penyimpanan lokal terisolasi UUID. |
| **F-PDB-05** | Finalisasi & Kunci Data Pendaftaran | Penguncian status formulir (`is_finalized = true`). Data terkunci dari perubahan calon siswa untuk menjamin integritas verifikasi. |
| **F-PDB-06** | Cetak Kartu Tanda Peserta PPDB | Generator PDF Kartu Peserta resmi standar Kemenag (Pas Foto, Nomor Peserta, Barcode/QR, Identitas, Jalur, Jadwal Seleksi Fisik, dan Lokasi). |
| **F-PDB-07** | Dashboard Panitia Seleksi (TU) | Dasbor statistik real-time: total pendaftar, sebaran jalur seleksi, pendaftar belum final, berkas belum diverifikasi, dan kuota penerimaan. |
| **F-PDB-08** | Panel Verifikasi Dokumen In-App | Antarmuka peninjauan berkas calon siswa satu per satu, penetapan status dokumen (`valid`, `invalid`) dan catatan perbaikan bagi calon siswa. |
| **F-PDB-09** | Keputusan Hasil Seleksi (Kelulusan) | Pengesahan hasil penerimaan siswa baru oleh Kepala Madrasah: status `accepted` (Lulus) atau `rejected` (Tidak Lulus). |
| **F-PDB-10** | Mutasi Atomik ke Buku Induk Siswa | Pemindahan seluruh rekaman pendaftar lulus ke tabel `students`, pembentukan akun orang tua (`parents`), dan alokasi nomor stambuk NIS secara transaksional database. |
| **F-PDB-11** | File Streaming Berkas Terproteksi | Route backend streaming file dokumen persyaratan (`GET /api/v1/ppdb/documents/:id/file`) dengan otorisasi JWT untuk mencegah kebocoran dokumen kependudukan publik. |

---

## 7. Aturan Validasi & Integritas Data

1. **Pencegahan Akun Calon Siswa Ganda:**
   - NIK (16 digit) dan NISN (10 digit) harus unik pada tabel `ppdb_applicants` dalam tahun ajaran yang sama.
2. **Keterkaitan Dokumen dengan Jalur Seleksi:**
   - Jika `track = 'prestasi'`, wajib mengunggah dokumen jenis `piagam_prestasi`.
   - Jika `track = 'afirmasi'`, wajib mengunggah dokumen jenis `kartu_bantuan`.
3. **Penyimpanan Berkas Digital:**
   - Dilarang menyimpan berkas di folder publik web yang dapat diindeks oleh mesin pencari.
   - Nama berkas wajib di-sanitize menggunakan format `<document-uuid>.<sanitized-ext>` di server.
4. **Integritas Mutasi Buku Induk:**
   - Tombol "Daftarkan ke Buku Induk" hanya aktif jika status pendaftar adalah `accepted` (Lulus).
   - Eksekusi mutasi wajib dibungkus dalam blok `db.transaction()`: jika pembuatan record `students` gagal, status pendaftar tidak boleh berubah menjadi `enrolled`.

---

## 8. Kriteria Penerimaan (Acceptance Criteria)

### Skenario 1: Registrasi Akun Mandiri & Penguncian Berkas Pendaftar
- **GIVEN** Calon siswa bernama "Ahmad Dahlan" mendaftar di portal PPDB dengan NIK 16 digit dan NISN 10 digit.
- **WHEN** Ahmad melengkapi seluruh biodata, memilih jalur "Reguler", mengunggah KK, Akta, dan Rapor, lalu mengeklik "Kunci & Finalisasi Pendaftaran".
- **THEN** Status pendaftar berubah menjadi `submitted`, formulir terkunci dari pengeditan, dan sistem mencetak Kartu Tanda Peserta PPDB dengan nomor registrasi unik (contoh: `PPDB-2025-0012`).

### Skenario 2: Verifikasi Berkas oleh Panitia TU dengan Catatan Perbaikan
- **GIVEN** Berkas Kartu Keluarga pendaftar buram atau tidak terbaca.
- **WHEN** Panitia TU membuka panel verifikasi, menandai dokumen KK sebagai `invalid`, dan menulis catatan: "Foto KK terpotong pada bagian NIK orang tua, harap unggah ulang scan asli yang jelas".
- **THEN** Status dokumen menjadi `invalid`, dan saat calon siswa membuka akunnya, muncul kartu peringatan kuning meminta unggah ulang dokumen KK dengan catatan panitia tersebut.

### Skenario 3: Mutasi Atomik Pendaftar Lulus ke Buku Induk Siswa
- **GIVEN** Pendaftar "Fathimah Az-Zahra" telah dinyatakan Lulus (`status = accepted`) dan menyelesaikan verifikasi fisik di madrasah.
- **WHEN** Admin TU mengeklik "Daftarkan ke Buku Induk" pada detail pendaftar di dashboard PPDB.
- **THEN** Sistem secara atomik:
  1. Membuat rekor baru di tabel `students` dengan status "aktif".
  2. Menerbitkan nomor stambuk NIS resmi madrasah.
  3. Memperbarui status pendaftar PPDB menjadi `enrolled` dan mengaitkan `student_id`.
  4. Seluruh data identitas, asal sekolah, dan orang tua tersimpan utuh di Buku Induk tanpa ada field yang hilang.
