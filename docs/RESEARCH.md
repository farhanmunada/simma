# RESEARCH: Analisis Regulasi, Domain, dan Kebutuhan Operasional SIMMA

**Tanggal:** 2026-11-07
**Status:** Verified
**Domain:** Sistem Informasi Akademik Madrasah Aliyah (Kemenag RI)
**Target:** Decoupled Architecture (`simma-be` Fastify TS & `simma-fe` React Vite TS), Ubuntu Server on-premise LAN

---

## Konteks Riset

- **Pertanyaan utama:** Apa saja regulasi, standar data, alur operasional, dan kebutuhan teknis lengkap yang harus dipenuhi sistem informasi Madrasah Aliyah?
- **Alasan riset:** SIMMA harus mematuhi regulasi Kemenag (bukan Kemendikbudristek), format data EMIS 4.0, formula nilai RDM, dan alur kerja khas madrasah yang berbeda dari SMA umum.
- **Scope:** Madrasah Aliyah (MA) — TIDAK mencakup RA, MI, MTs, atau PTKI kecuali untuk konteks integrasi data.

---

## 1. Landasan Regulasi

### 1.1 Posisi Madrasah Aliyah dalam Ekosistem Pendidikan Nasional

Madrasah Aliyah (MA) berada di bawah Direktorat Jenderal Pendidikan Islam (Ditjen Pendis), Kementerian Agama RI. Perbedaan fundamental dengan SMA umum (Kemendikbudristek):

