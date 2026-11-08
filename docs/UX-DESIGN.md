# UX-DESIGN: Panduan Desain Pengalaman Pengguna SIMMA

**Tanggal:** 2026-11-07
**Status:** Verified
**Domain:** Sistem Informasi Madrasah Aliyah
**Target Pengguna Utama:** Guru (literasi digital bervariasi), Admin TU, Kepala Madrasah

---

## Konteks Riset

- **Pertanyaan utama:** Bagaimana mendesain UI/UX yang bisa dioperasikan guru madrasah dengan cepat, tanpa ribet, dan minim kesalahan — termasuk guru senior yang literasi digitalnya rendah?
- **Prinsip dasar:** Setiap fitur didesain dari perspektif "guru yang hanya punya 10 menit di sela jam pelajaran untuk input data."
- **Sumber:** Riset UX sekolah internasional + SIM akademik madrasah Indonesia + studi usability World Bank.

---

## 1. Profil Pengguna & Konteks Penggunaan

### 1.1 Persona Pengguna

| Persona | Deskripsi | Literasi Digital | Frekuensi Akses | Tugas Utama |
|---|---|---|---|---|
| **Guru Mapel** | Mengajar 1-3 mapel, 4-6 kelas. Umur 25-55 tahun. | Rendah-Sedang | Harian (presensi), Mingguan (nilai sumatif), Semesteran (SAS & rapor) | Input nilai, presensi, deskripsi TP/LM |
| **Wali Kelas** | Guru mapel + tanggung jawab 1 kelas (30-40 siswa) | Sedang | Semesteran (rapor), situasional | Verifikasi nilai, catatan wali, cetak rapor |
| **Guru Tahfidz** | Ustadz/ustadzah penguji hafalan. Usia 30-60 tahun. | Rendah | Harian | Input setoran hafalan |
| **Admin TU** | Staf administrasi 1-2 orang. Usia 25-45 tahun. | Sedang-Tinggi | Harian | PPDB, SPP, mutasi, EMIS, cetak surat |
| **Kepala Madrasah** | Kamad. Usia 40-60 tahun. | Rendah-Sedang | Mingguan | Dashboard monitoring, approval |
| **Waka Kurikulum** | Wakil Kepala Bidang Kurikulum | Sedang | Mingguan | Monitoring nilai, jadwal, setup mapel |
| **Waka Kesiswaan** | Wakil Kepala Bidang Kesiswaan | Sedang | Harian | Tatib, poin pelanggaran, presensi |
| **Pembina Ekskul** | Guru pembina ekstrakurikuler | Rendah-Sedang | Semesteran | Input nilai ekskul |

### 1.2 Konteks Fisik Penggunaan

