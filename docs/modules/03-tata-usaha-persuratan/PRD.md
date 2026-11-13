# PRD: 03. Administrasi Tata Usaha & Tata Persuratan Dinas

**Modul:** Tata Usaha & Surat Menyurat (Persuratan Dinas)  
**Urutan:** Modul 03 — Fondasi Administrasi & Persuratan Madrasah  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** PMA No. 12 Tahun 2024 (Tata Naskah Dinas Kemenag), KMA No. 44 Tahun 2010 (Pola Klasifikasi Surat Kemenag RI), [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Tata Usaha (TU) adalah tulang punggung operasional madrasah. Setiap hari, TU memproses puluhan surat masuk dari Kementerian Agama (Pusat, Kanwil, Kankemenag Kabupaten/Kota), yayasan, instansi dinas, serta menerbitkan surat keluar dan surat keterangan bagi siswa dan guru. 

Permasalahan klasik madrasah adalah:
1. Penomoran surat manual yang rawan loncat, tertukar, atau ganda.
2. Kehilangan arsip fisik surat dinas dan disposisi pimpinan yang terselip.
3. Lambatnya pembuatan surat keterangan rutin (Surat Keterangan Aktif Siswa, Surat Tugas, Surat Pindah) karena staf TU harus mengetik ulang biodata siswa/guru dari nol di Microsoft Word.
4. Lemahnya verifikasi keaslian surat madrasah terhadap potensi pemalsuan surat keterangan beasiswa.

Modul ini mendigitalisasi seluruh rantai persuratan dinas madrasah aliyah sesuai standar regulasi Tata Naskah Dinas Kementerian Agama RI, menyediakan buku agenda digital, disposisi pimpinan terstruktur, generator surat otomatis berbasis database pokok, dan verifikasi QR Code keaslian dokumen.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Agenda Surat Masuk | Disposisi Kamad | Agenda Surat Keluar | Generator Surat Dinas | Arsip Digital |
|---|---|---|---|---|---|
| `admin_tu` | Full CRUD | Read Disposisi | Full CRUD + Generate No | Buat Draft & Cetak PDF | Full CRUD |
| `kepala_madrasah` | Read Only | Beri Disposisi / Instruksi | Monitoring & TTD | Validasi & Pengesahan | Read Only |
| `waka_kurikulum` / `waka_kesiswaan` | Read Disposisi Terkait | Tindak Lanjut Disposisi | Read Only | Request Surat Tugas | Read Only |
| `guru_mapel` | Read Disposisi (Jika dituju) | Tindak Lanjut | Read Only | Terima Surat Tugas | - |
| `siswa` / `orang_tua` | - | - | - | Request Surat Keterangan | - |

---

## 3. Alur Proses Bisnis

### 3.1 Alur Pengelolaan Surat Masuk & Disposisi Elektronik
```
[Surat Fisik/Email Diterima]
         │
         ▼
[Admin TU: Input Agenda Surat Masuk & Upload Scan PDF]
         │
         ▼
[Kepala Madrasah: Terima Notifikasi & Buka Lembar Disposisi]
         │
         ├─ Pilih Sifat: Sangat Segera / Segera / Biasa
         ├─ Pilih Penerima: Waka Kurikulum / Waka Kesiswaan / TU / Guru
         ├─ Isi Instruksi: Tanggapi / Hadiri / Koordinasikan / Arsipkan
         │
         ▼
[Penerima Disposisi: Menerima Instruksi & Menjalankan Tindak Lanjut]
         │
         ▼
[Arsip Disposisi Ditutup & Masuk Riwayat Kearsipan]
```

### 3.2 Alur Penomoran Otomatis Surat Keluar (PMA Kemenag)
Format nomor surat dinas Kementerian Agama:
`[Derajat Pengamanan]-[Nomor Urut]/[Kode Satker]/[Kode Klasifikasi]/[Bulan]/[Tahun]`
Contoh: `B-089/Ma.13.04/PP.00.6/05/2026`
- `B`: Derajat Pengamanan (`B` = Biasa, `R` = Rahasia, `SR` = Sangat Rahasia).
- `089`: Nomor urut agenda surat keluar (dihitung otomatis secara sekuensial per tahun takwim).
- `Ma.13.04`: Kode satker Madrasah Aliyah di lingkungan Kanwil & Kankemenag bersangkutan.
- `PP.00.6`: Kode Klasifikasi Kearsipan Kemenag (Pendidikan Islam Madrasah Aliyah).
- `05`: Bulan penerbitan (2 digit angka Arab).
- `2026`: Tahun takwim penerbitan.

### 3.3 Alur Generator Surat Keterangan Otomatis (Sekali Klik)
1. Siswa atau orang tua mengajukan permohonan Surat Keterangan Aktif Siswa (untuk tunjangan gaji orang tua, beasiswa PIP/KIP, atau paspor).
2. Admin TU membuka fitur **Generator Surat Keterangan Aktif**.
3. Admin TU cukup mengetik NISN, NIS, atau Nama Siswa (auto-complete dari Buku Induk Siswa).
4. Sistem secara otomatis menarik data: Nama Lengkap, NISN, NIK, Tempat/Tgl Lahir, Kelas/Rombel aktif, Nama Ayah/Ibu, dan Alamat Rumah.
5. Admin TU memilih tujuan penggunaan surat (misal: "Pengurusan Tunjangan Anak Gaji Orang Tua pada PT Taspen").
6. Sistem menghasilkan draf surat dengan nomor surat keluar resmi yang baru dialokasikan.
7. Sistem merender dokumen PDF siap cetak dengan Kop Resmi Madrasah Kemenag, logo, QR code verifikasi keaslian, dan kolom tanda tangan Kamad / Staf TU a.n. Kamad.
8. Salinan surat otomatis tersimpan di Arsip Surat Keluar dan riwayat dokumen siswa bersangkutan.

---

## 4. Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-TU-01** | Agenda Surat Masuk | Form pencatatan surat masuk: No. Agenda (auto), No. Surat Pengirim, Tgl Surat, Tgl Diterima, Asal Surat, Perihal, Ringkasan, Kategori/Klasifikasi, dan upload berkas pindaian (PDF/JPG maks 5MB). |
| **F-TU-02** | Lembar Disposisi Digital | Fasilitas khusus Kamad untuk memberikan petunjuk disposisi, memilih staf/guru tujuan disposisi, catatan pimpinan, dan batas waktu tindak lanjut. |
| **F-TU-03** | Penomoran Otomatis Surat Keluar | Generator nomor urut surat keluar yang terkunci secara transaksi per tahun takwim, mengombinasikan kode klasifikasi Kemenag, kode madrasah, bulan, dan tahun. |
| **F-TU-04** | Agenda Surat Keluar | Rekapitulasi surat keluar: No. Surat, Tgl Surat, Ditujukan Kepada, Perihal, Penandatangan, File Surat Jadi (PDF berstempel/TTD). |
| **F-TU-05** | Master Klasifikasi Surat Kemenag | Katalog kode klasifikasi surat Kemenag (KMA 44/2010): `PP.00.6` (Madrasah Aliyah), `KP.00` (Kepegawaian/GTK), `KS.01` (Keuangan), `HM.00` (Humas), `OT.00` (Organisasi & Tata Laksana). |
| **F-TU-06** | Generator Surat Keterangan Aktif Siswa | Pembuatan instan surat aktif belajar terhubung ke database siswa aktif semester berjalan, lengkap dengan data orang tua dan keperluan surat. |
| **F-TU-07** | Generator Surat Tugas GTK | Pembuatan surat tugas dinas bagi guru/karyawan (untuk pelatihan, MGMP, workshop, pengawas ujian), mencantumkan dasar penugasan, waktu, dan tempat pelaksanaan. |
| **F-TU-08** | Generator Surat Keterangan Berkelakuan Baik (SKKB) | Surat rekomendasi kesiswaan dari madrasah untuk keperluan beasiswa atau kelanjutan studi. |
| **F-TU-09** | Generator Undangan Wali Murid | Pembuatan surat undangan pertemuan wali murid / pembagian rapor secara massal per rombel kelas. |
| **F-TU-10** | QR Code Keabsahan Dokumen | Setiap surat dinas yang digenerate memuat QR Code unik yang bila dipindai (scan) menampilkan halaman verifikasi keaslian surat resmi madrasah. |
| **F-TU-11** | Buku Ekspedisi Surat | Catatan bukti penyampaian fisik surat dinas (tanggal kirim, nama penerima, tanda tangan/paraf tanda terima). |
| **F-TU-12** | Pencarian & Filter Arsip Persuratan | Pencarian multi-kriteria: rentang tanggal, kata kunci perihal, nama pengirim/penerima, status disposisi, dan kode klasifikasi. |

---

## 5. Aturan Validasi & Integritas Data

1. **Anti-Duplikasi Penomoran Surat:**
   - Nomor surat keluar harus memiliki constraint unik kombinasi `(academic_year_id/year, sequence_number)`.
   - Pengambilan nomor urut surat keluar wajib menggunakan mekanisme `SELECT FOR UPDATE` atau sekuens atomik database agar tidak terjadi nomor kembar saat dua staf TU membuat surat bersamaan.
2. **Keterikatan Data Entitas (Integrity Constraint):**
   - Siswa yang dibuatkan Surat Keterangan Aktif wajib berstatus `Aktif` di tabel `students` dan terdaftar di `class_students` pada semester berjalan.
   - Guru yang dibuatkan Surat Tugas wajib berstatus `Aktif` di tabel `teachers`.
3. **Penyimpanan Berkas Digital:**
   - Scan berkas surat disimpan di storage lokal terisolasi (`storage/uploads/letters/`) dengan nama file UUID yang tersanitasi.
   - Format file yang diizinkan: PDF, JPG, PNG (maksimal 5MB per berkas).
4. **Keamanan Disposisi:**
   - Hanya user dengan role `kepala_madrasah` (atau Pelaksana Tugas Kamad) yang berhak membuat atau menyetujui lembar disposisi.

---

## 6. Template & Layout Naskah Dinas Resmi (PDF)

Setiap surat dinas yang dihasilkan sistem wajib mengikuti pedoman PMA No. 12 Tahun 2024:
1. **Kepala Surat (Kop Dinas):**
   - Lambang Kementerian Agama RI (Ikhlas Beramal) di sisi kiri.
   - Baris 1: `KEMENTERIAN AGAMA REPUBLIK INDONESIA` (Arial 14, Bold, Huruf Kapital).
   - Baris 2: `KANTOR KEMENTERIAN AGAMA KABUPATEN/KOTA ...` (Arial 12, Bold, Huruf Kapital).
   - Baris 3: `MADRASAH ALIYAH NEGERI/SWASTA ...` (Arial 11, Bold, Huruf Kapital).
   - Baris 4: Alamat lengkap, kode pos, telepon, email, website resmi (Arial 9).
   - Garis tebal ganda pemisah kop dinas.
2. **Isi Surat:**
   - Judul Surat Keterangan dan Nomor Surat resmi di bagian tengah atas.
   - Identitas pejabat penandatangan (Kamad: Nama, NIP, Pangkat/Golongan, Jabatan).
   - Identitas siswa / guru yang diterangkan.
   - Maksud dan tujuan penerbitan surat.
   - Klausul penutup dan tanggal penetapan di kota madrasah.
3. **Kaki Surat (Tanda Tangan & QR Code):**
   - Sisi kiri: QR Code validasi keaslian dokumen.
   - Sisi kanan: Jabatan, tanda tangan / stempel digital, nama terang, dan NIP Kepala Madrasah.

---

## 7. Kriteria Penerimaan (Acceptance Criteria)

### Skenario 1: Pencatatan Surat Masuk & Penerbitan Disposisi Kamad
- **GIVEN** Admin TU menerima surat edaran Kanwil Kemenag mengenai Ujian Madrasah.
- **WHEN** Admin TU mencatat surat masuk di agenda, mengunggah file PDF surat, dan menyimpan data.
- **THEN** Status surat berubah menjadi "Menunggu Disposisi", dan muncul di antarmuka Kamad.
- **WHEN** Kamad membuka surat tersebut, memilih disposisi kepada `waka_kurikulum` dengan instruksi "Segera susun POS Ujian dan koordinasikan dengan guru", lalu klik Kirim.
- **THEN** Sistem mencatat lembar disposisi, status surat menjadi "Didisposisikan", dan Waka Kurikulum menerima notifikasi agenda disposisi di dasbornya.

### Skenario 2: Generator Surat Keterangan Aktif Siswa Otomatis
- **GIVEN** Siswa bernama "Muhammad Fajar" (NISN: 0081234567, Kelas X-A) membutuhkan surat aktif untuk beasiswa.
- **WHEN** Admin TU membuka menu Generator Surat Keterangan, memilih siswa "Muhammad Fajar", menginput keperluan "Pengajuan Beasiswa Baznas", dan klik "Terbitkan Surat".
- **THEN** Sistem secara atomik mengalokasikan nomor surat keluar terbaru (misal: `B-105/Ma.09.12/PP.00.6/05/2026`), mengunci nomor tersebut di buku agenda keluar, dan merender dokumen PDF siap cetak dengan data siswa yang presisi 100%.

### Skenario 3: Verifikasi Keabsahan Dokumen via QR Code
- **GIVEN** Pihak eksternal (misal instansi penyedia beasiswa atau kantor Taspen) memindai QR code pada fisik surat keterangan yang dicetak dari SIMMA.
- **WHEN** Kamera/browser membuka URL yang tersemat pada QR Code (`/verify/letter/:hash`).
- **THEN** Sistem menampilkan halaman verifikasi publik resmi yang menyatakan: "DOKUMEN ASLI DAN TERVERIFIKASI", menampilkan nomor surat, tanggal terbit, nama siswa, dan nama Kepala Madrasah yang mengesahkan.
