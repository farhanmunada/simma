# Task Breakdown: Audit Sidebar Lengkap, Autentikasi Kode GTK 4 Digit, CRUD Kepegawaian & Data Scoping

> Status: Selesai (`db:generate`, `db:migrate`, `db:seed`, verifikasi DB nyata, typecheck, test, dan build).

- [x] **Phase 1: Schema, Roles & Auth Kode 4 Digit (`gtk-code-auth`)**
  - [x] Task 1.1: Tambah role baru (`operator`, `guru_diniyah`, `musyrif`, `pustakawan`) & konstanta `GTK_CODE_PREFIX_BY_ROLE` / `GTK_ROLE_OPTIONS` di `packages/shared`.
  - [x] Task 1.2: Update `LoginSchema` (`min(4)`) & tambah schema akun/enrolment GTK di `packages/shared`.
  - [x] Task 1.3: Update skema DB (`teachers.employeeCode`, `users.secondaryRoles`, `teacher_subject_assignments`, `teacher_classroom_scopes`).
  - [x] Task 1.4: Update `AuthService`, JWT payload (`secondaryRoles`), dan middleware `requireRoles` agar mendukung `role` utama + `secondaryRoles`.

- [x] **Phase 2: Sub-Menu Sidebar, Route Guards & Role-Aware Dashboard (`rbac-roles-submenus`)**
  - [x] Task 2.1: Tambah dukungan `roles` pada level `subItems` di `nav-items.ts` & `AppLayout.tsx` + proteksi sub-rute di `AttendanceRoutes`, `MutabaahRoutes`, `FinanceRoutes`, `DisciplineRoutes`, dan `StudentsRoutes`.
  - [x] Task 2.2: Perbarui `DashboardOverview.tsx` agar role-aware & assignment-aware (menggunakan `useMyScope()` dan komponen KPI khusus role admin).

- [x] **Phase 3: CRUD Kepegawaian GTK Lengkap & Enrolment Penugasan (`gtk-crud-enrolment`)**
  - [x] Task 3.1: Update `TeachersService` & `TeachersRepository` untuk auto-generate kode 4 digit, auto-provision `users`, reset password ke kode, toggle aktif akun, serta simpan biodata lengkap & penugasan dalam `db.transaction` (khusus `super_admin` & `operator`).
  - [x] Task 3.2: Pecah & perbarui UI `TeacherFormModal` menjadi 4 tab modular (`<= 300` LOC/file) + tampilkan kode akun, status akun, delegasi, dan tombol Reset Password di `TeacherTable` & `TeacherDetailModal`.

- [x] **Phase 4: Screening & Data-Level Scoping di Seluruh Modul (`data-scoping-enforcement`)**
  - [x] Task 4.1: Buat `TeacherScopeService` terpusat di backend untuk resolve kelas perwalian, `(classroomId, subjectId)` ampu, ekskul binaan, projek P5RA, dan binaan tahfidz/musyrif.
  - [x] Task 4.2: Terapkan screening ketat & penyembunyian data (UI hide + backend `403`) di `teachers`, `grades`, `reports`, `attendance`, `extracurricular`, `students`, `p5ra`, `tahfidz`, `mutabaah`, `discipline`, `letters`.
  - [x] Task 4.3: Terapkan filter scoping otomatis pada dropdown/daftar di `simma-fe` (`grades`, `reports`, `attendance`, `extracurricular`).

- [x] **Phase 5: Pengujian, Migrasi & Verifikasi Menyeluruh**
  - [x] Task 5.1: Update `seed.ts` (hapus auth lama, isi dummy 4-digit + delegasi), `README.md`, dan unit tests FE/BE.
  - [x] Task 5.2: Jalankan `db:generate` + `db:migrate` + `db:seed` + query verifikasi nyata PostgreSQL, serta `pnpm -r run typecheck`, `pnpm -r run test`, dan `pnpm -r run build`.
