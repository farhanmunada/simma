# PRD: 16. Tata Tertib, Kedisiplinan & Poin Karakter

**Modul:** Tata Tertib, Poin Pelanggaran & Penghargaan Prestasi  
**Urutan:** Modul 16 — Pembinaan Disiplin & Bimbingan Konseling  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** Pedoman Pembinaan Kesiswaan & Tata Tertib Madrasah Kemenag RI, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Pembentukan akhlak karimah di madrasah dan pondok pesantren menuntut transparansi dalam penegakan disiplin santri. Sistem buku saku manual seringkali subjektif, catatan pelanggaran tidak terkumpul terpadu, dan orang tua baru mengetahui pelanggaran saat anak sudah di ambang sanksi berat (skorsing/drop out).

Modul ini mengimplementasikan sistem poin perilaku berimbang (kredit poin pelanggaran dan poin prestasi apresiatif), matriks eskalasi penindakan otomatis berjenjang (SP-1 hingga SP-3), pencatatan rekam konseling Guru BK, serta penerbitan otomatis Surat Panggilan Orang Tua resmi.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Catat Pelanggaran / Prestasi | Kelola Master Poin & Aturan | Catat Bimbingan Konseling | Cetak Surat Panggilan Ortu |
|---|---|---|---|---|
| `guru_bk` (Guru Bimbingan Konseling) | RW | RW | RW (Catatan Rahasia BK) | RW |
| `waka_kesiswaan` | RW | RW (Otorisasi Ambang) | R | RW (Tanda Tangan SP) |
| `wali_kelas` | RW (Siswa perwalian) | R | R | Pemantauan & Dampingi |
| `guru_mapel` / Musyrif | Input Laporan Awal | R | - | - |
| `kepala_madrasah` | R | R | R | Pengesahan Sanksi Berat |
| `orang_tua` / Siswa | R (Portal Ortu) | R (Buku Pedoman) | - | Terima Undangan |

---

## 3. Fitur Utama & Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-TTB-01** | Katalog Master Poin Pelanggaran | Klasifikasi pelanggaran berbobot: Ringan (5-10 poin: seragam tak lengkap, peci miring, terlambat), Sedang (15-30 poin: bolos mapel, main HP di asrama, merokok), dan Berat (50-100 poin: tawuran, asusila, perundungan, pencurian, narkoba). |
| **F-TTB-02** | Katalog Poin Apresiasi & Prestasi | Pencatatan reward poin positif (Juara KSM Kemenag, Musabaqah Tilawatil Qur'an, santri teladan, khatam tahfidz) yang dapat mereduksi beban sanksi pembinaan. |
| **F-TTB-03** | Matriks Eskalasi Tindakan Otomatis | Sistem memicu aksi terstruktur saat akumulasi poin siswa melampaui batas: 25 poin (Teguran lisan & konseling wali kelas), 50 poin (Surat Peringatan 1 + Panggilan Ortu), 75 poin (SP-2 + Skorsing sementara), 100 poin (SP-3 + Sidang Dewan Guru pengembalian ke orang tua). |
| **F-TTB-04** | Generator Surat Panggilan Orang Tua | Otomatisasi cetak Surat Panggilan Orang Tua ke madrasah berformat naskah dinas Kemenag, memuat rincian kronologi pelanggaran dan jadwal temu di ruang BK. |
| **F-TTB-05** | Buku Catatan Kasus Konseling BK | Rekam medis psikologis dan pembinaan individual siswa yang dilindungi hak privasi khusus (hanya dapat dibuka oleh Guru BK dan Kepala Madrasah). |
| **F-TTB-06** | Leaderboard Santri Berprestasi & Disiplin | Rekapitulasi kelas terdisiplin dan siswa teladan bulanan untuk pemberian apresiasi di apel bendera Senin. |

---

## 4. Aturan Validasi & Integritas Data

1. **Kerahasiaan Catatan Konseling BK:** Lembar riwayat konseling privasi tidak boleh diakses oleh guru umum atau wali murid lain.
2. **Persetujuan Bersama untuk Sanksi Berat:** Pengenaan poin pelanggaran di atas 50 poin membutuhkan persetujuan (approval) minimal dari Waka Kesiswaan sebelum sah berlaku di akun siswa.
3. **Penyimpanan Kronologi:** Setiap entri pelanggaran wajib melampirkan tanggal kejadian, lokasi, saksi, dan opsi unggah foto bukti fisik.

---

## 5. Kriteria Penerimaan (Acceptance Criteria)

- **GIVEN** Siswa "Farid" telah mengumpulkan 45 poin pelanggaran sebelumnya.
- **WHEN** Guru piket menginput pelanggaran "Merokok di Belakang Kantin" (bobot 15 poin) sehingga total poin menjadi 60.
- **THEN** Status siswa otomatis melampaui batas 50 poin, status eskalasi berubah menjadi "SP-1 Aktif", dan sistem menyiapkan tombol satu-klik "Cetak Surat Panggilan Orang Tua" ke meja Waka Kesiswaan.
