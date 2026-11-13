# PRD: 10. Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil 'Alamin (P5RA)

**Modul:** P5RA (Profil Pelajar Pancasila & Profil Pelajar Rahmatan Lil 'Alamin)  
**Urutan:** Modul 10 — Kokurikuler & Pembentukan Karakter  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** Panduan Pengembangan Kokurikuler P5RA Kemenag RI, KMA 347/2022, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Kurikulum Merdeka di madrasah mewajibkan alokasi 20-30% jam pelajaran untuk kegiatan kokurikuler Projek Penguatan Profil Pelajar Pancasila dan Profil Pelajar Rahmatan Lil 'Alamin (P5RA). P5RA bertujuan menanamkan karakter bangsa yang beriman dan bertakwa, serta karakter moderasi beragama khas Islam Indonesia.

Modul ini memfasilitasi tim fasilitator projek madrasah dalam merancang tema projek, memetakan dimensi P5 dan nilai-nilai moderasi Rahmatan Lil 'Alamin, menginput asesmen perkembangan siswa dengan 4 skala predikat, serta mencetak Buku Rapor P5RA tersendiri.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Setup Tema & Sub-Elemen Projek | Input Penilaian Siswa | Cetak Rapor P5RA | Monitoring & Evaluasi |
|---|---|---|---|---|
| `fasilitator_p5ra` (Koordinator) | RW | RW (Rombel binaan) | RW | R |
| `wali_kelas` | R | RW (Kelas perwalian) | RW (PDF Rapor) | R |
| `waka_kurikulum` | RW (Validasi Tema) | R | R | Full Monitoring |
| `kepala_madrasah` | Pengesahan | R | R (Tanda Tangan) | Full Report |

---

## 3. Dimensi P5 & Nilai Utama Rahmatan Lil 'Alamin

Sistem mengadopsi struktur resmi Kemenag RI:
- **6 Dimensi Profil Pelajar Pancasila:** Beriman, Bertakwa kepada Tuhan YME & Berakhlak Mulia; Berkebhinekaan Global; Bergotong Royong; Mandiri; Bernalar Kritis; Kreatif.
- **10 Nilai Profil Pelajar Rahmatan Lil 'Alamin:**
  1. *Berkeadaban (Ta'addub)*
  2. *Keteladanan (Qudwah)*
  3. *Kewarganegaraan dan Kebangsaan (Muwathanah)*
  4. *Mengambil Jalan Tengah (Tawassuth)*
  5. *Berimbang (Tawazun)*
  6. *Lurus dan Tegas (I'tidal)*
  7. *Kesetaraan (Musawah)*
  8. *Musyawarah (Syura)*
  9. *Toleransi (Tasamuh)*
  10. *Dinamis dan Inovatif (Tathawwur wa Ibtikar)*

---

## 4. Fitur Utama & Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-P5R-01** | Konfigurasi Tema & Projek | Setup 2 s.d. 3 projek per tahun ajaran (Pilihan tema resmi: Gaya Hidup Berkelanjutan, Kearifan Lokal, Bhinneka Tunggal Ika, Bangunlah Jiwa dan Raganya, Suara Demokrasi, Rekayasa & Teknologi, Kewirausahaan, Kebekerjaan). |
| **F-P5R-02** | Pemetaan Dimensi & Elemen | Mengaitkan setiap projek dengan 2-3 target sub-elemen P5 dan 1-2 nilai utama Rahmatan Lil 'Alamin beserta target capaian fase E (Kelas X) atau fase F (Kelas XI-XII). |
| **F-P5R-03** | Matriks Penilaian 4 Skala | Lembar penilaian siswa per projek menggunakan 4 predikat baku: `MB` (Mulai Berkembang), `SB` (Sedang Berkembang), `BSH` (Berkembang Sesuai Harapan), `SAB` (Sangat Berkembang). |
| **F-P5R-04** | Generator Catatan Proses Projek | Pembuatan deskripsi naratif otomatis mengenai keterlibatan, inisiatif, dan refleksi kepemimpinan siswa selama pelaksanaan aksi projek. |
| **F-P5R-05** | Cetak Rapor P5RA Resmi (PDF) | Generator dokumen PDF Rapor P5RA mandiri (terpisah dari rapor intrakurikuler) format Kemenag, dilengkapi logo, penjelasan dimensi, predikat, dan tanda tangan digital. |
| **F-P5R-06** | Rekap Capaian Kokurikuler Kelas | Ringkasan distribusi predikat per kelas untuk bahan evaluasi tim kurikulum madrasah. |

---

## 5. Kriteria Penerimaan (Acceptance Criteria)

- **GIVEN** Koordinator Projek telah memetakan Projek 1: "Kearifan Lokal - Eksplorasi Seni Kaligrafi Islam Tradisional".
- **WHEN** Fasilitator menilai 36 siswa pada 3 target elemen dan mengklik "Generate Rapor P5RA Kelas X-A".
- **THEN** Terbit dokumen PDF Rapor P5RA komprehensif berisi ringkasan projek, matriks capaian sub-elemen, catatan proses individual, dan lembar pengesahan Kepala Madrasah.
