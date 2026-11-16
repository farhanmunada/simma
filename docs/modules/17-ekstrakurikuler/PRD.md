# PRD: 17. Kegiatan Ekstrakurikuler & Pengembangan Bakat

**Modul:** Ekstrakurikuler & Pengembangan Bakat Minat Siswa  
**Urutan:** Modul 17 — Pengembangan Potensi Non-Akademik  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** Standar Pengembangan Diri Ekstrakurikuler Kemenag RI & RDM, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Pengembangan potensi siswa madrasah aliyah di luar jam pelajaran formal diwadahi melalui program ekstrakurikuler yang beragam: kepramukaan, keagamaan (Hadroh, Kaligrafi, Qira'ah), keilmuan (KIR, Robotika, Arabic/English Club), serta olahraga dan seni bela diri.

Nilai kegiatan ekstrakurikuler merupakan komponen wajib yang tertera pada lembar kedua Rapor Digital Madrasah (RDM). Modul ini mengelola siklus hidup ekskul: pendaftaran anggota baru, pencatatan kehadiran latihan mingguan, penilaian predikat dan deskripsi capaian oleh pembina, serta integrasi langsung ke modul Rapor RDM.

---

## 2. Aktor & Matriks Hak Akses

| Peran | Kelola Master Ekskul | Input Presensi Latihan | Input Nilai & Keterangan Rapor | Daftar Ekskul Mandiri |
|---|---|---|---|---|
| `pembina_ekskul` | R | RW (Ekskul binanya) | RW (Predikat & Narasi) | R |
| `waka_kesiswaan` | Full CRUD | R | R | Validasi Kuota |
| `wali_kelas` | R | R | R (Tarik ke Rapor) | Pantau Siswa Kelasnya |
| `siswa` | R (Katalog Ekskul) | R | R (Rapor Hasil) | RW (Pilih Ekskul) |

---

## 3. Fitur Utama & Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-EKS-01** | Direktori Master Ekstrakurikuler | Registrasi ragam ekskul madrasah: Nama Ekskul, Kategori (Keagamaan, Keilmuan, Seni, Olahraga, Kepanduan), Pembina GTK penanggung jawab, jadwal latihan, dan batasan kuota anggota. |
| **F-EKS-02** | Portal Pemilihan Ekskul Siswa | Pendaftaran daring mandiri oleh siswa pada 2 pekan awal semester: siswa dapat memilih 1 ekskul wajib (misal: Pramuka) dan maksimal 2 ekskul pilihan. |
| **F-EKS-03** | Presensi Latihan Berkala | Lembar absensi digital kehadiran siswa pada setiap sesi latihan rutin mingguan oleh pembina/pelatih. |
| **F-EKS-04** | Input Penilaian Predikat & Narasi | Pengisian evaluasi akhir semester oleh pembina: Predikat (`A` Sangat Baik, `B` Baik, `C` Cukup) dan deskripsi capaian keaktifan khusus untuk dimasukkan ke Buku Rapor. |
| **F-EKS-05** | Aliran Data Otomatis ke Rapor RDM | Data ekskul yang diikuti dan nilai akhir dari pembina otomatis tertaut ke form Rapor RDM Wali Kelas tanpa proses salin-tempel manual. |
| **F-EKS-06** | Galeri Dokumentasi & Piagam | Pengarsipan foto dokumentasi kegiatan serta riwayat penghargaan yang dimenangkan oleh tim ekskul madrasah. |

---

## 4. Kriteria Penerimaan (Acceptance Criteria)

- **GIVEN** Pembina ekskul Jurnalistik & KIR membuka daftar 20 siswa binaannya di akhir semester genap.
- **WHEN** Pembina memberi nilai predikat "Sangat Baik" dengan keterangan "Aktif sebagai redaktur buletin madrasah dan inovatif dalam penulisan opini", lalu klik kirim nilai.
- **THEN** Nilai tersebut langsung muncul di halaman preview Rapor RDM milik Wali Kelas pada kolom Ekstrakurikuler.