- **Perangkat:** Laptop guru (spek rendah, Celeron/Pentium, 4GB RAM, layar 14"), kadang tablet/HP admin
- **Jaringan:** LAN kabel/WiFi madrasah, bandwidth terbatas (shared)
- **Waktu input:** Biasanya sore/malam di rumah (nilai), pagi sebelum masuk kelas (presensi), atau di sela jam istirahat
- **Lingkungan:** Ruang guru ramai, bisa terganggu kapan saja — harus bisa save & resume

---

## 2. Prinsip Desain Utama

### 2.1 Aturan "2 Klik dari Dashboard"

Setiap task kritis harus bisa dicapai dalam maksimal 2 klik dari halaman utama:
- Dashboard -> Presensi Hari Ini (1 klik)
- Dashboard -> Input Nilai Kelas X-A (2 klik: pilih mapel -> pilih kelas)
- Dashboard -> SPP (1 klik dari shortcut admin)

### 2.2 Sensible Defaults

Sistem pre-fill data berdasarkan konteks login:
- **Guru login:** Auto-select tahun ajaran aktif, semester aktif, mapel yang diampu
- **Presensi:** Auto-select tanggal hari ini, kelas sesuai jadwal saat ini
- **SPP:** Auto-select bulan berjalan, tampilkan siswa dengan tunggakan di atas

### 2.3 Large Touch Targets

- Tombol minimum 44x44px (standar WCAG)
- Label dalam Bahasa Indonesia yang jelas dan deskriptif
- Warna fungsional: hijau (aman/tercapai), merah (peringatan/belum tercapai), kuning (perlu perhatian)
- Font minimum 14px untuk body text, 16px untuk label form

### 2.4 Offline-First Mindset

> "Treat offline as central design choice, not fallback" — World Bank Digital Education Toolkit

- LAN bisa putus sewaktu-waktu (listrik mati, router restart)
- Autosave ke local storage setiap perubahan
- Sync ke server saat koneksi tersedia
- Visual indicator: "Tersimpan lokal" (kuning) vs "Tersinkron" (hijau)
- Queue offline changes, replay saat online

---

## 3. Pola UI per Modul Kritis

### 3.1 Input Nilai — Pola Spreadsheet Grid

**Mengapa spreadsheet grid, bukan form per-siswa:**
- 36 siswa x 4 sumatif = 144 sel. Dengan form modal per-siswa, guru perlu 36 klik buka-tutup.
- Dengan grid: Tab/Enter untuk pindah sel. Semua terlihat sekaligus.
- Guru sudah familiar dengan Excel — pola grid langsung dipahami.

**Spesifikasi UI:**

```
+-------+------------------+----+----+----+----+-----+-------+
| No    | Nama Siswa       | S1 | S2 | S3 | S4 | SAS | Rapor |
+-------+------------------+----+----+----+----+-----+-------+
| 1     | Ahmad Fauzi      | 85 | 83 | 60 | 84 |  75 |  77   |
| 2     | Aisyah Putri     | 90 | 88 | 95 | 92 |  88 |  90   |
| 3     | Bayu Pratama     | 70 | -- | -- | -- |  -- |  --   |
+-------+------------------+----+----+----+----+-----+-------+
```

**Perilaku:**
- Kolom S1..Sn = input sumatif (editable)
- Kolom SAS = input ujian semester (editable)
- Kolom Rapor = auto-calculated (read-only, warna hijau/merah sesuai batas ketercapaian)
- Klik sel -> langsung editable (inline edit, bukan modal)
- Tab = pindah ke sel kanan, Enter = pindah ke sel bawah
- Escape = batal edit sel aktif
- Autosave setiap sel berubah (debounce 500ms)
- Undo/Redo (Ctrl+Z/Ctrl+Y) per sesi
- Scroll baris frozen header (nama kolom tetap terlihat)
- Scroll kolom frozen pertama (nomor + nama siswa tetap terlihat)

**Anti-pola yang DILARANG:**
- Modal popup per siswa untuk input nilai
- Halaman terpisah per siswa
- Mewajibkan klik "Simpan" manual setelah tiap siswa
- Memaksa isi 0 untuk nilai yang belum ada (biarkan kosong)

**Toolbar di atas grid:**
- Dropdown: Mapel (auto-selected jika guru hanya ampu 1)
- Dropdown: Kelas (auto-selected jika guru hanya ampu 1 kelas per mapel)
- Info bobot: "Sumatif: 75% | SAS: 25%" (link ke setting bobot)
- Tombol: "Kirim Nilai" (hanya aktif jika semua sel terisi)
- Progress bar: "28/36 siswa terisi (78%)"
- Status: "Autosave aktif - terakhir disimpan 2 detik lalu"

**Virtualisasi (TanStack Virtual):**
- Untuk kelas besar (40+ siswa), render hanya baris yang terlihat di viewport
- Mencegah freeze browser di laptop guru spek rendah

### 3.2 Presensi — Pola "Default Hadir"

**Prinsip fundamental:** Dalam kelas 36 siswa, biasanya hanya 0-3 siswa yang tidak hadir. Sistem harus mengoptimalkan kasus mayoritas (hadir), bukan kasus minoritas (absen).

**Alur:**
1. Guru buka halaman presensi -> kelas hari ini auto-selected dari jadwal
2. Semua siswa tampil sebagai HADIR (hijau) secara default
3. Guru hanya tap/klik siswa yang TIDAK hadir -> toggle status
4. Status: H (Hadir/hijau) -> S (Sakit/biru) -> I (Izin/kuning) -> A (Alpha/merah) -> T (Terlambat/oranye)
5. Klik berulang = cycle status
6. Selesai: 2-3 tap untuk kelas penuh

**Spesifikasi UI:**

```
Presensi: Kelas X-A | Senin, 7 November 2026
[36 Hadir] [0 Sakit] [0 Izin] [0 Alpha] [0 Terlambat]

+----+------------------+--------+
| 1  | Ahmad Fauzi      |   H    |  <- hijau, default
| 2  | Aisyah Putri     |   H    |
| 3  | Bayu Pratama     |   S    |  <- biru, 1 tap
| 4  | Citra Dewi       |   H    |
| ...                            |
+----+------------------+--------+

Waktu: 07:30    [Simpan Presensi]
```

**Perilaku:**
- Badge status (H/S/I/A/T) berupa tombol besar (44x44px+) dengan warna berbeda
- Summary bar di atas update real-time
- Auto-submit saat guru navigate away (dengan konfirmasi jika ada perubahan)
- Riwayat presensi bisa diakses per tanggal (kalender mini)

**Anti-pola yang DILARANG:**
- Dropdown per siswa untuk pilih status (terlalu banyak klik)
- Menampilkan semua siswa sebagai "Belum Diisi" (membuat guru harus tap 36x)
- Modal konfirmasi sebelum setiap perubahan status

### 3.3 Tahfidz — Input Setoran Hafalan

**Alur:**
1. Guru tahfidz pilih siswa (search by nama atau pilih dari daftar kelas)
2. Form setoran:
   - Jenis: [Ziyadah] [Muraja'ah] (toggle 2 pilihan)
   - Juz: dropdown atau input angka (1-30)
   - Surah: dropdown (auto-filter berdasarkan juz)
   - Ayat: dari [__] sampai [__]
   - Penilaian 3 dimensi (slider 1-100 atau grade A/B/C/D):
     - Tajwid
     - Makhrajul Huruf
     - Kelancaran
   - Status: [Lulus] [Ulangi]
   - Catatan: textarea (opsional)
3. Submit -> otomatis update progress hafalan siswa

**Visualisasi Progress:**
- Heatmap per juz: warna gelap = sudah hafal, terang = belum
- Progress bar: "12/30 Juz (40%)"
- Timeline setoran terakhir per siswa

### 3.4 SPP & Pembayaran — Pola Quick-Search + Auto-Fill

**Alur admin kasir:**
1. Buka halaman SPP
2. Ketik nama/NIS siswa -> auto-suggest (fuzzy search)
3. Pilih siswa -> tampil:
   - Tagihan outstanding (bulan mana saja yang belum lunas)
   - Jumlah auto-populated dari tarif kelas
4. Klik "Bayar" pada bulan yang dibayar -> konfirmasi -> cetak kwitansi
5. 1 transaksi = ~10 detik

**Spesifikasi UI:**

```
SPP Pembayaran
Cari Siswa: [Ahmad Fau___________] <- auto-suggest

Siswa: Ahmad Fauzi | Kelas X-A | NIS: 2024001

Tagihan Outstanding:
+----------+------------+---------+--------+
| Bulan    | Pos        | Jumlah  | Status |
+----------+------------+---------+--------+
| Sep 2026 | SPP        | 200.000 | [BAYAR]|
| Okt 2026 | SPP        | 200.000 | [BAYAR]|
| Nov 2026 | SPP        | 200.000 | [BAYAR]|
| Okt 2026 | Uang LKS   |  50.000 | [BAYAR]|
+----------+------------+---------+--------+
Total Outstanding: Rp 650.000

[Bayar Semua] [Bayar Terpilih]
```

**Rekap kelas (warna):**
- Lunas (hijau): semua tagihan terbayar
- Sebagian (kuning): ada tunggakan
- Belum bayar (merah): belum bayar sama sekali bulan ini

### 3.5 Dashboard — Per Role

#### Dashboard Guru Mapel
```
Selamat Datang, Ustadzah Siti Aminah
Tahun Ajaran 2026/2027 | Semester Ganjil

[Shortcut Cards]
+---------------------+  +---------------------+  +---------------------+
| Presensi Hari Ini   |  | Input Nilai         |  | Jadwal Hari Ini     |
| Kelas X-A (07:30)   |  | 3 kelas belum       |  | 07:30 X-A Fikih     |
| [Buka Presensi]     |  | lengkap             |  | 09:00 XI-B Fikih    |
+---------------------+  | [Buka Input Nilai]  |  | 10:30 XII-A Fikih   |
                          +---------------------+  +---------------------+

Status Pengisian Nilai Semester Ini:
+----------+--------+-----------+
| Kelas    | Mapel  | Progress  |
+----------+--------+-----------+
| X-A      | Fikih  | 28/36 ██████░░ 78% |
| XI-B     | Fikih  | 0/34  ░░░░░░░░  0% |
| XII-A    | Fikih  | 34/34 ████████ 100%|
+----------+--------+-----------+
```

#### Dashboard Kepala Madrasah
```
SIMMA | Dashboard Kepala Madrasah
TA 2026/2027 Semester Ganjil

[Statistik Cepat]
+------------------+  +------------------+  +------------------+
| Total Siswa      |  | Kehadiran Hari   |  | SPP Bulan Ini    |
| 432 aktif        |  | Ini: 95.6%       |  | Lunas: 68%       |
| (12 kelas)       |  | 20 tidak hadir   |  | Tunggakan: 32%   |
+------------------+  +------------------+  +------------------+

[Progress Input Nilai]
Guru yang sudah kirim nilai: 18/42 (43%)
Deadline: 15 Desember 2026

[Approval Menunggu]
- 3 mutasi siswa
- 1 perubahan data identitas
```

---

## 4. Navigasi & Layout

### 4.1 Struktur Navigasi

**Sidebar kiri (collapsed by default di mobile, expanded di desktop):**

```
[Logo SIMMA]
  Dashboard
  
  AKADEMIK
    Presensi
    Input Nilai
    Rapor
    P5RA
    Legger
  
  KESISWAAN
    Data Siswa
    PPDB
    Mutasi
    Tahfidz
    Tatib/Poin
    Ekskul
  
  KEUANGAN (Admin/Kamad only)
    SPP & Pembayaran
    Tagihan
    Laporan Keuangan
  
  KEPEGAWAIAN (Admin/Kamad only)
    Data GTK
    Jadwal Mengajar
  
  SARANA PRASARANA (Admin/Kamad only)
    Data Ruangan
    Inventaris
  
  PENGATURAN (Admin/Proktor only)
    Tahun Ajaran
    Kelas & Rombel
    Mata Pelajaran
    Bobot Nilai
    Profil Madrasah
    EMIS Sync
    Akun Pengguna
    Backup & Restore
```

### 4.2 Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| Desktop (1024px+) | Sidebar expanded + content area |
| Tablet (768-1023px) | Sidebar collapsed (icon only) + content area |
| Mobile (< 768px) | Bottom tab bar (4 item: Dashboard, Presensi, Nilai, Menu) |

### 4.3 Feedback Visual

| State | Indikator |
|---|---|
| Loading | Skeleton placeholder (bukan spinner) |
| Autosave berhasil | Toast kecil "Tersimpan" hijau, hilang 2 detik |
| Autosave gagal | Toast merah "Gagal menyimpan, coba lagi" + retry button |
| Offline | Banner kuning atas "Anda sedang offline. Data tersimpan lokal." |
| Kembali online | Banner hijau "Terhubung kembali. Sinkronisasi..." (auto-dismiss) |
| Form error | Inline error message di bawah field (merah), field border merah |
| Sukses submit | Full-page confirmation dengan tombol "Kembali" atau "Cetak" |

---

## 5. Aksesibilitas & Inklusivitas

### 5.1 Warna

- Jangan mengandalkan warna saja untuk menyampaikan informasi
- Gunakan ikon + label + warna: centang hijau + teks "Lunas" + background hijau muda
- Kontras minimum: WCAG AA (4.5:1 untuk teks normal, 3:1 untuk teks besar)

### 5.2 Keyboard Navigation

- Semua form bisa di-navigate dengan Tab/Shift+Tab
- Grid nilai: Arrow keys untuk navigasi sel (seperti Excel)
- Enter untuk submit/confirm
- Escape untuk cancel/close modal

### 5.3 Bahasa

- Seluruh UI dalam Bahasa Indonesia
- Istilah teknis akademik menggunakan istilah yang familiar bagi guru madrasah:
  - "Sumatif" bukan "Assessment" (istilah resmi Kurikulum Merdeka)
  - "Mata Pelajaran" bukan "Course"
  - "Rombel" bukan "Class Group"
  - "Wali Kelas" bukan "Homeroom Teacher"
  - "Presensi" bukan "Attendance"

---

## 6. Alur Onboarding & Pelatihan

### 6.1 Strategi Rollout Bertahap

Berdasarkan studi UCD Indonesia (99% task success rate untuk pengguna literasi rendah):

| Fase | Durasi | Modul Aktif | Pengguna |
|---|---|---|---|
| 1 | Minggu 1-2 | Presensi saja | Seluruh guru |
| 2 | Minggu 3-4 | + Input Nilai | Seluruh guru |
| 3 | Minggu 5-6 | + Tahfidz, Tatib | Guru tahfidz, Waka Kesiswaan |
| 4 | Minggu 7-8 | + SPP, EMIS | Admin TU |
| 5 | Minggu 9+ | Semua modul | Semua peran |

### 6.2 Peer Mentoring

- Identifikasi 2-3 "guru champion" per madrasah yang paling melek digital
- Guru champion menjadi helpdesk tier 1 untuk rekan sejawat
- Lebih efektif daripada pelatihan formal (riset: adopsi 3x lebih cepat)

### 6.3 In-App Guidance

- Tooltip contextual pada fitur baru (muncul 1x per user, bisa di-dismiss)
- Halaman "Bantuan" dengan FAQ per modul
- Shortcut guide: keyboard shortcuts tersedia dari menu (?)

---

## 7. Pola Error Handling untuk Pengguna Non-Teknis

### 7.1 Pesan Error

**DILARANG:**
- "Error 500: Internal Server Error"
- "UNIQUE constraint violation on column nik"
- "NetworkError: Failed to fetch"

**HARUS:**
- "Gagal menyimpan data. Periksa koneksi internet Anda dan coba lagi."
- "NIK ini sudah terdaftar untuk siswa lain. Silakan periksa kembali."
- "Server sedang sibuk. Data Anda tersimpan di perangkat, akan otomatis terkirim saat server tersedia."

### 7.2 Validasi Proaktif

- Validasi sebelum submit, bukan setelah
- NIK: validasi 16 digit saat typing (prevent non-numeric)
- Nilai: validasi range 0-100 saat typing
- Tanggal: date picker (jangan free text)
- Dropdown untuk semua field enum (jangan free text)

---

## 8. Performance Budget

| Metrik | Target | Alasan |
|---|---|---|
| First Contentful Paint | < 1.5 detik | LAN lokal, asset served dari server yang sama |
| Time to Interactive | < 3 detik | Laptop guru spek rendah |
| Grid render 40 siswa | < 500ms | TanStack Virtual, render visible rows only |
| Autosave latency | < 200ms | Debounce + immediate local save |
| PDF rapor generate | < 5 detik/siswa | Server-side generation |
| Bundle size (gzipped) | < 200KB initial | Code splitting per route |

---

## Sumber & Referensi

| # | Sumber | URL | Tanggal | Status |
|---|---|---|---|---|
| 1 | World Bank Digital Education Toolkit | worldbank.org | 2026-11-07 | Verified |
| 2 | Nielsen Norman Group - Forms Design | nngroup.com | 2026-11-07 | Verified |
| 3 | WCAG 2.1 AA Guidelines | w3.org/WAI/WCAG21 | 2026-11-07 | Verified |
| 4 | Studi UCD untuk Pengguna Literasi Rendah Indonesia | academia.edu | 2026-11-07 | Verified |
| 5 | TanStack Virtual Documentation | tanstack.com/virtual | 2026-11-07 | Verified |
| 6 | Riset SIM Akademik Madrasah (Jurnal) | Multiple sources | 2026-11-07 | Verified |
