# PRD: 12. Keuangan Madrasah, SPP & Billing

**Modul:** Keuangan Madrasah & Pembayaran SPP/Billing  
**Urutan:** Modul 12 — Tata Kelola Finansial & Akuntabilitas  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** Standar Akuntabilitas Pengelolaan Dana Komite & BOS Kemenag RI, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Kelancaran operasional madrasah dan pondok pesantren sangat bergantung pada kedisiplinan arus kas penerimaan dana iuran bulanan (SPP), biaya permakanan asrama, dan pos-pos biaya pendidikan lainnya. Kesalahan pencatatan manual di loket tata usaha kerap memicu perselisihan tanda terima pembayaran dengan wali murid.

Modul Keuangan SIMMA menyediakan sistem *billing & cashiering* yang terstruktur: pembuatan tagihan bulanan otomatis secara massal, loket kasir cepat dengan pencarian siswa auto-suggest, pencetakan kwitansi sah bernomor seri unik, monitoring tunggakan per kelas, serta mekanisme dispensasi kartu ujian oleh Kepala Madrasah.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Kelola Pos & Tarif Tagihan | Entri Transaksi Kasir | Cetak Kwitansi & Bukti | Approval Dispensasi | Laporan Arus Kas |
|---|---|---|---|---|---|
| `bendahara` | Full CRUD | RW | RW | R | Full Export |
| `admin_tu` (Kasir Loket) | R | RW (Input bayar) | RW | R | Rekap Harian Loket |
| `kepala_madrasah` | R | - | R | RW (Approval) | Full Monitoring |
| `wali_murid` / Siswa | R (Tagihan miliknya) | - | Download PDF | Ajukan Permohonan | - |

---

## 3. Fitur Utama & Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-KEU-01** | Master Pos & Tarif Biaya | Penentuan pos tagihan rutin (SPP madrasah, katering/asrama pondok, komite) dan pos non-rutin (uang pangkal, seragam, buku/LKS, ujian) dengan tarif berbeda per jenjang kelas atau beasiswa khusus. |
| **F-KEU-02** | Generate Tagihan Massal Bulanan | Pembuatan tagihan otomatis tiap awal bulan untuk seluruh siswa aktif dalam satu kali klik, mengaitkan pos dan nominal yang berlaku. |
| **F-KEU-03** | Loket Kasir Cepat (Auto-Suggest) | Pencarian siswa sekejap (< 300ms) menggunakan NIS, NISN, atau Nama. Sistem langsung menampilkan tagihan aktif dan riwayat pembayaran lampau. |
| **F-KEU-04** | Pembayaran Multi-Pos & Parsial | Fleksibilitas pembayaran beberapa pos tagihan sekaligus dalam 1 transaksi, atau pembayaran cicilan (parsial) untuk pos non-rutin. |
| **F-KEU-05** | Cetak Kwitansi Resmi (PDF / Thermal) | Penerbitan bukti setor sah bernomor unik dengan logo madrasah, rincian pos, cap stempel digital, dan QR Code keabsahan transaksi. |
| **F-KEU-06** | Dasbor Monitoring Tunggakan | Visualisasi status pembayaran siswa per kelas (Hijau: Lunas, Kuning: Menunggak 1-2 bulan, Merah: Menunggak > 3 bulan). |
| **F-KEU-07** | Surat Peringatan & Dispensasi Ujian | Cetak surat pemberitahuan tunggakan ke orang tua, serta alur pengesahan "Dispensasi Mengikuti Ujian" oleh Kepala Madrasah bagi siswa yang membutuhkan kelonggaran tempo pembayaran. |
| **F-KEU-08** | Laporan Kas & Ekspor Excel | Laporan mutasi kas masuk harian, bulanan, target vs realisasi penerimaan, serta ekspor format Excel untuk audit yayasan. |

---

## 4. Aturan Validasi & Integritas Finansial

1. **Anti-Duplikasi Nomor Transaksi:** Nomor kwitansi (`KW/[Tahun]/[Bulan]/[Nomor-Urut]`) dijamin unik dan tidak boleh terulang.
2. **Immutability Transaksi:** Transaksi pembayaran yang telah tersimpan tidak boleh dihapus (hard delete). Pembatalan transaksi wajib melalui mekanisme *Void Transaksi* dengan hak otorisasi Bendahara Utama dan pencatatan alasan di audit log.
3. **Penyelarasan Mutasi Siswa:** Siswa berstatus Lulus atau Mutasi Keluar tidak dapat digenerate tagihan bulanan baru.

---

## 5. Kriteria Penerimaan (Acceptance Criteria)

- **GIVEN** Kasir TU menerima uang tunai pembayaran SPP bulan November dari siswa bernama "Ahmad Farhan".
- **WHEN** Kasir mengetik NIS Ahmad, memilih bulan November, memilih metode tunai, dan menekan tombol "Bayar & Cetak Kwitansi".
- **THEN** Status tagihan bulan November berubah menjadi Lunas, kwitansi PDF terunduh/tercetak, dan saldo kas masuk hari ini bertambah otomatis.
