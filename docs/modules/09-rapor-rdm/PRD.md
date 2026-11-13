# PRD: 09. Pelaporan Rapor RDM & Legger Nilai

**Modul:** Rapor RDM & Legger Nilai Resmi Kemenag  
**Urutan:** Modul 09 — Pelaporan Hasil Belajar Akhir Semester  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** Standar Format Rapor Digital Madrasah (RDM) Ditjen Pendidikan Islam Kemenag RI, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Tahap akhir evaluasi akademik semester adalah penerbitan Buku Laporan Hasil Belajar (Rapor Siswa) dan Buku Legger Nilai Kelas yang sesuai 100% dengan tata letak baku Rapor Digital Madrasah (RDM) Kementerian Agama RI.

Wali Kelas memegang peranan sentral dalam memverifikasi kelengkapan nilai dari seluruh guru mata pelajaran, menginput catatan motivasi perwalian, memasukkan capaian ekstrakurikuler serta prestasi siswa, hingga menerbitkan dokumen PDF Rapor resmi ber-Kop Kemenag, QR Code otentikasi, dan tanda tangan digital.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Verifikasi Nilai Kelas | Input Catatan & Ekskul | Generate & Cetak Rapor | Tanda Tangan Digital |
|---|---|---|---|---|
| `wali_kelas` | RW (Kelas perwalian) | RW (Kelasnya) | RW (PDF Siswa & Batch) | TTD Wali Kelas |
| `guru_mapel` | Read Status Kirim | - | Read Preview | - |
| `kepala_madrasah` | R (Monitoring Progress) | - | Read Legger & Rapor | TTD Resmi Kamad |
| `siswa` / `wali_murid` | Read Only (Portal Siswa) | - | Download PDF Rapor | - |

---

## 3. Fitur Utama & Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-RAP-01** | Checklist Verifikasi Wali Kelas | Layar audit kelengkapan nilai: tabel pemantauan seluruh mata pelajaran di kelas perwalian (status "Sudah Kirim" hijau vs "Belum Kirim" merah). |
| **F-RAP-02** | Input Catatan & Karakter Siswa | Form pengisian catatan wali kelas untuk memotivasi perkembangan siswa, serta catatan sikap spiritual dan sosial secara naratif. |
| **F-RAP-03** | Rekap Kehadiran Terintegrasi | Penarikan otomatis total hari Sakit (S), Izin (I), dan Tanpa Keterangan (A) dari Modul Presensi ke tabel rekapitulasi kehadiran rapor tanpa input ulang. |
| **F-RAP-04** | Integrasi Ekstrakurikuler & Prestasi | Penggabungan nilai kegiatan ekskul (Pramuka, PMR, KIR, dsb.) dan riwayat penghargaan/kejuaraan yang diraih siswa selama semester aktif. |
| **F-RAP-05** | Legger Nilai Kelas (PDF & Excel) | Rekapitulasi matriks nilai seluruh siswa x seluruh mapel beserta peringkat kelas, rata-rata nilai, dan status kelulusan semester dalam satu dokumen tabel komprehensif. |
| **F-RAP-06** | Generator PDF Rapor Format RDM | Penerbitan PDF Buku Rapor resmi berstandar RDM Kemenag (Halaman Judul, Data Madrasah, Biodata Siswa, Tabel Nilai & Deskripsi Capaian TP, Ekstrakurikuler, Presensi, Catatan Wali Kelas, Tanda Tangan). |
| **F-RAP-07** | Tanda Tangan Digital & QR Validation | Pemasangan tanda tangan visual Kepala Madrasah dan Wali Kelas, dilengkapi QR Code untuk verifikasi keaslian dokumen secara publik tanpa login. |
| **F-RAP-08** | Batch Print / Unduh Massal ZIP | Fasilitas unduh seluruh PDF rapor siswa dalam satu kelas sekaligus dalam satu berkas arsip ZIP atau single continuous PDF untuk dicetak fisik. |

---

## 4. Aturan Validasi & Integritas Data

1. **Syarat Kunci Cetak Rapor:** Dokumen rapor resmi tidak dapat diterbitkan jika masih ada mata pelajaran yang berstatus "Draft" (belum dikirim guru mapel).
2. **Immutability Nilai Semester:** Saat rapor telah ditandatangani secara digital oleh Kepala Madrasah, seluruh nilai sumatif, SAS, dan presensi terkunci permanen (read-only). Perbaikan nilai hanya dapat dibuka melalui prosedur buka kunci resmi oleh Super Admin.
3. **Pemberian Tanggal Rapor:** Tanggal titimangsa rapor mengacu secara ketat pada tanggal resmi pembagian rapor yang ditetapkan di kalender akademik madrasah.

---

## 5. Kriteria Penerimaan (Acceptance Criteria)

- **GIVEN** Wali Kelas X-B mendapati seluruh 15 guru mapel telah mengirimkan nilai (progres 100%).
- **WHEN** Wali Kelas mengisi catatan perwalian untuk Ahmad dan menekan tombol "Generate Rapor RDM".
- **THEN** File PDF berstandar RDM terbit dalam waktu < 3 detik, tabel nilai dan deskripsi capaian tersusun rapi dengan font standar Kemenag, QR Code verifikasi aktif, dan nilai presensi sinkron sempurna dengan modul presensi.
