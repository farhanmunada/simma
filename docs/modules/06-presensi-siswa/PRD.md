# PRD: 06. Presensi Siswa

**Modul:** Presensi Siswa (Kehadiran Harian & Mapel)  
**Urutan:** Modul 06 — Aktivitas Harian Siswa  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** KMA Pedoman Akademik Madrasah, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Pencatatan kehadiran siswa di madrasah aliyah membutuhkan kecepatan tinggi dan kemudahan bagi guru yang memiliki tingkat literasi digital bervariasi. Menggunakan paradigma *default hadir*, guru tidak perlu mencentang seluruh siswa satu per satu, melainkan cukup mengubah status bagi siswa yang Sakit (S), Izin (I), Alpha (A), atau Terlambat (T).

Data presensi ini terhubung langsung secara real-time ke modul Pelaporan/Rapor RDM untuk akumulasi ketidakhadiran semesteran, modul Kesiswaan/Tatib untuk peringatan dini siswa mangkir (> 3x berturut-turut), serta portal orang tua.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Input Presensi Harian | Edit Riwayat Presensi | Rekap & Monitor Kelas | Alert Alpha > 3x |
|---|---|---|---|---|
| `guru_mapel` | RW (Kelas & Jamnya) | RW (Batas hari sama) | R (Kelasnya) | R |
| `wali_kelas` | RW (Kelas perwalian) | RW (Batas 7 hari) | R (Kelas perwalian) | R + Tindak lanjut |
| `waka_kesiswaan` | RW (Seluruh kelas) | Full Override | Full Madrasah | RW + Surat Panggilan |
| `kepala_madrasah` | R | R | Full Monitoring | R |

---

## 3. Fitur Utama & Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-PRE-01** | Pola Default Hadir (Fast Input) | Saat membuka form presensi, semua siswa berstatus Hadir (H). Guru cukup satu tap/klik pada siswa yang tidak hadir untuk mengubah ke S, I, A, atau T. |
| **F-PRE-02** | Status Kehadiran Standar | 5 status resmi: `H` (Hadir), `S` (Sakit - opsi unggah surat dokter), `I` (Izin - surat ortu), `A` (Alpha - tanpa keterangan), `T` (Terlambat - catat menit). |
| **F-PRE-03** | Auto-Detect Jadwal & Kelas | Sistem otomatis menyajikan kelas dan mata pelajaran yang aktif saat guru login berdasarkan kalender akademik dan jam mengajar. |
| **F-PRE-04** | Deteksi Duplikasi & Hari Libur | Sistem memblokir presensi ganda (guru, kelas, mapel, jam sama) dan melarang input pada hari libur nasional atau kalender madrasah. |
| **F-PRE-05** | Alert Akumulasi Alpha (> 3x) | Peringatan otomatis visual kuning/merah saat siswa alpha 3 hari berturut-turut atau total alpha mencapai ambang batas (notifikasi ke Wali Kelas & Waka Kesiswaan). |
| **F-PRE-06** | Rekapitulasi Presensi Semester | Agregasi otomatis total Hadir, Sakit, Izin, Alpha per siswa untuk ditarik langsung ke lembar Rapor RDM Kemenag tanpa input ulang manual. |
| **F-PRE-07** | Riwayat & Audit Trail | Log pengeditan presensi: mencatat siapa pengubah, waktu perubahan, dan status sebelum vs sesudah. |
| **F-PRE-08** | Ekspor Rekap Kehadiran | Cetak rekap bulanan/semesteran ke format PDF dan file spreadsheet Excel. |

---

## 4. Aturan Validasi & Integritas Data

1. **Larangan Tanggal Masa Depan:** Presensi tidak dapat diisi untuk tanggal yang belum berlangsung (`date <= CURRENT_DATE`).
2. **Kunci Nilai Rapor:** Rekapitulasi ketidakhadiran di Rapor RDM terkunci otomatis saat semester resmi ditutup oleh Waka Kurikulum.
3. **Audit Perubahan:** Guru mapel hanya boleh mengedit presensi pada hari H. Koreksi tanggal lampau wajib melalui Wali Kelas atau Waka Kesiswaan dengan alasan perubahan terekam di audit log.

---

## 5. Kriteria Penerimaan (Acceptance Criteria)

- **GIVEN** Guru membuka form presensi kelas X-A jam pertama (40 siswa).
- **WHEN** 38 siswa hadir, 1 siswa sakit, 1 siswa alpha; guru mengeklik tombol sakit pada Ahmad dan alpha pada Budi, lalu klik "Simpan Presensi".
- **THEN** Data tersimpan dalam < 1 detik, audit log tercatat, rekap kehadiran siswa langsung terakumulasi, dan Budi tidak memicu alert jika alpha belum > 3x.
