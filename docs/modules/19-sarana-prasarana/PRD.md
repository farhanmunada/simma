# PRD: 19. Sarana, Prasarana & Manajemen Aset Madrasah

**Modul:** Sarana, Prasarana & Inventaris Aset Madrasah  
**Urutan:** Modul 19 — Pemeliharaan & Optimalisasi Aset Pendidikan  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** Standar Sarana Prasarana Madrasah Kemenag RI & Pengelolaan Aset Negara/Yayasan, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Pengelolaan fasilitas fisik madrasah dan pondok pesantren (ruang kelas, laboratorium IPA/Bahasa/Komputer, gedung asrama, sarana ibadah, dan inventaris perangkat multimedia) menuntut pencatatan akurat guna mencegah kehilangan barang, memantau depresiasi, serta merencanakan anggaran pengadaan dan pemeliharaan rutin.

Modul Sarpras SIMMA menyediakan sistem inventarisasi digital menyeluruh: penomoran aset otomatis, pembuatan stiker QR Code fisik untuk audit cepat via pemindai kamera gawai, pemetaan lokasi per ruangan, pengelolaan alur peminjaman alat, serta sistem tiket pelaporan kerusakan (*maintenance helpdesk*).

---

## 2. Aktor & Matriks Hak Akses

| Peran | Kelola Master Aset & Ruangan | Cetak Label QR Aset | Kelola Peminjaman Fasilitas | Tiket Laporan Kerusakan | Laporan Buku Inventaris |
|---|---|---|---|---|---|
| `waka_sarpras` | Full CRUD | RW | Approval Peminjaman | Disposisi Perbaikan | Full Export |
| `admin_tu` (Staf Sarpras) | Input Inventaris | RW | RW (Catat Pinjam/Kembali) | Eksekusi Tiket | Draft Laporan |
| `guru_mapel` / GTK | R | - | Ajukan Peminjaman Alat | Buat Tiket Kerusakan | - |
| `kepala_madrasah` | R (Monitoring Aset) | - | R | R | Pengesahan Berita Acara |

---

## 3. Fitur Utama & Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-SAR-01** | Direktori Master Ruangan & Gedung | Pencatatan denah fisik madrasah: Gedung, Lantai, Nama Ruangan (Kelas X-A, Lab Komputer 1, Perpustakaan, Asrama Putra 2), Luas Ruang (m²), dan penanggung jawab ruangan. |
| **F-SAR-02** | Registrasi & Penomoran Aset Unik | Pendataan inventaris barang: Kode Unik Aset, Nama Barang, Spesifikasi/Merek, Kategori (Mebel, Elektronik/IT, Alat Peraga, Kendaraan, Bangunan), Tahun Perolehan, Asal Sumber Dana (BOS Kemenag, Bantuan Hibah, Yayasan, Komite), dan Status Kondisi (`Baik`, `Rusak Ringan`, `Rusak Berat`). |
| **F-SAR-03** | Generator Stiker Label QR Code Aset | Pembuatan label stiker siap cetak berisi kode QR unik untuk ditempelkan pada fisik barang. Pemindaian QR Code melalui ponsel langsung membuka data spesifikasi dan riwayat servis barang tanpa perlu login admin penuh. |
| **F-SAR-04** | Alokasi & Mutasi Aset Antar-Ruang | Riwayat perpindahan letak barang dari satu ruangan ke ruangan lain lengkap dengan tanggal pemindahan dan staf yang bertanggung jawab. |
| **F-SAR-05** | Layanan Peminjaman Fasilitas & Alat | Formulir peminjaman proyektor LCD, kamera dokumentasi, mikroskop, atau aula serbaguna: pencatatan tanggal peminjaman, estimasi waktu pengembalian, tujuan kegiatan, dan verifikasi kondisi fisik saat kembali. |
| **F-SAR-06** | Sistem Tiket Laporan Kerusakan (Helpdesk) | Fitur pelaporan cepat kerusakan fasilitas (AC mati, kursi patah, lampu padam) oleh guru/staf dengan unggahan foto, status penanganan (`Diajukan`, `Dalam Perbaikan`, `Selesai`), dan rekapitulasi estimasi biaya perbaikan. |
| **F-SAR-07** | Buku Inventaris Barang (KIB) & Rekap Aset | Rekapitulasi nilai perolehan seluruh aset madrasah, persentase barang layak pakai, dan cetak Kartu Inventaris Barang (KIB) format standar pelaporan yayasan/Kemenag. |

---

## 4. Kriteria Penerimaan (Acceptance Criteria)

- **GIVEN** Laboran Komputer hendak meminjamkan 1 unit proyektor madrasah kepada Guru Sejarah.
- **WHEN** Laboran memindai QR Code proyektor, memilih nama peminjam, menetapkan durasi pengembalian jam 14.00, dan klik "Konfirmasi Peminjaman".
- **THEN** Status proyektor berubah menjadi "Dipinjam", log sirkulasi tercatat di sistem, dan sistem menampilkan alert jika proyektor belum dikembalikan saat melewati pukul 14.00.
