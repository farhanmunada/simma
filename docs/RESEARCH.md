# RESEARCH: Analisis Regulasi dan Kebutuhan Domain SIMMA (Sistem Informasi Madrasah Aliyah)

**Tanggal:** 2026-11-07  
**Status:** Verified  
**Domain:** Sistem Informasi Akademik Madrasah Aliyah (Kemenag RI)  
**Target Arsitektur:** Decoupled Architecture (`simma-be` Fastify TS & `simma-fe` React Vite TS) di atas Ubuntu Server LAN on-premise

---

## 1. Landasan Regulasi & Karakteristik Khusus Madrasah Aliyah

Madrasah Aliyah (MA) berada di bawah naungan Direktorat Jenderal Pendidikan Islam (Ditjen Pendis) Kementerian Agama RI. Hal ini membedakannya secara mendasar dari SMA umum di bawah Kemendikbudristek:
1. **Regulator Tunggal:** Kemenag RI mengendalikan kurikulum, standar kelulusan, dan aplikasi pelaporan madrasah.
2. **Sistem Data Pokok Terpusat:** Sinkronisasi dan ekspor format EMIS 4.0 (Education Management Information System) dan Simpatika (data pendidik).
3. **Standar Pelaporan Rapor:** Mengikuti format dan formula Rapor Digital Madrasah (RDM).
4. **Implementasi Kurikulum Merdeka:** Mengacu pada KMA No. 347 Tahun 2022 dan KMA No. 450 Tahun 2024.

---

## 2. Struktur Kurikulum & Rumpun Mata Pelajaran (KMA 347/2022 & KMA 450/2024)

### 2.1 Rumpun PAI Wajib (Pendidikan Agama Islam Terpisah)
SMA umum hanya memiliki 1 mata pelajaran agama. Pada Madrasah Aliyah, PAI dipecah menjadi 4 mata pelajaran mandiri berbobot masing-masing ditambah 1 mata pelajaran Bahasa Arab:
- **Al-Qur'an Hadis:** 2 JP/minggu.
- **Akidah Akhlak:** 2 JP/minggu.
- **Fikih:** 2 JP/minggu.
- **Sejarah Kebudayaan Islam (SKI):** 2 JP/minggu.
- **Bahasa Arab:** 4 JP/minggu (Fase E/Kelas X) dan 3 JP/minggu (Fase F/Kelas XI-XII).

### 2.2 Peminatan Fase F (Kelas XI & XII)
Peserta didik memilih 4-5 mapel pilihan sesuai minat:
- **Rumpun MIPA:** Biologi, Kimia, Fisika, Informatika, Matematika Tingkat Lanjut.
- **Rumpun IPS:** Sosiologi, Ekonomi, Geografi, Antropologi.
- **Rumpun Bahasa:** Bahasa Arab Tingkat Lanjut, Bahasa Inggris Tingkat Lanjut, Bahasa Asing Pilihan.
- **Rumpun Keagamaan (Khas MA/MAPK):** Ilmu Tafsir, Ilmu Hadis, Ushul Fikih, Bahasa Arab Peminatan.

### 2.3 Kokurikuler P5RA (Profil Pelajar Pancasila & Rahmatan Lil 'Alamin)
Mengintegrasikan 6 dimensi Pelajar Pancasila dengan 10 nilai utama *Rahmatan Lil 'Alamin*:
1. *Ta'addub* (Berkeadaban)
2. *Qudwah* (Keteladanan)
3. *Muwatanah* (Kewarganegaraan dan Kebangsaan)
4. *Tawassut* (Mengambil Jalan Tengah)
5. *Tawazun* (Berimbang)
6. *I'tidal* (Lurus dan Tegas)
7. *Musawah* (Kesetaraan)
8. *Syura* (Musyawarah)
9. *Tasamuh* (Toleransi)
10. *Tatawwur wa Ibtikar* (Dinamis dan Inovatif)

---

## 3. Standar Data & Integrasi Eksternal

### 3.1 EMIS 4.0 (Education Management Information System)
Atribut wajib data siswa, GTK, dan kelembagaan:
- **Identitas Madrasah:** Nomor Statistik Madrasah (NSM - 12 digit), NPSN (8 digit).
- **Identitas Siswa:** NISN (10 digit), NIK (16 digit valid Dukcapil), Nomor KK.
- **Sosio-Ekonomi Siswa:** Status bantuan sosial (PIP Kemenag, KIP, DTKS), status keluarga (Anak Kandung, Yatim, Piatu, Yatim Piatu).
- **Pendidik & Tenaga Kependidikan (GTK):** PegID/NPK Simpatika (Kemenag), NUPTK, status kepegawaian (PNS, PPPK, GTY, GTT).

### 3.2 Rapor Digital Madrasah (RDM)
- Formula perhitungan nilai akhir mata pelajaran:
  `Nilai Akhir = (Bobot_Harian * Rata_Formatif_SumatifLM + Bobot_PAS * Nilai_PAS) / (Bobot_Harian + Bobot_PAS)`
- Deskripsi capaian kompetensi dijabarkan otomatis dari Tujuan Pembelajaran (TP) tertinggi dan terendah.

---

## 4. Modul Khas Keislaman & Ekosistem Madrasah

### 4.1 Modul Tahfidz & Tasmi' Al-Qur'an
- **Pencatatan Setoran:** Tanggal, Surah, Rentang Ayat, Juz, Nilai Kelancaran (*Fashahah*), Nilai Tajwid, Catatan Ustadz.
- **Ujian Tasmi':** Ujian sekali duduk per juz (Juz 30 atau juz pilihan target kurikulum).

### 4.2 Mutaba'ah Yaumiyah
- Pemantauan amalan ibadah harian: Sholat 5 waktu berjamaah di masjid, Sholat Dhuha, Sholat Tahajud, Tilawah harian, dan Puasa Sunnah.

### 4.3 Tata Tertib, Poin Pelanggaran & Prestasi
- Rekapitulasi poin kedisiplinan dan apresiasi prestasi santri/siswa dengan batas ambang surat peringatan (SP).

### 4.4 Keuangan Madrasah
- Billing SPP bulanan, uang infaq/komite, pencatatan kasir loket TU, dan mekanisme dispensasi ujian.
