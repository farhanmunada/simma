# PRD: 15. Mutasi & Kelulusan Siswa

**Modul:** Mutasi Masuk, Mutasi Keluar & Kelulusan Siswa  
**Urutan:** Modul 15 — Manajemen Dinamika Kependidikan  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** Juknis Mutasi Siswa Ditjen Pendis Kemenag RI, Standar EMIS 4.0, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Dinamika perpindahan siswa antar-madrasah atau antar-sekolah (mutasi masuk dan mutasi keluar) serta kelulusan akhir jenjang kelas XII menuntut tertib administrasi tingkat tinggi. Kelalaian dalam mencatat surat mutasi mengakibatkan data siswa ganda di pangkalan data nasional EMIS 4.0 atau siswa keluar masih tercatat menunggak SPP.

Modul ini mengelola alur formal perpindahan siswa: verifikasi bebas tanggungan (perpustakaan, keuangan, dan kedisiplinan) sebelum siswa dapat disetujui keluar, penerbitan Surat Keterangan Pindah Sekolah resmi Kemenag ber-barcode, pencatatan riwayat siswa pindahan masuk, hingga pemrosesan kelulusan massal dengan nomor seri ijazah.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Pendaftaran Mutasi Masuk | Proses Mutasi Keluar | Verifikasi Bebas Tanggungan | Approval Kamad | Kelulusan Akhir |
|---|---|---|---|---|---|
| `admin_tu` (Staf Mutasi) | Full Input | Input Pengajuan | Pantau Checklist | Draft Dokumen | Input No. Ijazah |
| `bendahara` | - | - | RW (Verifikasi SPP Lunas) | - | - |
| `waka_kesiswaan` | RW (Validasi Berkas) | RW | RW (Verifikasi Bebas Tatib) | Paraf | Validasi Kelulusan |
| `kepala_madrasah` | SK Penerimaan | SK Pelepasan | R | Approval Final TTD | SK Kelulusan |

---

## 3. Fitur Utama & Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-MUT-01** | Mutasi Masuk (Siswa Pindahan) | Entri siswa pindahan dari MA/SMA lain: pencatatan sekolah asal, nomor surat pindah asal, validasi keaktifan NISN nasional, pemilihan kelas tujuan, dan pengalokasian Nomor Induk stambuk baru di Buku Induk Siswa. |
| **F-MUT-02** | Clearance Beban 3 Dimensi (Bebas Tanggungan) | Sebelum permohonan mutasi keluar dapat disetujui Kepala Madrasah, sistem mewajibkan verifikasi digital (checklist hijau) dari 3 pihak: (1) Bebas Pinjaman Perpustakaan, (2) Bebas Tunggakan SPP/Keuangan dari Bendahara, dan (3) Bebas Kasus Disiplin Berat dari Waka Kesiswaan. |
| **F-MUT-03** | Penerbitan Surat Mutasi Keluar Kemenag | Generator Surat Keterangan Pindah Sekolah berstandar PMA 12/2024 ber-Kop madrasah, memuat alasan mutasi, sekolah tujuan, rekap nilai terakhir, dan QR Code verifikasi dokumen. |
| **F-MUT-04** | Mutasi Atomik Status Buku Induk | Saat surat mutasi keluar disahkan Kamad, status siswa di tabel utama `students` otomatis berpindah dari `aktif` menjadi `mutasi_keluar`, kelas dikosongkan, dan tagihan SPP berikutnya berhenti digenerate. |
| **F-MUT-05** | Pencatatan Siswa Drop Out (DO) / Undur Diri | Pengarsipan siswa yang berhenti studi dengan alasan khusus (bekerja, pernikahan dini, uzur kesehatan) lengkap dengan unggahan surat pernyataan orang tua bermaterai. |
| **F-MUT-06** | Pemrosesan Kelulusan Massal Kelas XII | Fasilitas penetapan status `lulus` secara batch untuk siswa kelas XII pada akhir tahun ajaran, pencatatan Nomor Seri Ijazah Kemenag, Nomor Surat Keterangan Lulus (SKL), dan penguncian histori akademik. |
| **F-MUT-07** | Buku Registrasi Mutasi & Ekspor EMIS | Buku agenda digital perpindahan siswa (daftar masuk, keluar, lulus) untuk pelaporan berkala ke Seksi Pendidikan Madrasah Kemenag Kabupaten/Kota. |

---

## 4. Kriteria Penerimaan (Acceptance Criteria)

- **GIVEN** Siswa "Ridwan" mengajukan mutasi keluar ke MA lain, namun masih menunggak SPP 1 bulan di Bendahara.
- **WHEN** Admin TU mencoba menerbitkan Surat Keterangan Pindah Sekolah untuk Ridwan.
- **THEN** Sistem menolak dengan notifikasi "Mutasi Ditahan: Siswa masih memiliki tanggungan biaya SPP di Bendahara", tombol cetak dinonaktifkan hingga Bendahara memberikan centang lunas.
