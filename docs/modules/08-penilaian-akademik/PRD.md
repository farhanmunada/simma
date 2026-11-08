# PRD: 08. Penilaian Akademik (Kurikulum Merdeka KMA 347/450)

**Modul:** Penilaian Akademik & Asesmen Sumatif/SAS  
**Urutan:** Modul 08 — Evaluasi Capaian Pembelajaran  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** KMA No. 347 Tahun 2022, KMA No. 450 Tahun 2024, Juknis Penilaian Madrasah Kemenag, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Kurikulum Merdeka di Madrasah Aliyah mengadopsi penilaian berbasis Tujuan Pembelajaran (TP) atau Lingkup Materi (LM). Pengalaman guru dalam menginput nilai harus mulus tanpa risiko kehilangan data akibat koneksi terputus.

Modul ini menyediakan antarmuka *spreadsheet-like grid* dengan kapabilitas autosave per-sel, navigasi keyboard cepat (Enter/Tab), kalkulasi nilai akhir otomatis sesuai formula Kemenag RI, serta pembentukan narasi capaian kompetensi tertinggi dan terendah secara otomatis.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Setup TP & Bobot Nilai | Input Nilai di Grid | Kirim Nilai (Finalize) | Verifikasi & Kunci |
|---|---|---|---|---|
| `guru_mapel` | RW (Mapel yang diampu) | RW (Kelasnya) | RW (Submit) | R |
| `wali_kelas` | R | R (Kelas perwalian) | - | RW (Verifikasi Legger) |
| `waka_kurikulum` | RW (Template Bobot) | R (Seluruh Madrasah) | Override Lock | Full Lock Semester |
| `kepala_madrasah` | R | R | - | Monitoring Kelulusan |

---

## 3. Fitur Utama & Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-NIL-01** | Setup Tujuan Pembelajaran (TP/LM) | Guru mendaftarkan 3 s.d. 8 TP/LM per semester. Setiap TP memiliki ringkasan kompetensi yang akan menjadi basis kalimat deskripsi rapor. |
| **F-NIL-02** | Spreadsheet Input Grid | Tampilan tabel baris siswa dan kolom nilai asesmen. Navigasi keyboard (Arrow Keys, Tab, Enter) untuk entri cepat tanpa klik mouse. |
| **F-NIL-03** | Autosave Per-Sel (Debounced 500ms) | Setiap perubahan angka di sel otomatis tersimpan ke server dalam 500ms tanpa tombol "Simpan" manual. Mencegah kehilangan data jika browser tertutup mendadak. |
| **F-NIL-04** | Konfigurasi Bobot Penilaian | Pengaturan rasio bobot Sumatif TP/LM terhadap Sumatif Akhir Semester (SAS/SAT), default 75% : 25% atau 60% : 40% sesuai kesepakatan madrasah. |
| **F-NIL-05** | Formula Nilai Akhir Otomatis | Perhitungan real-time: `Nilai_Akhir = (Rata2_Sumatif * Bobot_S + Nilai_SAS * Bobot_SAS) / 100`. Nilai bulat rentang 0-100. |
| **F-NIL-06** | Generator Narasi Capaian Otomatis | Sistem otomatis mendeteksi TP dengan nilai tertinggi ("Menunjukkan penguasaan sangat baik dalam...") dan nilai terendah ("Perlu bimbingan dan peningkatan dalam...") sesuai standar KMA 347/450. |
| **F-NIL-07** | Siklus Status: Draft -> Dikirim | Guru mengisi dalam status `draft`. Setelah seluruh siswa lengkap dan terverifikasi, guru mengeklik "Kirim Nilai ke Wali Kelas" (`submitted`). Data terkunci dari pengeditan guru. |
| **F-NIL-08** | Ekspor / Impor Nilai Excel | Fasilitas unduh template spreadsheet Excel ber-ID siswa dan unggah kembali secara batch untuk guru yang bekerja offline. |
| **F-NIL-09** | Audit Trail Perubahan Nilai | Pencatatan riwayat setiap perubahan nilai: pencatat, waktu perubahan, sel yang diubah, serta nilai lama vs nilai baru. |

---

## 4. Aturan Validasi & Integritas Data

1. **Batas Rentang Nilai:** Nilai wajib berupa angka bulat (integer) dengan rentang minimum 0 dan maksimum 100.
2. **Kewajiban Pengisian TP/LM:** Guru tidak dapat menginput nilai jika belum membuat minimal 2 Tujuan Pembelajaran pada semester berjalan.
3. **Pencegahan Kirim Nilai Parsial:** Tombol "Kirim Nilai ke Wali Kelas" hanya aktif jika 100% siswa di kelas tersebut telah memiliki nilai sumatif dan SAS yang lengkap.

---

## 5. Kriteria Penerimaan (Acceptance Criteria)

- **GIVEN** Guru Fisika membuka grid penilaian kelas XI-MIPA (36 siswa) dengan 4 TP dan 1 SAS.
- **WHEN** Guru mengetik nilai 85 di TP-1 lalu menekan Tab ke TP-2 dan mengetik 90.
- **THEN** Status indikator di pojok kanan sel menampilkan "Tersimpan" dalam 500ms, rata-rata sumatif langsung terupdate di kolom kalkulasi, dan deskripsi capaian terbentuk otomatis tanpa lag.
