# PRD: 18. Integrasi & Ekspor Data EMIS 4.0 Kemenag

**Modul:** Integrasi & Ekspor Pangkalan Data EMIS 4.0  
**Urutan:** Modul 18 — Standarisasi & Pelaporan Nasional Kementerian Agama  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** Petunjuk Teknis Pangkalan Data EMIS 4.0 Ditjen Pendis Kemenag RI, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Setiap semester ganjil dan genap, operator madrasah memikul tanggung jawab krusial melakukan pemutakhiran data ke sistem terpusat Ditjen Pendidikan Islam Kementerian Agama: EMIS 4.0 (*Education Management Information System*). Keakuratan data EMIS menentukan pencairan Dana Bantuan Operasional Sekolah (BOS), kuota Program Indonesia Pintar (PIP), keikutsertaan Asesmen Kompetensi Madrasah Indonesia (AKMI), serta verifikasi kelulusan dan blanko ijazah nasional.

Modul ini bertindak sebagai mesin kurasi dan validasi data otomatis: mendeteksi data yang belum lengkap (anomali NIK, NISN hilang, ketiadaan nama ibu kandung), menyajikan dasbor audit kesiapan data (*readiness meter*), serta menghasilkan berkas ekspor format resmi yang siap diunggah ke portal EMIS Kemenag tanpa penolakan validasi server pusat.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Jalankan Validasi Audit EMIS | Ekspor Template Siswa/GTK | Pembersihan Data Anomali | Pengesahan BAP EMIS |
|---|---|---|---|---|
| `operator_emis` (Staf IT/TU) | Full Execution | Full Download | RW (Koreksi Cepat) | Draft BAP |
| `admin_tu` | R (Monitoring) | R | RW | - |
| `kepala_madrasah` | R (Status Kesiapan) | R | - | Approval Berita Acara |

---

## 3. Fitur Utama & Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-EMS-01** | Mesin Audit Validasi Pra-Sinkronisasi | Pengecekan otomatis kepatuhan parameter wajib EMIS 4.0: (1) NIK 16 digit sesuai aturan Dukcapil, (2) NISN 10 digit numerik, (3) Nama Ibu Kandung tidak boleh kosong/karakter spesial, (4) No KK dan data alamat lengkap, (5) Data periodik tinggi/berat badan dan jarak tempuh. |
| **F-EMS-02** | Dasbor Kesiapan Data (Readiness Meter) | Indikator visual tingkat kesiapan sinkronisasi madrasah (misal: "96.4% Siap Kirim, 3.6% Memerlukan Perbaikan"), dilengkapi daftar klik untuk langsung menuju form perbaikan siswa/GTK terkait. |
| **F-EMS-03** | Generator Berkas Ekspor Siswa EMIS | Menghasilkan dokumen spreadsheet/CSV terstandarisasi dengan header kolom persis sesuai template resmi unggah massal portal EMIS 4.0 Siswa. |
| **F-EMS-04** | Generator Berkas Ekspor GTK EMIS | Ekspor data riwayat kepegawaian pendidik dan tenaga kependidikan untuk sinkronisasi akun Simpatika/SIAGA dan EMIS GTK. |
| **F-EMS-05** | Generator Berkas Ekspor Rombel & Pembelajaran | Ekspor struktur rombongan belajar, wali kelas, serta pemetaan kurikulum per tingkat kelas. |
| **F-EMS-06** | Pengarsipan Riwayat & Berita Acara Pendataan (BAP) | Penyimpanan riwayat log ekspor per semester dan fasilitas pencetakan draf Berita Acara Pendataan (BAP) EMIS yang ditandatangani Kepala Madrasah. |

---

## 4. Aturan Validasi Standar EMIS Kemenag

1. **Format NIK & KK:** Wajib tepat 16 digit angka, tidak boleh mengandung spasi atau tanda hubung (`^\d{16}$`).
2. **Kewajiban Nama Ibu Kandung:** Nama ibu kandung adalah data kunci pemadanan Dukcapil di pangkalan data Kemenag; dilarang keras menggunakan tanda strip (`-`), titik (`.`), atau teks placeholder ("Tidak Tahu").
3. **Data Periodik Siswa:** Tinggi badan (cm) dan berat badan (kg) wajib berada dalam rentang angka biologis wajar usia remaja madrasah.

---

## 5. Kriteria Penerimaan (Acceptance Criteria)

- **GIVEN** Operator madrasah membuka halaman Audit EMIS menjelang penutupan cut-off semester genap.
- **WHEN** Operator mengeklik tombol "Jalankan Audit Kepatuhan Data Siswa".
- **THEN** Sistem memindai 450 siswa dalam waktu < 2 detik, memunculkan 3 siswa yang belum mengisi NIK orang tua, dan setelah diperbaiki, tingkat kesiapan mencapai 100% serta tombol "Unduh File Impor EMIS 4.0" aktif.
