# Direktori Modul & Spesifikasi Kebutuhan SIMMA

Dokumentasi spesifikasi kebutuhan produk (PRD), rancangan arsitektur, diagram aktivitas, dan ERD disusun secara modular per folder di `docs/modules/<nomor>-<nama-modul>/` mencakup seluruh siklus roadmap SIMMA (19 Modul).

---

## Peta Alur Arsitektur Modul (System Workflow)

```
[01. Auth & RBAC]
       │
       ▼
[02. Master Setup] ─── (Tahun Ajaran, Semester, Rombel, GTK, Mapel)
       │
       ├─────────────────────────────────────────┐
       ▼                                         ▼
[03. Tata Usaha & Persuratan]            [04. PPDB Madrasah]
(Surat Masuk, Disposisi, Surat Keluar)   (Pendaftaran, Berkas, Seleksi)
       │                                         │
       │                                         ▼ (Mutasi Atomik)
       └────────────────────────────────> [05. Kesiswaan & Buku Induk]
                                                 │
                   ┌─────────────────────────────┼─────────────────────────────┐
                   ▼                             ▼                             ▼
          [06. Presensi Siswa]          [07. Tahfidz & Tasmi']        [11. Mutaba'ah Yaumiyah]
                   │                             │                             │
                   └─────────────────────────────┼─────────────────────────────┘
                                                 ▼
                                     [08. Penilaian Akademik]
                                                 │
                                                 ├─────────────────────────────┐
                                                 ▼                             ▼
                                      [09. Rapor & Legger RDM]             [10. P5RA]
                                                 │
    ┌────────────────────────────────────────────┼─────────────────────────────┐
    ▼                                            ▼                             ▼
[12. Keuangan & SPP]                    [13. Kepegawaian GTK]        [14. Jadwal Pelajaran]
    │                                            │                             │
    ▼                                            ▼                             ▼
[15. Mutasi & Kelulusan]                [16. Tatib & Disiplin]       [17. Ekstrakurikuler]
    │                                            │                             │
    └────────────────────────────────────────────┴─────────────────────────────┤
                                                                               ▼
                                                                     [18. Ekspor EMIS 4.0]
                                                                               │
                                                                               ▼
                                                                     [19. Sarana Prasarana]
```

---

## Daftar Status Dokumen Modul (19 Modul Lengkap)

### Phase 1: MVP (Pondasi Administratif & Siklus Akademik)

