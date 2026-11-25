# Spesifikasi Lengkap: Audit Seluruh Fitur Sidebar, Autentikasi Kode GTK 4 Digit, CRUD Kepegawaian & Data Scoping

**Tanggal:** 2026-11-25  
**Status:** Menunggu Konfirmasi & Approval Manusia (Gate Sebelum Implementasi)  
**Cakupan:** Seluruh 17 Menu & Sub-Menu Sidebar + Autentikasi Kode Unik GTK + CRUD Kepegawaian + Enrolment Delegasi Tugas

---

## 1. Audit Menyeluruh Seluruh Fitur di Sidebar (17 Grup Menu)

Hasil audit kode aktual pada [nav-items.ts](file:///D:/Coding/simma/simma-fe/src/components/layout/nav-items.ts), [AppLayout.tsx](file:///D:/Coding/simma/simma-fe/src/components/layout/AppLayout.tsx), [DashboardOverview.tsx](file:///D:/Coding/simma/simma-fe/src/features/dashboard/components/DashboardOverview.tsx), serta seluruh `*.routes.ts` & `schema/*.ts` backend:

| # | Menu & Sub-Menu Sidebar | Temuan Celah / Masalah Saat Ini | Rancangan Hak Akses & Screening Data (Target) |
|---|---|---|---|
| **1** | **Dashboard** (`/`) | `DashboardOverview.tsx` memanggil `useStudents`, `usePpdbStats`, `useClassrooms`, `useTeachers` untuk **semua role** (memicu error `403` bagi Bendahara/BK/Tahfidz/Ekskul/Sarpras), tombol shortcut & 8 kartu sama untuk semua role, serta link lama `/settings/academic-years`. | **Role & Assignment-Aware Dashboard:** Hanya panggil API sesuai izin role; tampilkan ringkasan **Tugas Saya** (Kelas Perwalian, Mapel+Kelas Ampuan, Ekskul Binaan, Disposisi Masuk) + shortcut menu sesuai role. |
| **2** | **Presensi** (`/attendance/students`, `/attendance/teachers`, `/attendance/recap`) | Sub-menu `Presensi Guru` terbuka untuk semua guru/wali kelas; belum ada filter kelas ampu di `attendance/students` dan `recap`. | - `Presensi Siswa`: Guru Mapel/Guru Diniyah hanya absen kelas yang didelegasikan; Wali Kelas lihat/kelola kelas perwaliannya; TU/Kamad/Waka lihat semua.<br>- `Presensi Guru`: Hanya **Operator / Admin TU / Kamad / Piket** (guru lain hanya lihat rekap pribadinya).<br>- `Rekapitulasi`: Tersaring sesuai kelas tugasnya. |
| **3** | **Tahfidz & Tasmi'** (`/tahfidz`, `/tahfidz/tasmi`) | `guru_tahfidz` melihat seluruh santri tanpa pembagian halaqah/kelompok binaan; `Wali Kelas` tidak disaring ke kelasnya. | Tambah delegasi **Kelompok/Kelas Tahfidz** per `guru_tahfidz` (atau per kelas rombel); `Wali Kelas` hanya read-only progres tahfidz siswa **kelas perwaliannya**; `Kamad/Waka` read semua. |
| **4** | **Mutaba'ah Yaumiyah** (`/mutabaah/checklist`, `/mutabaah/compliance`, `/mutabaah/activities`) | Belum ada role **Musyrif / Pengurus Asrama**; semua guru bisa lihat sub-menu `Katalog Amalan`; belum ada scoping kelompok/kamar/kelas binaan. | - Tambah role **`musyrif`** (Pengurus Asrama/Pondok).<br>- `Checklist & Monitoring`: Musyrif/Wali Kelas/Tahfidz hanya santri binaannya (atau kelas perwaliannya).<br>- `Katalog Amalan`: Hanya Operator / Kamad / Waka Kesiswaan / Waka Kurikulum. |
| **5** | **Tata Tertib & BK** (`/discipline`, `/infractions`, `/counseling`, `/summons`, `/rules`) | `AppLayout.tsx` tidak memfilter sub-menu: Guru Mapel melihat menu `Bimbingan Konseling (BK)` dan `Panggilan Orang Tua` meski `counselingSessions` bertanda `isConfidential`. | - `Pelanggaran & Apresiasi`: Semua guru bisa melapor (`POST`), lihat siswa di kelasnya/laporannya.<br>- `Bimbingan Konseling (BK)`: **Khusus Guru BK & Kamad** (terkunci dari guru biasa).<br>- `Panggilan Ortu & Approval SP`: **Waka Kesiswaan, Guru BK, Kamad**, plus Wali Kelas (read kelasnya).<br>- `Katalog Aturan`: Kelola oleh Waka Kesiswaan/BK/TU. |
| **6** | **Keuangan & SPP** (`/finance/cashier`, `/invoices`, `/fee-items`, `/dispensations`, `/reports`) | `Admin TU` dan `Kamad` melihat sub-menu `Pos & Tarif Biaya` tanpa pembedaan kasir vs pengelola tarif; Wali Kelas tidak punya ringkasan status SPP kelasnya jika diperlukan untuk clearance. | - `Kasir Loket Cepat`: **Bendahara & Admin TU/Kasir**.<br>- `Pos & Tarif Biaya` & `Generate Tagihan`: **Bendahara** (+ Kamad/Operator).<br>- `Dispensasi`: Ajukan Bendahara/TU, Approve **Kamad/Bendahara**.<br>- `Laporan Keuangan`: **Bendahara & Kamad**. |
| **7** | **Penilaian** (`/grades`) | `GET/POST /assessments` & `grades` tidak memvalidasi apakah guru benar-benar mengampu `(classroomId, subjectId)` yang dipilih; guru bisa memilih kelas/mapel mana saja. | **Screening Ketat:** Guru Mapel / Guru Diniyah hanya melihat dan dapat menginput/mengubah asesmen & nilai akhir pada pasangan **`(classroomId, subjectId)`** yang didelegasikan operator kepadanya (`teacher_subject_assignments`). |
| **8** | **Jadwal Pelajaran** (`/schedules`) | Guru/Wali Kelas/Tendik melihat tombol/tampilan global tanpa filter jadwal pribadi; Waka Kurikulum/TU kelola jadwal. | Waka Kurikulum / Operator / TU / Kamad kelola jadwal penuh; Guru Mapel/Diniyah/Wali Kelas/Tahfidz/Ekskul read-only dengan tab default **Jadwal Mengajar Saya / Kelas Saya**. |
| **9** | **Tata Usaha & Surat** (`/letters/incoming`, `/dispositions`, `/outgoing`, `/expeditions`, `/classifications`) | Di sidebar hanya muncul untuk `super_admin, admin_tu, kepala_madrasah`, padahal di tabel `dispositions` ada `targetUserId` dan `targetRole` untuk Waka/Guru penerima disposisi! | - `Surat Masuk/Keluar/Ekspedisi/Klasifikasi`: **Admin TU, Kepala TU, Operator, Kamad**.<br>- `Disposisi`: Kamad buat disposisi; Waka/Guru/Staf penerima melihat & menindaklanjuti disposisi yang ditujukan ke `targetUserId` atau `targetRole` miliknya. |
| **10** | **Projek P5RA** (`/p5ra`) | Semua guru melihat seluruh projek P5RA lintas kelas tanpa memfilter kelas binaan atau `coordinatorTeacherId`. | Waka Kurikulum / Kamad / Operator kelola master projek; Wali Kelas / Fasilitator hanya menilai siswa pada **kelas perwalian atau projek yang ditugaskan** (`coordinatorTeacherId` / `p5ra_project_classrooms`). |
| **11** | **Ekstrakurikuler** (`/extracurricular`) | `Pembina Ekskul` masih bisa melihat & memodifikasi data anggota/nilai ekskul lain yang bukan `coachId`-nya. | **Screening Ketat:** `Pembina Ekskul` hanya melihat & mengelola anggota, latihan, dan nilai untuk ekskul di mana `extracurriculars.coachId === req.user.teacherId`. Waka Kesiswaan/TU/Kamad lihat & kelola semua. |
| **12** | **Rapor & Legger** (`/reports`, `/reports/legger`) | `Wali Kelas` bisa memilih kelas lain di dropdown dan mencetak PDF/Legger kelas lain; `Guru` biasa juga masuk ke `REPORTS` meski bukan wali kelas. | **Screening Ketat:** `Wali Kelas` hanya bisa mengakses legger, catatan wali kelas, dan cetak rapor untuk kelas di mana `classrooms.homeroomTeacherId === req.user.teacherId`. Guru non-wali tidak perlu akses cetak rapor. |
| **13** | **Kepegawaian GTK** (`/teachers`, `/teachers/workloads`, `/teachers/monitoring`) | **Celah kritis:** Saat ini guru biasa (`guru`, `guru_mapel`, `wali_kelas`) bisa mengakses `GET/PATCH /teachers` dan melihat data GTK lain. | **Khusus Operator (`operator` & `super_admin`):** Seluruh CRUD Kepegawaian GTK, pembuatan kode 4 digit, reset password, pangkat, dokumen, beban kerja 24 JTM, dan enrolment penugasan dikunci penuh hanya untuk **Operator** (`super_admin`/`operator`). Role guru/tendik lain **tidak memiliki akses** ke modul Kepegawaian GTK. |
| **14** | **Sarana & Prasarana** (`/facilities`) | Semua staf melihat tombol & menu yang sama tanpa pemisahan UI kelola aset vs ajukan peminjaman/tiket rusak. | **Waka Sarpras & Admin TU**: Kelola aset, QR code, approval pinjam/maintenance. **Guru/Staf lain**: Hanya lihat katalog aset, ajukan peminjaman, & lapor tiket kerusakan miliknya. |
| **15** | **Kesiswaan** (8 sub-menu: `PPDB`, `Buku Induk`, `Kelas & Rombel`, `Penempatan Rombel`, `Mutasi`, `Tahun Ajaran`, `Semester`, `Mapel`) | **Celah besar:** Satu grup `MODULE_ROLES.STUDENTS` membuat `Wali Kelas` ikut melihat `PPDB & Pendaftar`, `Tahun Ajaran`, `Semester`, `Penempatan Rombel`, dan `Mutasi`. | Pecah izin **per sub-menu**:<br>- `PPDB & Pendaftar`: TU, Operator, Waka Kesiswaan, Kamad.<br>- `Buku Induk`: TU/Operator (CRUD), Waka/Kamad (Read all), **Wali Kelas (Read siswa kelas perwaliannya saja)**.<br>- `Kelas, Penempatan, TA, Semester, Mapel`: **Operator, Admin TU, Waka Kurikulum**.<br>- `Mutasi & Kelulusan`: TU, Waka Kesiswaan, Bendahara (clearance), Kamad (approve). |
| **16** | **Ekspor EMIS 4.0** (`/emis`) | Sudah cukup terisolasi (`super_admin, admin_tu, kepala_madrasah, waka_*`), namun BAP create/approve perlu sinkron di UI. | Tetap untuk **Operator / Admin TU / Kamad** (+ read Waka Kurikulum/Kesiswaan); tombol buat BAP hanya TU/Operator, tombol approve BAP hanya Kamad. |
| **17** | **Profil Madrasah** (`/settings/profile`) | Sudah disinkronkan read untuk Kamad & write untuk TU/Operator. | **Operator / Super Admin / Admin TU** (Edit), **Kepala Madrasah** (Read/Preview). |

---

## 2. Phase 0: Capability Map

| Module ID | Tanggung Jawab | Bergantung Pada |
|---|---|---|
| `gtk-code-auth` | Format kode unik 4 digit (2 digit gugus/tugas + 2 digit urut), `LoginSchema` min 4 char, auto-create akun `users` saat tambah GTK, bcrypt hash password awal = kode, reset password ke kode, aktif/nonaktif akun | `users`, `teachers` |
| `rbac-roles-submenus` | Penambahan role baru (sesuai konfirmasi user), dukungan `users.secondaryRoles`, dukungan filter `roles` di level `subItems` sidebar (`AppLayout.tsx`) + `RouteRoleGuard` per sub-rute + Role-aware `DashboardOverview` | `gtk-code-auth` |
| `gtk-crud-enrolment` | Pembaruan besar CRUD GTK (seluruh field `teacher_profiles` + akun kode 4 digit + cetak kartu kode) dan tab **Enrolment Penugasan** oleh Operator (Wali Kelas, Mapel+Kelas, Ekskul, Tahfidz/Asrama) | `gtk-code-auth`, `classrooms`, `subjects`, `extracurriculars` |
| `data-scoping-enforcement` | `TeacherScopeService` backend + screening ketat per `teacherId` di `teachers`, `grades`, `reports`, `attendance`, `extracurricular`, `tahfidz`, `mutabaah`, `p5ra`, `students`, `discipline`, `letters` + sinkron filter dropdown FE | `rbac-roles-submenus`, `gtk-crud-enrolment` |

**Build Order:** `gtk-code-auth` &rarr; `rbac-roles-submenus` &amp; `gtk-crud-enrolment` &rarr; `data-scoping-enforcement`

---

## 3. Rancangan Kode 4 Digit & CRUD Kepegawaian GTK

### 3.1 Format Kode Unik 4 Digit Angka Murni (`2 digit gugus/tugas + 2 digit no urut`)
Kode login dan password awal GTK menggunakan **4 digit angka murni** (`^\d{4}$`) agar cepat diketik (bisa lewat numpad) dan mudah diingat berdasarkan gugus tugas:

| Prefix 2 Digit | Gugus / Role Utama | Contoh Kode 4 Digit |
|---|---|---|
| `10` | Operator / Super Admin | `1001`..`1099` |
| `11` | Kepala Madrasah | `1101`..`1199` |
| `12` | Waka Kurikulum | `1201`..`1299` |
| `13` | Waka Kesiswaan | `1301`..`1399` |
| `14` | Waka Sarpras | `1401`..`1499` |
| `21` | Wali Kelas | `2101`..`2199` |
| `22` | Guru Mapel Formal | `2201`..`2299` |
| `23` | Guru Diniyah / Pondok *(usulan baru)* | `2301`..`2399` |
| `24` | Guru Tahfidz | `2401`..`2499` |
| `25` | Pembina Ekstrakurikuler | `2501`..`2599` |
| `26` | Guru BK | `2601`..`2699` |
| `27` | Guru Umum (`guru`) | `2701`..`2799` |
| `28` | Musyrif / Pengurus Asrama *(usulan baru)* | `2801`..`2899` |
| `31` | Admin / Staf Tata Usaha | `3101`..`3199` |
| `32` | Bendahara | `3201`..`3299` |
| `33` | Pustakawan *(usulan baru)* | `3301`..`3399` |

*(Pola mudah diingat: `1x` = Pimpinan/Operator, `2x` = Guru/Pendidik/Pembina, `3x` = Tenaga Kependidikan; 2 digit terakhir = nomor urut `01`–`99`).*

### 3.2 Pembaruan Data CRUD Kepegawaian GTK (4 Tab Modular)
Memecah form agar mencakup seluruh kolom DB yang sebelumnya hilang + akun + delegasi tugas:
1. **Tab Identitas & Akun Kode:** Nama Lengkap + Gelar, NIK (16 digit), NUPTK, NIP, NRG, PegID Simpatika, Jenis GTK, Status Kepegawaian (`PNS/PPPK/GTY/GTT/PTT`), Jabatan Resmi, Status Tugas (`aktif/cuti/tugas_belajar/mutasi/pensiun/keluar`), **Role Utama**, **Role Tambahan (`secondaryRoles`)**, **Kode Unik 4 Digit (auto-generate / editable)**, Status Akun (`Aktif/Nonaktif`), tombol **Reset Password ke Kode**.
2. **Tab Biodata & Alamat:** No. KK (16 digit), Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Agama, Status Pernikahan, No. WhatsApp/HP, Email, Alamat Lengkap.
3. **Tab Riwayat TMT & Sertifikasi:** TMT Pertama Mengabdi, TMT PNS/Inpassing, Bidang Studi Sertifikasi, Keterangan Sertifikasi.
4. **Tab Enrolment Penugasan:**
   - **Wali Kelas:** pilih rombel perwalian semester aktif (`classrooms.homeroomTeacherId`).
   - **Guru Mapel / Diniyah:** tambah daftar pasangan `(Kelas, Mata Pelajaran)` di `teacher_subject_assignments`.
   - **Pembina Ekstrakurikuler:** pilih ekskul yang dibina (`extracurriculars.coachId`).
   - **Guru Tahfidz / Musyrif:** pilih kelas/kelompok santri binaan (`teacher_student_groups` / assignment kelas binaan).

---

## 4. Kebijakan Terkunci & Konfirmasi Akhir Sebelum Eksekusi

1. **Format Kode 4 Digit (Terkonfirmasi):** Angka murni 4 digit (`^\d{4}$`, 2 digit gugus/tugas `10`–`33` + 2 digit no urut `01`–`99`).
2. **Kebijakan Password (Terkonfirmasi):** Guru/Tendik **dilarang mengubah password sendiri**. Hanya **Operator** (`operator`/`super_admin`) yang dapat membuat atau mereset password GTK (kode 4 digit di-hash `bcrypt`).
3. **Akses Data Kepegawaian GTK (Terkonfirmasi):** Modul Kepegawaian GTK & Enrolment Tugas dikunci penuh **hanya untuk Operator** (`operator`/`super_admin`); role lain tidak bisa melihat atau mengubah data kepegawaian.
4. **Penyembunyian Data Lintas Tugas (Terkonfirmasi):** Data yang tidak memiliki akses atau tidak didelegasikan ke user **disembunyikan total di UI** (sidebar, sub-menu, dropdown, dan daftar) serta **ditolak `403 Forbidden` di API Backend**.
5. **Konfirmasi Akhir — Role Baru:** Daftar role baru yang akan ditambahkan ke `ROLES`: **`operator`**, **`guru_diniyah`**, **`musyrif`**, **`pustakawan`**. *(Apakah daftar role ini sudah sesuai dan siap dieksekusi?)*