| Aspek | SMA (Kemendikbudristek) | MA (Kemenag RI) |
|---|---|---|
| Regulator kurikulum | Kemendikbudristek | Kemenag RI (mapel PAI & Bahasa Arab), Kemendikbudristek (mapel umum) |
| Sistem data pokok | Dapodik | EMIS 4.0 |
| Rapor digital | e-Rapor Kemendikbudristek | RDM (Rapor Digital Madrasah) |
| Mata pelajaran agama | 1 mapel "Pendidikan Agama Islam" | 5 mapel PAI terpisah + Bahasa Arab |
| Projek penguatan profil | P5 (Profil Pelajar Pancasila) | P5RA (P5 + Rahmatan Lil 'Alamin) |
| Pendataan guru | Dapodik | Simpatika -> migrasi ke EMIS 4.0 (Oktober 2024) |
| Ujian | ANBK via Pusdatin | PDUM (Pendataan Ujian Madrasah) via EMIS |
| Status kelembagaan | NPSN + NISS | NPSN + NSM (Nomor Statistik Madrasah, 12 digit) |

**Sumber:**
- https://kemenag.go.id/opini/emis-4-0-gerbang-data-pendidikan-kementerian-agama-rKxmf
- https://kemenag.go.id/kolom/emis-4-0-transformasi-digital-data-pendidikan-islam-eOEUC

### 1.2 KMA No. 347 Tahun 2022 — Pedoman Implementasi Kurikulum Merdeka pada Madrasah

- **Tanggal penetapan:** 5 April 2022
- **Isi utama:** Memberikan pilihan kepada madrasah: Kurikulum 2013 ATAU Kurikulum Merdeka
- **Ruang lingkup:** 10 bab — Standar Kelulusan, Standar Isi, Struktur Kurikulum, Implementasi, Pembelajaran dan Asesmen, P5, KOM (Kurikulum Operasional Madrasah), Monev, Sosialisasi, Capaian Pembelajaran
- **Penerapan:** Bertahap mulai TP 2022/2023, dimulai dari madrasah percontohan
- **Ketentuan kunci:**
  - Mapel PAI & Bahasa Arab: Standar Isi dan CP (Capaian Pembelajaran) mengacu pada Kemenag
  - Mapel umum: Standar Isi dan CP mengikuti Kemendikbudristek
  - Struktur terbagi 2: pembelajaran intrakurikuler + pembelajaran berbasis proyek (P5RA)
  - MA: Fase E (Kelas X) dan Fase F (Kelas XI-XII)
- **Sumber:** https://docs.paralegal.id/PERMEN/PERMENAG/KEPMENAG/2022/KEPMENAG-347-2022.pdf

### 1.3 KMA No. 450 Tahun 2024 — Pedoman Implementasi Kurikulum pada Madrasah (Revisi)

- **Status:** Menggantikan/memperbarui KMA 347/2022 dengan detail lebih rinci
- **Perubahan kunci vs KMA 347:**
  - Tabel alokasi JP lebih rinci per kelas (X, XI, XII terpisah)
  - Penambahan detail mata pelajaran pilihan
  - Pengaturan P5RA lebih jelas
  - Penguatan program khusus madrasah
- **Sumber:** https://id.scribd.com/document/830922375/KMA-NOMOR-450-TAHUN-2024

### 1.4 Dasar Hukum EMIS

- KMA No. 83 Tahun 2022 (Pengelolaan Data Pendidikan)
- PMA No. 1/2023
- SE Dirjen Pendis No. SE/DJ-I/PP.00.9/63/2013

---

## 2. Struktur Kurikulum MA (KMA 450/2024)

### 2.1 Fase & Kelas

| Fase | Kelas | Asumsi |
|------|-------|--------|
| **Fase E** | Kelas X | 1 tahun = 36 minggu, 1 JP = 45 menit |
| **Fase F** | Kelas XI-XII | Kelas XI: 36 minggu, Kelas XII: 32 minggu |

### 2.2 Rumpun PAI Wajib (5 Mapel Terpisah)

SMA umum hanya memiliki 1 mapel agama. Pada MA, PAI dipecah menjadi 5 mapel mandiri:

| Mata Pelajaran | JP/Minggu Kelas X | JP/Minggu Kelas XI | JP/Minggu Kelas XII |
|---|---|---|---|
| Al-Qur'an Hadis | 2 JP | 2 JP | 2 JP |
| Akidah Akhlak | 2 JP | 2 JP | 2 JP |
| Fikih | 2 JP | 2 JP | 2 JP |
| Sejarah Kebudayaan Islam (SKI) | 2 JP | 2 JP | 2 JP |
| Bahasa Arab | 4 JP | 2 JP | 2 JP |

### 2.3 Alokasi Waktu MA Kelas X (Fase E) — Per Tahun

| Kelompok | Mata Pelajaran | Intrakurikuler (JP) | P5RA (JP) | Total JP |
|---|---|---|---|---|
| A: PAI & B. Arab | Al-Qur'an Hadis | 72 | - | 72 |
| | Akidah Akhlak | 72 | - | 72 |
| | Fikih | 72 | - | 72 |
| | SKI | 72 | - | 72 |
| | Bahasa Arab | 144 | - | 144 |
| B: Umum | Pendidikan Pancasila | Termasuk P5RA | - | 216 |
| | B. Indonesia, Matematika, B. Inggris, PJOK, Sejarah, Seni & Budaya, Informatika | Bervariasi | Bervariasi | - |
| **Total** | | | | **1.800-2.160** |

### 2.4 Alokasi Waktu MA Kelas XI (Fase F) — Per Tahun (36 Minggu)

| Kelompok | Mata Pelajaran | Intrakurikuler (JP) | P5RA (JP) | Total JP |
|---|---|---|---|---|
| PAI | Al-Qur'an Hadis | 72 | - | 72 |
| | Akidah Akhlak | 72 | - | 72 |
| | Fikih | 72 | - | 72 |
| | SKI | 72 | - | 72 |
| | Bahasa Arab | 72 | - | 72 |
| Umum | Pendidikan Pancasila | 54 | 18 | 72 |
| | Bahasa Indonesia | 108 | 36 | 144 |
| | Matematika | 108 | 36 | 144 |
| | Bahasa Inggris | 108 | - | 108 |
| | PJOK | 72 | 36 | 108 |
| | Sejarah | 54 | 18 | 72 |
| | Seni dan Budaya | 54 | 18 | 72 |
| **Subtotal Umum** | | **918** | **162** | **1.080** |
| Pilihan | 4-5 mapel @ 180 JP | 180/mapel | - | 720-900 |
| | Prakarya & Kewirausahaan | 72 | - | 72 |
| **Total** | | | | **1.800-1.980** |

### 2.5 Alokasi Waktu MA Kelas XII (Fase F) — Per Tahun (32 Minggu)

Total JP lebih kecil karena hanya 32 minggu efektif. Pola sama dengan Kelas XI, proporsional diturunkan (total ~960 JP umum).
- Sumber: https://id.scribd.com/document/787627236/4-STRUKTUR-KURIKULUM-MA-Edit

### 2.6 Peminatan Fase F (Kelas XI & XII)

Peserta didik memilih 4-5 mapel pilihan. Madrasah wajib menyediakan minimal 7 mapel pilihan:

| Rumpun | Mata Pelajaran Pilihan |
|---|---|
| MIPA | Biologi, Kimia, Fisika, Informatika, Matematika Tingkat Lanjut |
| IPS | Sosiologi, Ekonomi, Geografi, Antropologi |
| Bahasa | Bahasa Arab Tingkat Lanjut, Bahasa Inggris Tingkat Lanjut, Bahasa Asing Pilihan |
| Keagamaan (khas MA/MAPK) | Ilmu Tafsir, Ilmu Hadis, Ushul Fikih, Bahasa Arab Peminatan |

**Ketentuan penting:**
- Peserta didik boleh mengganti mapel pilihan paling lambat kelas XI semester 2
- Madrasah program khusus: alokasi penguatan program Kelas X & XI minimal 72 JP, maksimal 216 JP/tahun
- Madrasah boleh menambah/merelokasi JP sesuai analisis CP, maksimal 6 JP tambahan
- Muatan lokal bisa: (a) terintegrasi mapel lain, (b) terintegrasi tema P5RA, atau (c) mapel berdiri sendiri

### 2.7 P5RA (Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil 'Alamin)

Mengintegrasikan 6 dimensi Pelajar Pancasila dengan 10 nilai utama Rahmatan Lil 'Alamin:

| No | Nilai P5RA | Makna |
|---|---|---|
| 1 | Ta'addub | Berkeadaban |
| 2 | Qudwah | Keteladanan |
| 3 | Muwatanah | Kewarganegaraan dan Kebangsaan |
| 4 | Tawassut | Mengambil Jalan Tengah |
| 5 | Tawazun | Berimbang |
| 6 | I'tidal | Lurus dan Tegas |
| 7 | Musawah | Kesetaraan |
| 8 | Syura | Musyawarah |
| 9 | Tasamuh | Toleransi |
| 10 | Tatawwur wa Ibtikar | Dinamis dan Inovatif |

Penilaian P5RA menggunakan 4 predikat: Mulai Berkembang (MB), Sedang Berkembang (SB), Berkembang Sesuai Harapan (BSH), Sangat Berkembang (SAB). 2-3 projek per tahun dengan tema berbeda.

---

## 3. Sistem Penilaian & Rapor Digital Madrasah (RDM)

### 3.1 Komponen Asesmen (PPA Kemenag)

#### Asesmen Formatif
- **Tujuan:** Umpan balik diagnostik untuk memperbaiki proses belajar
- **Waktu:** Awal pembelajaran dan selama proses pembelajaran
- **Risiko:** Rendah (low-stakes)
- **Masuk nilai rapor?** TIDAK — RDM de facto hanya menyediakan input Sumatif dan SAS
- **Contoh:** Pertanyaan pemantik, refleksi, jurnal, penilaian antarteman, kuis pemahaman

> CATATAN: PPA Kemenag 2022 (versi awal) menyebutkan 2 alternatif — formatif BISA masuk rapor atau TIDAK. Namun RDM secara praktek hanya menyediakan input Sumatif dan SAS, sehingga de facto mengikuti model "formatif tidak masuk rapor."
> Sumber: https://mdrsh.id/v3/media/40e7581986de941887d14ccf98a13b8c342.pdf

#### Asesmen Sumatif Lingkup Materi (SLM) / Sumatif Harian
- Dilakukan setelah menyelesaikan 1 atau lebih tujuan pembelajaran (TP) / lingkup materi
- Disebut "ulangan harian" atau "penilaian harian (PH)" di lapangan
- Bisa berupa: tes tertulis, observasi, praktik, produk, projek, portofolio
- Jumlah: beberapa kali per semester (sesuai jumlah TP/LM)
- Di RDM: diinput pada menu "Sumatif" dengan nomor urut TP/LM

#### Sumatif Akhir Semester (SAS)
- Dilakukan di akhir semester
- Bersifat PILIHAN (tidak wajib jika data sumatif sudah cukup — PPA 2025)
- Biasa disebut "PAS" atau "PAT" di lapangan
- Di RDM: diinput pada menu "SAS"

### 3.2 Formula Perhitungan Nilai Rapor RDM

```
Nilai Rapor = (Rata-rata Sumatif x Bobot_Sumatif + Nilai SAS x Bobot_SAS) / (Bobot_Sumatif + Bobot_SAS)
```

Di RDM, guru mengatur bobot melalui menu "Bobot":
- Bobot Sumatif (nilai harian/SLM): angka, misal 75
- Bobot SAS (nilai ujian semester): angka, misal 25

Rasio umum yang dipakai madrasah: 75:25 (paling umum), 60:40, 50:50.

**Perhitungan detail:**
```
Langkah 1: NA_Sumatif = (Sumatif_1 + Sumatif_2 + ... + Sumatif_n) / n
Langkah 2: Nilai_Rapor = (NA_Sumatif x Bobot_S + Nilai_SAS x Bobot_SAS) / (Bobot_S + Bobot_SAS)

Contoh:
  Sumatif 1=85, Sumatif 2=83, Sumatif 3=60, Sumatif 4=84
  NA_Sumatif = (85+83+60+84)/4 = 78
  Nilai SAS = 75
  Bobot = 75:25
  Nilai Rapor = (78x75 + 75x25) / (75+25) = 7725/100 = 77.25 -> 77
```

**Sumber:**
- https://id.scribd.com/document/1063652439/Panduan-Pengisian-Rapor-Digital-Madrasah
- https://id.scribd.com/document/965883624/Panduan-Pengisian-Nilai-RDM-2

### 3.3 Kriteria Ketercapaian

- Tidak ada KKM baku nasional — ditetapkan per satuan pendidikan
- Ketercapaian ditentukan per tujuan pembelajaran, bukan dari nilai akhir saja
- Di RDM: guru mengisi "Nilai Batas Ketercapaian" per sumatif

### 3.4 Deskripsi Capaian Kompetensi

- Auto-generated dari kata kunci yang diisi guru pada deskripsi TP/LM
- Format: "[Nama siswa] [predikat] dalam [deskripsi TP/LM]"
- Hijau = di atas batas (tercapai), merah = di bawah batas (belum tercapai)
- PENTING: Guru harus teliti menulis deskripsi TP/LM karena langsung menjadi deskripsi di rapor

### 3.5 Aplikasi RDM — Peran & Alur Kerja

| Peran | Hak Akses |
|---|---|
| Proktor | Sinkron EMIS, kelola semua akun, upload logo, pengaturan cetak, backup/restore, atur TA & semester |
| Staf/Admin | Mirip proktor kecuali sinkron profil & backup |
| Kepala Madrasah | Monitoring, dashboard overview |
| Guru Mapel | Input nilai sumatif & SAS, atur bobot, kirim nilai |
| Wali Kelas | Verifikasi nilai, catatan wali kelas, presensi, sikap, cetak rapor, legger |
| Pembina Ekskul | Input nilai dan deskripsi ekstrakurikuler |

**Alur pengisian nilai:**
```
1. Proktor: Sinkron data dari EMIS (siswa, guru, mapel, kelas)
2. Proktor: Upload logo madrasah, atur TA/semester, setting cetak
3. Guru Mapel:
   a. Login -> pilih mapel -> pilih kelas
   b. Setting BOBOT (misal Sumatif:75, SAS:25)
   c. Input SUMATIF per TP/LM:
      - Nomor urut TP/LM (1, 2, 3, ...)
      - Deskripsi TP/LM (diawali KKO, tanpa huruf kapital di awal)
      - Nilai Batas Ketercapaian
      - Input nilai per siswa
   d. Input SAS (nilai ujian semester)
   e. Klik "Kirim Nilai"
4. Wali Kelas:
   a. Verifikasi status nilai 100%
   b. Input: catatan wali kelas, presensi, sikap spiritual & sosial
   c. Cetak rapor & legger
```

### 3.6 Format PDF Rapor RDM

Rapor RDM terdiri dari beberapa halaman per siswa:

**Halaman 1: Kop & Identitas**
- Kop Kementerian Agama + Kop Lembaga/Madrasah
- Logo Kemenag (kiri) + logo madrasah (kanan), watermark
- Data siswa: Nama, NISN, Kelas, Semester, Fase, Tahun Pelajaran

**Halaman 2-3: Penilaian**
- A. Sikap: Sikap Spiritual (deskripsi naratif) + Sikap Sosial (deskripsi naratif)
- B. Nilai Mata Pelajaran: Tabel 4 kolom (No, Mata Pelajaran, Nilai angka, Capaian Kompetensi)
  - Kelompok A: PAI (Al-Qur'an Hadis, Akidah Akhlak, Fikih, SKI, Bahasa Arab)
  - Kelompok B: Umum (PPKn, B. Indonesia, Matematika, B. Inggris, PJOK, Sejarah, Seni & Budaya)
  - Kelompok Pilihan (Kelas XI-XII): sesuai peminatan

**Halaman 4: Tambahan**
- C. Ekstrakurikuler (tabel: No, Kegiatan, Keterangan)
- D. Prestasi (tabel: No, Jenis Prestasi, Keterangan)
- E. Ketidakhadiran: Sakit (..) hari, Izin (..) hari, Tanpa Keterangan (..) hari
- F. Catatan Wali Kelas (narasi)
- Tanda tangan: Orang Tua/Wali, Wali Kelas (NIP), Kepala Madrasah (NIP)
- Barcode + Watermark otomatis

**Rapor P5RA (Terpisah)**
- Kop Kemenag & Kop Lembaga
- Detail siswa
- Deskripsi Projek
- Penilaian dimensi P5RA (4 level: MB, SB, BSH, SAB)
- Catatan proses
- Tanda tangan

**Dokumen cetak lainnya:**
- Legger (rekap seluruh nilai 1 siswa per semester) — tersedia PDF & Excel
- Rekap Nilai (akumulasi dari kelas awal sampai akhir)

---

## 4. EMIS 4.0 — Standar Data & Format

### 4.1 Gambaran Umum

- **Nama lengkap:** Education Management Information System 4.0
- **Operator:** Direktorat Jenderal Pendidikan Islam, Kemenag RI
- **URL:** https://emis.kemenag.go.id/
- **API base:** https://api-emis.kemenag.go.id/v1/
- **Cakupan:** RA, MI, MTs, MA/MAK, PTKI, PD-Pontren, PAI — ~31.172 RA/Madrasah, ~20 juta peserta didik
- **Arsitektur:** Microservices dengan komunikasi API antar-layanan

### 4.2 Modul Data EMIS 4.0

| # | Modul | Deskripsi |
|---|---|---|
| 1 | Data Kelembagaan | Profil lembaga, identitas, akreditasi |
| 2 | Data Sarana Prasarana | Fasilitas, bangunan, ruangan, sanitasi |
| 3 | Data Rombongan Belajar (Rombel) | Kelas/study groups |
| 4 | Data Siswa/Peserta Didik | Data pribadi siswa, orang tua, alamat |
| 5 | Data PTK | Pendidik & Tenaga Kependidikan |
| 6 | Data Mutasi | Transfer siswa masuk/keluar |
| 7 | Data Kelulusan | Proses kelulusan |
| 8 | Data Rapor/Nilai | Via RDM |

### 4.3 Data Kelembagaan (Identitas Madrasah)

**Field read-only (terkunci, perubahan memerlukan approval Kemenag):**
- NPSN (Nomor Pokok Sekolah Nasional — 8 digit)
- NSM (Nomor Statistik Madrasah — 12 digit)
- Nama Lembaga, Status (Negeri/Swasta), Jenis (RA/MI/MTs/MA/MAK), Kategori

**Field editable:**
- Nomor & Tanggal SK Izin Operasional
- Alamat lengkap (Jalan, Desa/Kel, Kec, Kab/Kota, Provinsi)
- Kode Pos (5 digit), Koordinat GPS, Telepon, Email
- No. SK Akreditasi, Tanggal, Nilai, Status (A/B/C/Belum)
- Data Rekening BOS, Personnel, Prestasi Lembaga, Letak Lembaga

### 4.4 Data Peserta Didik — Detail Lengkap

#### 4.4.1 Data Induk Kependudukan (6 field inti — validasi Dukcapil, TERKUNCI)

Perubahan memerlukan validasi VervalPD via Pusdatin:

| # | Field | Format | Validasi |
|---|---|---|---|
| 1 | Nama Lengkap | Teks | Harus cocok KK/Dukcapil (case-sensitive) |
| 2 | NIK | 16 digit | Validasi terhadap database Kemendagri Dukcapil |
| 3 | Tempat Lahir | Teks | Harus cocok KK |
| 4 | Tanggal Lahir | dd/mm/yyyy | Harus cocok KK |
| 5 | Jenis Kelamin | L / P | Harus cocok Dukcapil |
| 6 | Nama Ibu Kandung | Teks | Harus cocok KK — TIDAK BISA diubah di EMIS |

#### 4.4.2 Data Pokok Pendidikan

| Field | Format | Keterangan |
|---|---|---|
| NISN | 10 digit | Auto-issued Pusdatin, tidak editable di EMIS |
| NIS | Ditetapkan sekolah | Editable |
| Tahun Ajaran | misal 2026/2027 | |
| Status Keaktifan | Aktif / Tidak Aktif / Aktif Tanpa Rombel | |
| Tingkat | 10, 11, 12 (untuk MA) | |
| Rombel | 2 digit: 01, 02, 03... | Reset per tingkat kelas |
| Jurusan | Kode: IPA, IPS, Bahasa, Keagamaan | |
| Tanggal Masuk Sekolah | Date | |

#### 4.4.3 Data Pribadi Siswa (Editable oleh Operator)

| # | Field | Format / Opsi | Wajib |
|---|---|---|---|
| 1 | Foto | jpg/png, maks 2MB | Opsional |
| 2 | Kewarganegaraan | WNI / WNA | Ya |
| 3 | Anak Ke | Integer (dari KK) | Ya |
| 4 | Jumlah Saudara | Integer (dari KK) | Ya |
| 5 | Agama | Islam (default madrasah) | Ya |
| 6 | Cita-cita | Enum: PNS, TNI/POLRI, Guru/Dosen, Dokter, Politikus, Wiraswasta, Ilmuwan, Seniman/Artis, Agamawan, Lainnya | Opsional |
| 7 | Hobi | Enum: Olahraga, Membaca, Menulis, Jalan-jalan, Lainnya | Opsional |
| 8 | No Handphone | Nomor / "Tidak memiliki" | Opsional |
| 9 | Email Siswa | Format email | Opsional |
| 10 | Pra Sekolah | Yes/No | Ya |
| 11 | Imunisasi | Yes/No | Ya |

#### 4.4.4 Data Tempat Tinggal Siswa

| # | Field | Opsi |
|---|---|---|
| 1 | Status Tempat Tinggal | 1=Orang Tua/Wali, 2=Saudara/Kerabat, 3=Asrama Madrasah, 4=Kontrak/Kost, 5=Asrama Pesantren, 6=Panti Asuhan, 7=Rumah Singgah, 8=Lainnya |
| 2-7 | Provinsi -> Kode Pos | Hierarki wilayah administratif |
| 8 | Koordinat Alamat | Lat/Long |
| 9 | Transportasi | 1=Jalan Kaki, 2=Sepeda, 3=Sepeda Motor, 4=Mobil Pribadi, 5=Antar Jemput, 6=Angkutan Umum |
| 10 | Jarak Ke Madrasah | 1=<1 Km, 2=1-3 Km, 3=3-5 Km, 4=5-10 Km, 5=>10 Km |
| 11 | Waktu Tempuh | 1-10 Menit, 10-19, 20-29, 30-59, 1-2 Jam, >2 Jam |
| 12 | Yang Membiayai | Orang Tua / Tanggungan Sendiri / Lainnya |

> Jika "Asrama Madrasah" -> alamat auto-fill dengan alamat madrasah.
> Jika "Tinggal dengan Orang Tua/Wali" -> alamat auto-fill dari alamat ayah.

#### 4.4.5 Data Kebutuhan Khusus & Disabilitas

Flag 0/1 per kategori: Tuna Rungu, Tuna Netra, Tuna Daksa, Tuna Grahita, Tuna Laras, Lamban Belajar, Sulit Belajar, Gangguan Komunikasi, Bakat Luar Biasa.

#### 4.4.6 Data KIP & KK

| Field | Format |
|---|---|
| Nomor KIP | String (opsional) |
| Upload KIP | PDF/JPG/PNG, maks 2MB |
| Nomor KK | Numeric string |
| Nama Kepala Keluarga | Teks |
| Upload KK | PDF/JPG/PNG, maks 2MB |

### 4.5 Data Orang Tua — Detail Lengkap

#### Ayah Kandung

| Field | Format | Keterangan |
|---|---|---|
| Nama Lengkap | Teks | Perubahan butuh approval Kemenag Kab/Kota |
| NIK | 16 digit | Perubahan butuh approval |
| Status | Masih Hidup / Sudah Meninggal / Tidak Diketahui | |
| Kewarganegaraan | WNI / WNA | |
| Tempat Lahir | Teks | Perubahan butuh approval |
| Tanggal Lahir | Date | Perubahan butuh approval |
| Pendidikan Terakhir | Enum: Tidak Berpendidikan, SD, SMP, SMA, D1, D2, D3, D4/S1, S2, S3 | |
| Pekerjaan Utama | Enum: Tidak Bekerja, Pensiunan, Pengusaha, Buruh, Sopir, Pedagang, TNI/Polisi, Petani/Peternak, Guru, PNS, Swasta, Lainnya | |
| Penghasilan | 6 range: <=500rb, 500rb-1jt, 1-2jt, 2-3jt, 3-5jt, >5jt | |
| No Handphone | Nomor / "Tidak memiliki" | |
| Domisili | Dalam Negeri (alamat lengkap) / Luar Negeri (free text) | |
| Status Rumah | Milik Sendiri / Orang Tua / Saudara / Kontrak/Sewa / Lainnya | |
| Upload KK | PDF/JPG/PNG, maks 200KB | Wajib saat ubah field identitas |

#### Ibu Kandung
Field sama dengan Ayah, kecuali:
- Nama Ibu Kandung TIDAK BISA diubah di EMIS (terkunci Dukcapil)
- Tempat tinggal: opsi "Sama dengan ayah kandung" (auto-fill)

#### Wali
- Opsi: Ayah Kandung / Ibu Kandung / Lainnya
- Jika "Lainnya": set lengkap field identitas (Nama, NIK, Tempat/Tgl Lahir, dll)

### 4.6 PPDB — Aturan Bisnis untuk MA

1. Input Data Baru TIDAK tersedia untuk MA — siswa harus sudah ada di EMIS/Dapodik
2. Siswa MA harus memiliki status "alumni" dari MTs, ATAU "tidak aktif" di kelas awal jenjang yang sama
3. Pencarian siswa: NIK, NISN, atau (Nama + Tempat Lahir + Tanggal Lahir)
4. Dari madrasah: cari NSM asal + NIK/NISN
5. Dari sekolah umum: cari NPSN asal + NISN
6. Siswa aktif di lembaga lain tidak bisa didaftarkan
7. Setelah PPDB, siswa muncul "Aktif Tanpa Rombel" -> harus di-assign ke rombel

### 4.7 Mutasi (Transfer)

1. Memerlukan NPSN sekolah tujuan yang valid
2. Butuh approval Kemenag Kab/Kota
3. Setelah approval, siswa muncul di daftar aktif sekolah tujuan
4. Sekolah asal bisa cetak Surat Pindah
5. Data diperlukan: Jenis Lembaga Asal, Nama Lembaga, NSM, Tingkat, Nama Siswa, NISN, Alasan

### 4.8 Approval Workflow EMIS

```
Operator Lembaga (data entry)
  -> Draft saved
    -> Kepala Lembaga (approval)
      -> Kemenag Kab/Kota (untuk perubahan identitas)
        -> Kemenag Provinsi (operasi tertentu)
          -> Pusat (penerbitan NISN, kasus khusus)
```

Perubahan yang butuh approval Kemenag Kab/Kota:
- NIK, Nama, Tempat Lahir, Tanggal Lahir, Jenis Kelamin (data orang tua)
- Penambahan siswa di luar periode PPDB

Perubahan yang hanya butuh approval Kamad:
- Alamat, kontak, pekerjaan, pendidikan orang tua
- Data pribadi siswa (hobi, cita-cita, tempat tinggal, dll)

### 4.9 Template CSV Import/Export

**Aturan ketat:**
1. JANGAN tambah, hapus, atau modifikasi kolom
2. JANGAN tambah baris di luar template
3. Kolom A-F biasanya read-only (field identitas)
4. Simpan sebagai CSV (MS-DOS) — delimiter koma, BUKAN titik koma
5. Regional settings harus English (UK)
6. Edit dari XLS sumber, simpan sebagai CSV

**Jenis template tersedia di EMIS:**
- Template PPDB (siswa dari sekolah umum)
- Template Data Ruangan
- Template CAPESUN (calon peserta ujian, format .ez)
- Template Kebutuhan Khusus (flag 0/1)
- Template NIK/NISN/NISM
- Template Tempat Tinggal
- Template Rapor

### 4.10 Siklus Pemutakhiran Data

- Berbasis semester: Ganjil dan Genap per tahun ajaran
- Periode akses dikontrol pusat — "masa pendataan dibuka/ditutup"
- Di luar periode: read-only (hanya Lihat Detail)
- Urutan operasi: (1) Kelulusan -> (2) Kenaikan Kelas -> (3) PPDB/Siswa Baru
- Difinalisasi dengan BAP (Berita Acara Pendataan) — wajib tanda tangan Kamad (sejak TA 2025/2026)

### 4.11 Integrasi EMIS dengan Sistem Lain

| Arah | Sistem | Fungsi |
|---|---|---|
| EMIS -> Pusdatin | NISN issuance, NIK validation via Dukcapil | Sinkronisasi 1x24 jam |
| Pusdatin -> EMIS | NISN assignment, hasil validasi Dukcapil, skor akreditasi |
| EMIS -> BAN S/M | Data akreditasi (SISPENA) |
| EMIS <-> lain | RDM, PDUM, ANBK, PIP, BOS, e-RKAM, Simpatika, Pusaka, Simpeg |

**Sumber lengkap EMIS:**
- https://id.scribd.com/document/787015263/Instrumen-EMIS-Kemenag-Kab-Malang-2024
- https://id.scribd.com/presentation/802413641/FAQ-Madrasah-1
- https://www.slideshare.net/slideshow/panduan-emis-40-menu-siswa-panduan-emis-40/267649560
- https://github.com/Adibrino/EMIS-Kemenag-Student-Data-Exporter

---

## 5. Modul Khas Keislaman & Ekosistem Madrasah

### 5.1 Tahfidz & Tasmi' Al-Qur'an

**Data per setoran hafalan:**
- Tanggal/waktu setoran
- Siswa (santri)
- Jenis: Ziyadah (hafalan baru) vs Muraja'ah (pengulangan/review)
- Surah + Ayat awal -> Ayat akhir (atau berbasis halaman)
- Juz
- 3 dimensi penilaian:
  - Tajwid (kebenaran hukum bacaan)
  - Makhrajul huruf (titik artikulasi)
  - Kelancaran/Fashahah (kelancaran membaca)
- Status: Lulus / Perlu Perbaikan
- Guru/penguji yang menyimak
- Catatan (opsional)

**Ujian Tasmi':** Ujian sekali duduk per juz (Juz 30 atau juz target kurikulum).

**Sumber:**
- https://ojs.staialfurqan.ac.id/alqiyam/article/download/1401/947/
- https://e-journal.unimudasorong.ac.id/index.php/jurnalpetisi/article/download/4615/2060

### 5.2 Mutaba'ah Yaumiyah (Pemantauan Amalan Harian)

Pemantauan ibadah harian siswa/santri:
- Sholat 5 waktu berjamaah
- Sholat Dhuha
- Sholat Tahajud (untuk madrasah berasrama)
- Tilawah harian
- Puasa sunnah

Format: checklist harian per siswa. 1 baris per siswa, kolom per amalan, isi: centang/silang.

### 5.3 Tata Tertib, Poin Pelanggaran & Prestasi

- Akumulasi poin kedisiplinan per siswa
- Tiap jenis pelanggaran memiliki bobot poin (ditetapkan madrasah)
- Batas ambang untuk Surat Peringatan (SP): SP1, SP2, SP3
- Apresiasi prestasi juga dicatat dengan poin positif
- Kategori prestasi EMIS: Akademik, Keagamaan, Teknologi, Olahraga, Pramuka/Paskibra, Karya Ilmiah, Kesenian, Pidato Bahasa Asing, Sains, Lainnya

### 5.4 Keuangan Madrasah (SPP & Billing)

**Alur operasional:**
1. Admin generate tagihan bulanan per siswa berdasarkan kelas/aturan pembayaran
2. Orang tua bayar (tunai di loket, transfer, QRIS/e-wallet)
3. Admin catat pembayaran — pilih siswa -> jumlah auto-populated dari tagihan outstanding
4. Cetak kwitansi (PDF)
5. Tracking tunggakan per siswa

**Jenis pos tagihan:**
- SPP bulanan
- Uang seragam
- LKS (Lembar Kerja Siswa)
- Uang gedung/pembangunan
- Infaq/komite
- Dispensasi ujian (siswa dengan tunggakan bisa dispensasi oleh Kamad)

**Sumber:**
- https://jurnal.dharmawangsa.ac.id/index.php/syntax/en/article/view/8004
- https://journal.al-matani.com/index.php/jtisi/article/download/517/332

---

## 6. Data PTK (Pendidik & Tenaga Kependidikan)

Data migrasi Simpatika -> EMIS 4.0 (Oktober 2024):

| Kategori | Field |
|---|---|
| Data Diri | Nama, Tempat Lahir, Tgl Lahir, Jenis Kelamin, Nama Ibu, NIK, No HP, Email, Alamat |
| Data Induk | NIK, Nama, Tempat/Tgl Lahir, Jenis Kelamin, Nama Ibu — validasi Dukcapil via VervalPTK |
| Data Bertugas | Tempat Tugas, No SK, Tgl SK, Jenis PTK, File SK |
| Sertifikasi | NRG, Mapel Sertifikasi, No Serdik, No Peserta, LPTK Penyelenggara |
| Inpassing | Golongan, TMT, SK Inpassing |
| NUPTK | Konversi dari NPK; syarat: NIK valid, riwayat pendidikan lengkap |
| Status Kepegawaian | PNS, PPPK, GTY (Guru Tetap Yayasan), GTT (Guru Tidak Tetap) |
| Pendidikan Formal | Harus diinput ulang — butuh upload ijazah untuk NUPTK |
| Jadwal | Harus diinput ulang |

**Sumber:** https://www.slideshare.net/slideshow/penjelsan-emis-4-0-untuk-akun-guru_2024-pdf/273207063

---

## 7. Risiko & Limitasi Riset

| # | Tipe | Deskripsi | Mitigasi |
|---|---|---|---|
| 1 | Risiko | Format EMIS bisa berubah tiap tahun ajaran | Field JSONB di database untuk mengakomodasi perubahan tanpa migrasi skema |
| 2 | Risiko | API EMIS tidak terdokumentasi resmi — struktur berasal dari reverse engineering | Wrapper abstraction layer, bisa diganti tanpa ubah core |
| 3 | Risiko | Formula RDM bisa diubah Kemenag melalui update aplikasi | Bobot & formula configurable, bukan hardcoded |
| 4 | Risiko | Madrasah berbeda bisa pakai alternatif berbeda (formatif masuk/tidak masuk rapor) | Toggle konfigurasi per madrasah |
| 5 | Limitasi | Tidak semua field EMIS 4.0 terverifikasi karena tidak ada dokumentasi API publik resmi | Tandai field yang belum terverifikasi |
| 6 | Limitasi | Detail teknis integrasi sinkronisasi EMIS<->RDM belum bisa diverifikasi langsung | Bangun fitur export CSV yang kompatibel EMIS template |

---

## Sumber & Validasi

| # | Sumber | Tanggal Akses | Status |
|---|---|---|---|
| 1 | KMA 347/2022 PDF (paralegal.id) | 2026-11-07 | Verified |
| 2 | KMA 450/2024 (Scribd) | 2026-11-07 | Verified |
| 3 | Panduan Pengisian RDM (Scribd) | 2026-11-07 | Verified |
| 4 | Panduan Pengisian Nilai RDM (Scribd) | 2026-11-07 | Verified |
| 5 | PPA Kemenag 2022 PDF (mdrsh.id) | 2026-11-07 | Verified |
| 6 | Instrumen EMIS Kemenag (Scribd) | 2026-11-07 | Verified |
| 7 | Panduan EMIS 4.0 Menu Siswa (SlideShare) | 2026-11-07 | Verified |
| 8 | EMIS Student Data Exporter (GitHub) | 2026-11-07 | Verified |
| 9 | FAQ Madrasah EMIS (Scribd) | 2026-11-07 | Verified |
| 10 | Jurnal SIM Akademik & SPP Madrasah | 2026-11-07 | Verified |
| 11 | Penelitian UIN tentang RDM | 2026-11-07 | Verified |
| 12 | Penjelasan EMIS 4.0 Akun Guru (SlideShare) | 2026-11-07 | Verified |