| No | Modul | Fokus Bisnis Utama | Dokumen PRD | Activity Diagrams (HTML Interaktif) |
|---|---|---|---|---|
| **01** | `01-auth-rbac` | Autentikasi JWT stateless, multi-role 11 peran madrasah, brute-force lockout, audit trail. | [PRD.md](./01-auth-rbac/PRD.md) | [Login & Brute Force Lockout](./01-auth-rbac/activity-login-auth.html)<br>[RBAC Endpoint Guard](./01-auth-rbac/activity-rbac-guard.html) |
| **02** | `02-master-setup` | Profil lembaga, aktivasi atomik TA & Semester, rombel, 44 Mapel KMA 347/450, penugasan GTK. | [PRD.md](./02-master-setup/PRD.md) | [Siklus TA & Semester](./02-master-setup/activity-siklus-akademik.html)<br>[Alokasi Rombel & Wali](./02-master-setup/activity-alokasi-rombel-guru.html) |
| **03** | `03-tata-usaha-persuratan` | Agenda surat masuk, lembar disposisi Kamad, penomoran otomatis PMA 12/2024, generator surat dinas + QR Code. | [PRD.md](./03-tata-usaha-persuratan/PRD.md) | [Surat Masuk & Disposisi](./03-tata-usaha-persuratan/activity-surat-masuk-disposisi.html)<br>[Surat Keluar & Nomor Otomatis](./03-tata-usaha-persuratan/activity-surat-keluar-penomoran.html) |
| **04** | `04-ppdb-madrasah` | Portal mandiri calon siswa, seleksi 4 jalur Kemenag, upload berkas, verifikasi TU, mutasi atomik ke Buku Induk. | [PRD.md](./04-ppdb-madrasah/PRD.md) | [Registrasi Calon Siswa](./04-ppdb-madrasah/activity-registrasi-pendaftaran.html)<br>[Verifikasi Berkas Panitia](./04-ppdb-madrasah/activity-verifikasi-seleksi.html)<br>[Mutasi Diterima ke Buku Induk](./04-ppdb-madrasah/activity-mutasi-buku-induk.html) |
| **05** | `05-kesiswaan-buku-induk` | Buku Induk Abadi format EMIS 4.0, Buku Klapper A-Z, alokasi NIS stambuk, penempatan rombel semester. | [PRD.md](./05-kesiswaan-buku-induk/PRD.md) | [Pencatatan Buku Induk](./05-kesiswaan-buku-induk/activity-pencatatan-buku-induk.html)<br>[Penempatan Rombel Kelas](./05-kesiswaan-buku-induk/activity-penempatan-rombel.html) |
| **06** | `06-presensi-siswa` | Presensi harian/mapel pola default hadir, auto-detect jadwal, alert alpha >3x, rekap otomatis semester. | [PRD.md](./06-presensi-siswa/PRD.md) | [Presensi Harian Kelas](./06-presensi-siswa/activity-presensi-harian.html)<br>[Deteksi Alfa & Alert BK](./06-presensi-siswa/activity-rekap-alert-presensi.html) |
| **07** | `07-tahfidz-tasmi` | Setoran ziyadah/muraja'ah, penilaian 3 dimensi (tajwid/makhraj/kelancaran), ujian tasmi', heatmap 30 juz, syahadah. | [PRD.md](./07-tahfidz-tasmi/PRD.md) | [Setoran Hafalan Harian](./07-tahfidz-tasmi/activity-setoran-harian.html)<br>[Ujian Tasmi' & Syahadah](./07-tahfidz-tasmi/activity-ujian-tasmi.html) |
| **08** | `08-penilaian-akademik` | Asesmen TP/LM & SAS, grid spreadsheet autosave debounced 500ms, formula KMA 347/450, narasi otomatis. | [PRD.md](./08-penilaian-akademik/PRD.md) | [Input Asesmen Grid Autosave](./08-penilaian-akademik/activity-input-asesmen.html)<br>[Kalkulasi Nilai & Narasi KMA](./08-penilaian-akademik/activity-kalkulasi-narasi.html) |
| **09** | `09-rapor-rdm` | Checklist verifikasi wali kelas, legger nilai kelas, cetak rapor resmi standar RDM Kemenag (PDF) + QR Code. | [PRD.md](./09-rapor-rdm/PRD.md) | [Verifikasi Legger Nilai](./09-rapor-rdm/activity-verifikasi-legger.html)<br>[Cetak Rapor RDM PDF + QR](./09-rapor-rdm/activity-cetak-rapor-rdm.html) |

---

### Phase 2: Extended (Kokurikuler, Kepondokan & Finansial)

| No | Modul | Fokus Bisnis Utama | Dokumen PRD | Activity Diagrams (HTML Interaktif) |
|---|---|---|---|---|
| **10** | `10-p5ra` | Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil 'Alamin (10 nilai Kemenag), matriks penilaian 4 predikat, rapor P5RA. | [PRD.md](./10-p5ra/PRD.md) | [Perencanaan Projek P5RA](./10-p5ra/activity-perencanaan-projek.html)<br>[Asesmen 4 Predikat & Rapor](./10-p5ra/activity-asesmen-rapor-p5ra.html) |
| **11** | `11-mutabaah-yaumiyah` | Monitoring amalan ibadah harian santri pesantren (shalat 5 waktu berjamaah, tahajud, dhuha, tilawah, dzikir, puasa sunnah). | [PRD.md](./11-mutabaah-yaumiyah/PRD.md) | [Input Jurnal Amalan Santri](./11-mutabaah-yaumiyah/activity-input-amalan.html)<br>[Evaluasi Musyrif & Ta'zir](./11-mutabaah-yaumiyah/activity-evaluasi-musyrif.html) |
| **12** | `12-keuangan-spp` | Billing SPP bulanan otomatis, loket kasir multi-pos auto-suggest, cetak kwitansi sah bernomor, dasbor tunggakan, dispensasi ujian. | [PRD.md](./12-keuangan-spp/PRD.md) | [Generate Tagihan Bulanan](./12-keuangan-spp/activity-generate-tagihan.html)<br>[Pembayaran Kasir & Kwitansi](./12-keuangan-spp/activity-pembayaran-kwitansi.html)<br>[Tunggakan & Dispensasi Ujian](./12-keuangan-spp/activity-dispensasi-tunggakan.html) |
| **13** | `13-kepegawaian-gtk` | Profil pendidik & tenaga kependidikan EMIS/Simpatika, kualifikasi sertifikasi, kalkulator pemenuhan 24 JTM, arsip berkas GTK. | [PRD.md](./13-kepegawaian-gtk/PRD.md) | [Registrasi Data Pokok GTK](./13-kepegawaian-gtk/activity-registrasi-gtk.html)<br>[Audit Pemenuhan 24 JTM](./13-kepegawaian-gtk/activity-validasi-jtm.html)<br>[Ekspor EMIS & Simpatika](./13-kepegawaian-gtk/activity-ekspor-gtk.html) |
| **14** | `14-jadwal-pelajaran` | Penjadwalan ganda formal madrasah + diniyah kepondokan, deteksi bentrok seketika (anti-collision engine), cetak jadwal per guru/kelas. | [PRD.md](./14-jadwal-pelajaran/PRD.md) | [Konfigurasi Slot Waktu](./14-jadwal-pelajaran/activity-konfigurasi-slot.html)<br>[Plotting & Deteksi Bentrok](./14-jadwal-pelajaran/activity-plotting-anti-bentrok.html)<br>[Cetak Jadwal Multi-Perspektif](./14-jadwal-pelajaran/activity-cetak-jadwal.html) |

---

### Phase 3: Complete (Manajemen Lanjut & Ekosistem Nasional)

| No | Modul | Fokus Bisnis Utama | Dokumen PRD | Activity Diagrams (HTML Interaktif) |
|---|---|---|---|---|
| **15** | `15-mutasi-siswa` | Mutasi masuk siswa pindahan, clearance bebas tanggungan 3 dimensi (perpus/SPP/tatib), surat pindah Kemenag, pemrosesan kelulusan XII. | [PRD.md](./15-mutasi-siswa/PRD.md) | [Mutasi Masuk Siswa Pindahan](./15-mutasi-siswa/activity-mutasi-masuk.html)<br>[Clearance & Mutasi Keluar](./15-mutasi-siswa/activity-mutasi-keluar.html)<br>[Kelulusan Massal Kelas XII](./15-mutasi-siswa/activity-kelulusan-massal.html) |
| **16** | `16-tatib-kedisiplinan` | Sistem kredit poin pelanggaran & poin apresiasi prestasi, matriks eskalasi berjenjang (SP-1 s/d SP-3), surat panggilan ortu, catatan konseling BK. | [PRD.md](./16-tatib-kedisiplinan/PRD.md) | [Pencatatan Poin & Eskalasi SP](./16-tatib-kedisiplinan/activity-input-pelanggaran.html)<br>[Konseling BK & Panggilan Ortu](./16-tatib-kedisiplinan/activity-konseling-surat-ortu.html) |
| **17** | `17-ekstrakurikuler` | Pendaftaran daring kegiatan ekskul (Pramuka, PMR, KIR, Hadroh, Kaligrafi), presensi latihan, penilaian predikat & narasi rapor RDM. | [PRD.md](./17-ekstrakurikuler/PRD.md) | [Pendaftaran & Kuota Ekskul](./17-ekstrakurikuler/activity-daftar-ekskul.html)<br>[Penilaian Ekskul ke Rapor RDM](./17-ekstrakurikuler/activity-nilai-ekskul-rdm.html) |
| **18** | `18-emis-export` | Mesin pra-audit validasi NIK/NISN/ibu kandung, dasbor kesiapan sinkronisasi (readiness meter), generator file impor portal EMIS 4.0 Kemenag. | [PRD.md](./18-emis-export/PRD.md) | [Pra-Audit Kesiapan Data EMIS](./18-emis-export/activity-audit-readiness.html)<br>[Ekspor Berkas & Draft BAP](./18-emis-export/activity-ekspor-bap.html) |
| **19** | `19-sarana-prasarana` | Inventarisasi aset gedung/ruangan/alat, stiker label QR Code fisik per barang, sirkulasi peminjaman alat, sistem tiket helpdesk kerusakan fasilitas. | [PRD.md](./19-sarana-prasarana/PRD.md) | [Registrasi Aset & Label QR](./19-sarana-prasarana/activity-registrasi-aset-qr.html)<br>[Sirkulasi Peminjaman Alat](./19-sarana-prasarana/activity-peminjaman-aset.html)<br>[Tiket Helpdesk Kerusakan](./19-sarana-prasarana/activity-tiket-pemeliharaan.html) |

---

## Standar Isi per Folder Modul
Setiap folder modul memuat:
1. `PRD.md` — Spesifikasi kebutuhan bisnis, aktor, aturan validasi, dan acceptance criteria.
2. `ARCHITECTURE.md` — Kontrak API endpoint, DTO Zod, alur service, state machine.
3. `activity-diagram.html` — Diagram aktivitas workflow aktor via `archify`.
4. `erd.html` — Diagram skema entitas basis data via `archify`.
