# PRD: 11. Mutaba'ah Yaumiyah (Ibadah Harian Santri)

**Modul:** Mutaba'ah Yaumiyah (Monitoring Ibadah Harian Pesantren)  
**Urutan:** Modul 11 — Pembiasaan Spiritual & Disiplin Santri  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** Standar Pola Asuh & Pembiasaan Ibadah Pondok Pesantren, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Bagi madrasah yang terintegrasi dengan asrama/pondok pesantren dalam satu yayasan, pemantauan ibadah yaumiyah merupakan instrumen utama pembangunan integritas dan akhlak santri. Pencatatan manual melalui buku saku rentan hilang dan menyulitkan asatidz dalam memantau tren penurunan kedisiplinan ibadah.

Modul ini mendigitalisasi lembar pemantauan amalan harian santri (shalat fardhu berjama'ah, shalat malam, dhuha, tilawah, dzikir, dan puasa sunnah) dengan pola entri cepat, rekapitulasi kepatuhan berkala, dan pelaporan langsung kepada orang tua/wali santri.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Checklist Ibadah Santri | Konfigurasi Amalan | Rekap Mingguan/Bulanan | Rapor Karakter Asrama |
|---|---|---|---|---|
| `musyrif_asrama` (Pembina Kamar) | RW (Santri asramanya) | R | RW | RW |
| `santri` / `siswa` | Input Diri (Mandiri) | R | R (Miliknya) | R |
| `wali_santri` (Orang Tua) | R (Portal Ortu) | - | R (Grafik Progres) | Download PDF |
| `mudir_pesantren` / Kamad | R | RW | Full Monitoring | Pengesahan |

---

## 3. Fitur Utama & Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-MBY-01** | Checklist Harian Amalan (Default Centang) | Form entri amalan per kamar/asrama dengan pola *default terlaksana*, musyrif cukup mencopot centang pada santri yang masbuk, uzur syar'i (khusus santriwati), atau lalai. |
| **F-MBY-02** | Katalog Amalan Terkonfigurasi | Konfigurasi daftar amalan fleksibel per pondok: Shalat 5 Waktu Berjama'ah (Subuh s.d. Isya), Qiyamul Lail/Tahajud, Shalat Dhuha, Tilawah One Day One Juz, Dzikir Pagi-Petang, Puasa Sunnah, dan Kajian Kitab Kuning. |
| **F-MBY-03** | Rekap & Indeks Kepatuhan Ibadah | Perhitungan skor persentase kepatuhan ibadah (0-100%) secara mingguan dan bulanan, divisualisasikan dengan grafik tren warna (Hijau: Istiqamah, Kuning: Perlu Perhatian, Merah: Membutuhkan Konseling). |
| **F-MBY-04** | Pencatatan Uzur Syar'i | Fitur khusus penandaan masa haidh bagi santriwati agar tidak terhitung sebagai pelanggaran ibadah dalam kalkulasi skor bulanan. |
| **F-MBY-05** | Notifikasi Peringatan Dini | Alert otomatis kepada musyrif dan wali kelas jika santri meninggalkan shalat fardhu berjama'ah > 2 kali berturut-turut tanpa uzur. |
| **F-MBY-06** | Lembar Rapor Mutaba'ah (PDF) | Pencetakan kartu kendali ibadah bulanan sebagai lampiran resmi buku evaluasi pondok pesantren kepada orang tua santri. |

---

## 4. Kriteria Penerimaan (Acceptance Criteria)

- **GIVEN** Musyrif asrama membuka checklist shalat Subuh berjama'ah untuk Kamar Salman Al-Farisi (12 santri).
- **WHEN** 11 santri hadir di masjid dan 1 santri terlambat (masbuk); musyrif mengubah status santri tersebut dan klik simpan.
- **THEN** Data tersimpan dalam waktu instan, skor istiqamah kamar terakumulasi real-time, dan log riwayat terupdate di dashboard pengasuhan pondok.
