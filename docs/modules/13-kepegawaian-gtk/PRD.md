# PRD: 13. Kepegawaian Guru & Tenaga Kependidikan (GTK)

**Modul:** Kepegawaian GTK (Guru & Tenaga Kependidikan)  
**Urutan:** Modul 13 — Manajemen Sumber Daya Insani Madrasah  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** Standar EMIS GTK & Simpatika/SIAGA Ditjen Pendis Kemenag RI, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Kelancaran administrasi guru madrasah terikat ketat dengan sistem Kementerian Agama pusat (Simpatika, SIAGA, dan EMIS 4.0 GTK), khususnya mengenai keaktifan mengajar, pemenuhan syarat beban minimum 24 jam tatap muka (JTM) per minggu untuk pencairan Tunjangan Profesi Guru (TPG), dan status sertifikasi pendidik.

Modul ini mengelola data pokok kepegawaian seluruh pendidik dan tenaga kependidikan: profil biodata terstandar Kemenag, riwayat pendidikan & sertifikasi (NUPTK, PegID, NRG), distribusi penugasan jam mengajar mingguan, riwayat kepangkatan, serta brankas digital dokumen kepegawaian.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Kelola Data GTK | Plotting Beban Mengajar | Unggah Dokumen Berkas | Ekspor EMIS GTK |
|---|---|---|---|---|
| `admin_tu` (Staf Kepegawaian) | Full CRUD | RW | RW | Full Export |
| `waka_kurikulum` | R | RW (Distribusi JTM) | R | R |
| `guru_mapel` / GTK | Update Biodata Mandiri | R (Jadwal Mengajarnya) | Upload Dokumen Sendiri | - |
| `kepala_madrasah` | R (Monitoring Mutu GTK) | Approval Beban JTM | R | Approval Pelaporan |

---

## 3. Fitur Utama & Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-GTK-01** | Data Pokok Pendidik & Tenaga Kependidikan | Registrasi profil lengkap: Nama & Gelar, NIP/NUPTK/PegID Simpatika, NIK, No. KK, Tempat/Tgl Lahir, Jenis Kelamin, Agama, Alamat, No. HP/Email aktif. |
| **F-GTK-02** | Status Kepegawaian & Ikatan Kerja | Klasifikasi status formal: `PNS Kemenag`, `PPPK`, `GTY` (Guru Tetap Yayasan), `GTT` (Guru Tidak Tetap), `PTT` (Pegawai Tidak Tetap TU/Laboran/Pustakawan), serta TMT Awal Bekerja. |
| **F-GTK-03** | Riwayat Pendidikan & Sertifikasi Pendidik | Pencatatan kualifikasi akademik formal (S1, S2, S3, Prodi, Universitas), status Sertifikasi Pendidik, Nomor Sertifikat Pendidik, dan NRG (Nomor Registrasi Guru) untuk verifikasi TPG. |
| **F-GTK-04** | Pemantauan Beban Mengajar (JTM Checker) | Kalkulasi otomatis total Jam Tatap Muka (JTM) mengajar per minggu dari modul jadwal: menampilkan indikator visual apakah guru telah memenuhi batas minimum 24 JTM Simpatika atau belum. |
| **F-GTK-05** | Riwayat Kepangkatan & Kenaikan Golongan | Riwayat mutasi golongan ruang bagi guru PNS/PPPK (III/a, III/b, dst.), nomor SK pengangkatan, TMT golongan, dan estimasi periode kenaikan pangkat berikutnya. |
| **F-GTK-06** | Brankas Arsip Digital Dokumen GTK | Unggah dan penyimpanan berkas penting (Ijazah, SK Pengangkatan Kamad/Yayasan, Sertifikat Pelatihan/Workshop, KTP, NPWP) dalam format PDF terproteksi. |
| **F-GTK-07** | Ekspor Rekap Kepegawaian (Format EMIS) | Unduh rekapitulasi data GTK yang terstruktur sesuai format template impor pendataan semesteran EMIS Kemenag RI. |

---

## 4. Aturan Validasi & Integritas Data

1. **Keunikan Identitas:** NIK dan NUPTK/PegID harus unik dan tidak boleh ganda di seluruh database lembaga.
2. **Kesesuaian Kode Mapel Sertifikasi:** Bidang studi sertifikasi pendidik dipetakan secara akurat terhadap daftar 44 mata pelajaran resmi Kemenag.
3. **Proteksi Berkas Pribadi:** Berkas sensitif (KTP, slip gaji/SK) hanya dapat diakses oleh GTK bersangkutan, admin kepegawaian TU, dan Kepala Madrasah.

---

## 5. Kriteria Penerimaan (Acceptance Criteria)

- **GIVEN** Waka Kurikulum mengatur jadwal mengajar Ustadz Mansur untuk 8 rombel kelas X dengan alokasi 3 JTM per rombel.
- **WHEN** Admin membuka halaman profil kepegawaian Ustadz Mansur.
- **THEN** Ringkasan beban JTM menampilkan angka "24 JTM / Minggu", badge status beban berwarna hijau bertuliskan "Memenuhi Syarat Beban Mengajar 24 JTM", dan riwayat dapat diekspor.
