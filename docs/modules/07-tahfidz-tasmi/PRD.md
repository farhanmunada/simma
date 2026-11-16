# PRD: 07. Program Tahfidz & Tasmi' Al-Qur'an

**Modul:** Tahfidz & Tasmi' Al-Qur'an (Pondok Pesantren & Madrasah)  
**Urutan:** Modul 07 — Pembiasaan & Karakter Qur'ani  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** Standar Mutu Tahfidz Lembaga Pesantren Kemenag RI, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Madrasah Aliyah yang terintegrasi dengan pondok pesantren dalam satu yayasan menempatkan program Tahfidz Al-Qur'an sebagai pilar kurikulum unggulan. Modul ini mendigitalisasi proses setoran harian santri, ujian tasmi' bil-ghaib (hafalan sekali duduk), evaluasi mutu bacaan 3 dimensi, serta pemantauan pencapaian target juz per semester.

Sistem menyediakan visualisasi interaktif berbentuk peta kemajuan (heatmap) 30 Juz per santri, memudahkan musyrif/musyrifah dalam memantau mutqin-nya hafalan santri, serta menerbitkan Syahadah Ujian Tasmi' resmi.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Input Setoran Harian | Penilaian Ujian Tasmi' | Konfigurasi Target Juz | Cetak Syahadah |
|---|---|---|---|---|
| `guru_tahfidz` (Musyrif) | RW (Halaqah yang diampu) | RW (Sebagai Penguji) | R | RW |
| `wali_kelas` | R (Santri kelasnya) | R | R | R |
| `kepala_madrasah` / Mudir | R | R (Pengesahan) | RW | Pengesahan TTD |
| `calon_siswa` / Orang Tua | R (Progres anaknya) | R | R | R (Download) |

---

## 3. Fitur Utama & Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-TAH-01** | Input Setoran Hafalan Cepat | Form pencatatan hafalan santri: jenis setoran (`ziyadah` hafalan baru, `murajaah` pengulangan), nama surah, ayat awal - ayat akhir, dan juz terkait. |
| **F-TAH-02** | Penilaian 3 Dimensi Mutu | Evaluasi mutu bacaan Al-Qur'an berbobot: Tajwid (hukum bacaan), Makhrajul Huruf (ketepatan makhraj), dan Kelancaran/Fashahah. Status: `Lulus` (Mutqin) atau `Mengulang`. |
| **F-TAH-03** | Ujian Tasmi' (Sekali Duduk) | Modul khusus ujian tasmi' hafalan bil-ghaib per juz (1 Juz, 5 Juz, 10 Juz, 30 Juz) dengan pencatatan kesalahan jali/khafi dan dewan asatidz penguji. |
| **F-TAH-04** | Heatmap 30 Juz Interaktif | Peta visual interaktif 30 Juz (warna hijau: mutqin/lulus tasmi', kuning: muraja'ah berjalan, abu-abu: belum disetor) untuk profil individual santri. |
| **F-TAH-05** | Target Capaian per Semester | Penetapan target minimum juz per semester untuk santri program reguler vs program khusus takhasus tahfidz. |
| **F-TAH-06** | Penerbitan Syahadah Tasmi' | Generator sertifikat/syahadah resmi ber-barcode/QR Code bagi santri yang telah menuntaskan ujian tasmi' dengan predikat Jayyid Jiddan / Mumtaz. |
| **F-TAH-07** | Integrasi Nilai Rapor & PPDB | Nilai capaian tahfidz dialirkan otomatis sebagai komponen nilai Muatan Lokal / Rapor Pesantren dan acuan jalur prestasi PPDB. |

---

## 4. Aturan Validasi & Integritas Data

1. **Konsistensi Rentang Ayat:** Ayat akhir setoran tidak boleh lebih kecil dari ayat awal dalam surah yang sama.
2. **Kunci Nilai Ujian Tasmi':** Ujian tasmi' yang telah ditandatangani secara digital oleh Dewan Penguji tidak dapat diubah kecuali melalui pembatalan resmi Mudir/Kamad.
3. **Integritas Penomoran Syahadah:** Nomor seri syahadah terbit secara sekuensial dan terverifikasi unik melalui halaman validasi publik berbasis hash QR Code.

---

## 5. Kriteria Penerimaan (Acceptance Criteria)

- **GIVEN** Ustadz penguji membuka form Ujian Tasmi' santri "Muhammad Zaid" untuk Juz 30.
- **WHEN** Penguji menginput 2 kesalahan kecil (khafi), memberi nilai Tajwid 92, Makhraj 90, Kelancaran 95, lalu klik "Sahkan Ujian".
- **THEN** Status Juz 30 pada heatmap santri langsung berubah menjadi Hijau Mutqin, predikat "Mumtaz" terbit, dan tombol cetak "Syahadah Tasmi' Juz 30" aktif.
