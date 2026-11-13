# Laporan Audit & Code Review Arsitektur SIMMA

> **Tanggal:** 9 November 2026  
> **Auditor:** Agent Code Reviewer (Clean Code & Architecture Gatekeeper)  
> **Cakupan:** `simma-be`, `simma-fe`, `packages/shared` *(Termasuk audit lengkap Modul PPDB Madrasah)*  
> **Status Verifikasi:** Typecheck Hijau (`tsc --noEmit`), Test Hijau (BE: 163 passed, FE: 47 passed, Total: 210 tests)

---

## 1. Ringkasan Eksekutif & Metrik Basis Kode

Pemeriksaan menyeluruh dilakukan terhadap seluruh repositori monorepo SIMMA. Struktur monorepo telah mengimplementasikan pemisahan layer Fastify di Backend dan React Vite di Frontend, didukung oleh package `@simma/shared`.

### Metrik Baris Kode (Lines of Code / LOC)

| Sub-Project | Jumlah File | Total Baris (LOC) | Rata-rata LOC/File | Status Batas 300 Baris |
|---|---|---|---|---|
| **`simma-be`** (Backend) | 77 file | 13.520 baris | 175 baris | 5 file melanggar (>300 LOC) |
| **`simma-fe`** (Frontend) | 78 file | 18.320 baris | 234 baris | **19 file melanggar (>300 LOC)** |
| **`packages/shared`** | 11 file | 1.063 baris | 96 baris | Memenuhi standar (sangat ramping) |
| **Total Keseluruhan** | **166 file** | **32.903 baris** | **198 baris** | **24 file butuh pemecahan** |

> **Temuan Utama:**  
> Backend relatif modular dan terstruktur rapi per domain. Masalah bloated file terbesar berpusat di **`simma-fe`**, khususnya halaman-halaman laporan, rekap, form wizard publik PPDB, dan master data yang menggabungkan modal dialog, filter, tabel matriks, kalkulasi lokal, dan layout cetak ke dalam satu file komponen tunggal (*God Component*). Di sisi backend, `ppdb.service.ts` membengkak (674 LOC) karena menangani multi-domain (auth calon siswa, upload berkas terenkripsi UUID, verifikasi berkas panitia TU, generasi PDF, dan mutasi transaksional Buku Induk).

---

## 2. Pemetaan & Rekomendasi Pemecahan File Berukuran Panjang (>300 Baris)

Sesuai standar Clean Code (*Single Responsibility Principle* dan batas maksimal 300 baris per file), berkas-berkas berikut **wajib dipecah**:

### 2.1 Frontend (`simma-fe`)

| No | File | LOC | Masalah Utama | Rekomendasi Pemecahan |
|---|---|---|---|---|
| 1 | `src/features/reports/components/StudentReportCardPage.tsx` | **1.027** | *God Component*: menyatukan selector kelas, preview kartu rapor interaktif, form modal catatan wali kelas, kalkulasi deskripsi, dan 300 baris markup khusus print CSS. | Pecah menjadi 5 file:<br>1. `ReportCardFilterBar.tsx` (~80 baris)<br>2. `ReportCardPreview.tsx` (~220 baris)<br>3. `ReportCardPrintLayout.tsx` (~260 baris)<br>4. `EditReportNotesModal.tsx` (~180 baris)<br>5. `useReportCardState.ts` (custom hook ~150 baris) |
| 2 | `src/features/ppdb/components/PpdbPublicPortalPage.tsx` | **767** | *God Component*: Menyatukan alur registrasi multi-step wizard (Data Diri, Orang Tua, Asal Madrasah/SMP, Unggah Berkas Persyaratan), cek status mandiri, dan form login akun calon siswa. | Pecah menjadi sub-komponen wizard:<br>1. `PpdbStepIdentity.tsx` (~160 baris)<br>2. `PpdbStepParents.tsx` (~140 baris)<br>3. `PpdbStepSchool.tsx` (~110 baris)<br>4. `PpdbStepUpload.tsx` (~180 baris)<br>5. `PpdbStatusTracker.tsx` (~120 baris)<br>6. `PpdbCandidateAuthModal.tsx` (~110 baris) |
| 3 | `src/features/attendance/components/AttendanceRecapPage.tsx` | **682** | Menyatukan tab rekap siswa, tab rekap guru, filter tanggal, tabel matriks, serta 2 modal detail rekap siswa & guru. | Pecah menjadi 4 file:<br>1. `StudentAttendanceRecapTable.tsx` (~180 baris)<br>2. `TeacherAttendanceRecapTable.tsx` (~180 baris)<br>3. `StudentAttendanceDetailModal.tsx` (~140 baris)<br>4. `TeacherAttendanceDetailModal.tsx` (~140 baris) |
| 4 | `src/features/reports/components/ClassroomLeggerPage.tsx` | **592** | Menyatukan kartu agregasi nilai, tabel matriks besar (siswa x mapel), fungsi kalkulasi peringkat, dan layout print legger. | Pecah menjadi 3 file:<br>1. `LeggerSummaryCards.tsx` (~110 baris)<br>2. `LeggerMatrixTable.tsx` (~260 baris)<br>3. `LeggerPrintView.tsx` (~180 baris) |
| 5 | `src/features/students/components/StudentDetailPage.tsx` | **568** | Menggabungkan identitas siswa, tab wali murid, modal mutasi status, dan modal tambah wali. | Pecah menjadi 4 file:<br>1. `StudentIdentityCard.tsx` (~160 baris)<br>2. `StudentParentsTab.tsx` (~150 baris)<br>3. `StudentStatusModal.tsx` (~120 baris)<br>4. `AddParentModal.tsx` (~130 baris) |
| 6 | `src/features/settings/components/SubjectsPage.tsx` | **563** | Menyatukan tabel master mata pelajaran Kemenag, filter kelompok mapel, modal tambah/edit, dan dialog konfirmasi hapus. | Pecah menjadi:<br>1. `SubjectsTable.tsx` (~200 baris)<br>2. `SubjectFormModal.tsx` (~160 baris) |
| 7 | `src/features/ppdb/components/PpdbDashboardPage.tsx` | **537** | Menyatukan kartu metrik statistik pendaftar, filter tabel multi-jalur/status, modal detail verifikasi berkas per-dokumen, dan modal mutasi ke Buku Induk Siswa. | Pecah menjadi:<br>1. `PpdbApplicantsTable.tsx` (~200 baris)<br>2. `PpdbApplicantDetailModal.tsx` (~190 baris)<br>3. `PpdbStatsCards.tsx` (~90 baris) |
| 8 | `src/features/tahfidz/components/TahfidzRecordsPage.tsx` | **535** | Menggabungkan histori setoran hafalan, kalkulasi skor tajwid/makhroj, dan modal input setoran harian. | Pecah menjadi:<br>1. `TahfidzRecordsTable.tsx` (~220 baris)<br>2. `TahfidzRecordFormModal.tsx` (~190 baris) |
| 9 | `src/features/students/components/StudentsListPage.tsx` | **534** | Menyatukan filter NISN/status, pagination, tabel siswa, dan modal pendaftaran siswa baru. | Pecah menjadi:<br>1. `StudentsTable.tsx` (~220 baris)<br>2. `CreateStudentModal.tsx` (~200 baris) |
| 10 | `src/features/settings/components/ClassroomsPage.tsx` | **534** | Menyatukan tabel rombel, form modal assign wali kelas, dan kuota siswa. | Pecah menjadi:<br>1. `ClassroomsTable.tsx` (~210 baris)<br>2. `ClassroomFormModal.tsx` (~180 baris) |
| 11 | `src/features/settings/api/settings.api.ts` | **529** | Menggabungkan 5 domain berbeda (Institution, Academic Years, Semesters, Classrooms, Subjects, Teachers) ke dalam 1 file API. | Pecah menjadi folder `src/features/settings/api/`:<br>1. `academic-years.api.ts`<br>2. `semesters.api.ts`<br>3. `classrooms.api.ts`<br>4. `subjects.api.ts`<br>5. `teachers.api.ts`<br>6. `institution.api.ts` |
| 12 | `src/features/tahfidz/components/TasmiExamsPage.tsx` | **496** | Menggabungkan daftar ujian tasmi', modal penilaian penguji, dan status kelulusan. | Pecah menjadi `TasmiExamsTable.tsx` dan `TasmiExamFormModal.tsx` |
| 13 | `src/features/grades/components/AssessmentsListPage.tsx` | **442** | Manajemen asesmen (tugas, UH, UTS, UAS) dan modal pembuatannya. | Pecah menjadi `AssessmentsTable.tsx` dan `AssessmentFormModal.tsx` |
| 14 | `src/features/settings/components/AcademicYearsPage.tsx` | **429** | Tabel tahun ajaran dan modal aktivasi/edit. | Pecah menjadi `AcademicYearsTable.tsx` dan `AcademicYearModal.tsx` |
| 15 | `src/features/settings/components/SemestersPage.tsx` | **425** | Tabel semester dan modal aktivasi/edit. | Pecah menjadi `SemestersTable.tsx` dan `SemesterModal.tsx` |
| 16 | `src/features/settings/components/TeachersPage.tsx` | **418** | Tabel guru dan modal input GTK. | Pecah menjadi `TeachersTable.tsx` dan `TeacherModal.tsx` |
| 17 | `src/features/grades/components/SemesterGradesPage.tsx` | **392** | Rangkuman nilai akhir semester dan kalkulasi rapor. | Pisahkan tabel nilai dan modal batch calculate. |
| 18 | `src/features/grades/components/GradeInputSheetPage.tsx` | **384** | Matriks spreadsheet input nilai siswa per asesmen. | Pisahkan baris input spreadsheet ke `GradeInputRow.tsx`. |
| 19 | `src/features/attendance/components/AttendanceStudentPage.tsx` | **380** | Input presensi harian siswa per kelas. | Pisahkan baris tabel presensi ke `StudentAttendanceRow.tsx`. |
| 20 | `src/features/attendance/components/AttendanceTeacherPage.tsx` | **340** | Presensi harian guru & staf. | Pisahkan baris presensi ke `TeacherAttendanceRow.tsx`. |

---

### 2.2 Backend (`simma-be`)

| No | File | LOC | Masalah Utama | Rekomendasi Pemecahan |
|---|---|---|---|---|
| 1 | `src/modules/ppdb/ppdb.service.ts` | **674** | Menggabungkan autentikasi calon siswa (bcrypt/JWT), registrasi pendaftar, upload multipart & sanitasi berkas UUID fisik, verifikasi berkas oleh panitia TU, generasi PDF resmi, dan mutasi atomik transaksional Buku Induk Siswa. | Pecah menjadi modul terisolasi:<br>1. `ppdb-auth.service.ts` (~120 baris)<br>2. `ppdb-document.service.ts` (~180 baris)<br>3. `ppdb-enrollment.service.ts` (~160 baris)<br>4. `ppdb.service.ts` (koordinator ~210 baris) |
| 2 | `src/modules/setup/setup.repository.ts` | **520** | Menggabungkan 6 model database Drizzle dalam 1 repository tunggal (institution, academicYears, semesters, classrooms, subjects, teachers). | Pecah menjadi sub-repository:<br>1. `academic-years.repo.ts`<br>2. `semesters.repo.ts`<br>3. `classrooms.repo.ts`<br>4. `subjects.repo.ts`<br>5. `teachers.repo.ts`<br>*(atau pertahankan satu file jika masih di bawah 600 baris, namun modul lain rata-rata <300 baris)* |
| 3 | `src/modules/setup/setup.service.ts` | **450** | Berisi seluruh business logic validasi & transaksi untuk 6 entitas setup sekaligus. | Pecah sejalan dengan repository: pisahkan logic rombel & guru ke service mandiri. |
| 4 | `src/modules/grades/grades.service.ts` | **333** | Logika kalkulasi bobot asesmen dan semester grade calculation. | Pisahkan fungsi kalkulasi murni bobot nilai ke `grades.calculator.ts`. |
| 5 | `src/modules/ppdb/ppdb.repository.ts` | **305** | Operasi database multi-tabel (`ppdbApplicants`, `ppdbDocuments`, `academicYears`, `students`, `parents`) dan agregasi statistik multi-jalur. | Pisahkan fungsi query dokumen ke `ppdb-document.repository.ts`. |

---

## 3. Pengawasan Lokasi Penulisan Kode (Boundary & Domain Placement)

Berikut adalah temuan ketat terkait kode yang salah tempat (*misplaced code*):

### 3.1 Fungsi Download CSV & Manipulasi DOM di Dalam `types.ts` (Pelanggaran Clean Code)
- **Lokasi Ditemukan:** `simma-fe/src/features/reports/types.ts` (baris 250–310).
- **Masalah:** Di dalam file definisi tipe TypeScript (`types.ts`), ditemukan fungsi imperatif browser:
  ```ts
  export function exportLeggerToCsv(legger: ClassroomLeggerResponse): void {
    // manipulasi DOM: document.createElement('a'), URL.createObjectURL, Blob
  }
  ```
- **Koreksi:** File `types.ts` harus **100% deklaratif** (hanya berisi `interface`, `type`, dan `enum`). Logika ekspor CSV dan manipulasi DOM wajib dipindahkan ke:
  `simma-fe/src/lib/csv-exporter.ts` atau `simma-fe/src/features/reports/utils/report-export.utils.ts`.

### 3.2 Duplikasi Logika Bisnis Huruf Mutu (`calculateLetterGrade`)
- **Lokasi Ditemukan:**
  1. `packages/shared/src/constants.ts` (Sumber resmi: rentang A >= 85, B >= 75, C >= 65, D < 65).
  2. `simma-fe/src/features/grades/types.ts` (Duplikasi manual).
  3. `simma-fe/src/features/reports/types.ts` (Duplikasi manual kedua).
- **Koreksi:** Hapus deklarasi lokal di FE `types.ts`. Gunakan import langsung dari `@simma/shared`:
  ```ts
  import { calculateLetterGrade } from "@simma/shared";
  ```

### 3.3 Penamaan Modul Setup vs Settings & URL Replacement Hack
- **Lokasi Ditemukan:** `simma-fe/src/features/settings/api/settings.api.ts`.
- **Masalah:** Di Backend rute didaftarkan sebagai `/api/v1/setup/*`, namun di Frontend folder dinamai `settings` dan pemanggil API melakukan manipulasi string runtime:
  ```ts
  const target = endpoint.startsWith("/setup/") ? endpoint : endpoint.replace("/settings/", "/setup/");
  ```
- **Koreksi:** Pola replace runtime ini rentan bug dan membingungkan developer. Solusinya adalah menggunakan **Centralized Endpoints Registry** yang telah dibuat pada langkah di bawah.

### 3.4 Duplikasi Fungsi Helper `extractList` dan `extractSingle` di 5 File API FE
- **Lokasi Ditemukan:**
  - `simma-fe/src/features/tahfidz/api/tahfidz.api.ts`
  - `simma-fe/src/features/settings/api/settings.api.ts`
  - `simma-fe/src/features/students/api/students.api.ts`
  - `simma-fe/src/features/grades/api/grades.api.ts`
  - `simma-fe/src/features/attendance/api/attendance.api.ts`
- **Koreksi:** Logika unwrap response Fastify `{ success: true, data: [...] }` seharusnya diselesaikan satu kali di dalam `simma-fe/src/lib/api-client.ts`, bukan di-copy-paste di setiap modul API feature.

---

## 4. Pembersihan Dead Code (Yang Telah Dikerjakan)

Seluruh dead code berikut telah diidentifikasi dan **berhasil dihapus / dibersihkan**:

1. **`packages/shared/src/constants.ts`:**
   - Ditemukan elemen duplikat `"guru"` di dalam array `ROLES` (baris 8 dan 15). Elemen duplikat telah dihapus.
2. **`simma-be/src/modules/grades/grades.service.ts`:**
   - Variabel `existing` pada baris 225 tidak pernah dibaca. Diperbaiki menjadi pemanggilan langsung `await this.getSemesterGradeById(id)`.
3. **`simma-be/src/modules/reports/reports.repository.ts`:**
   - Import `inArray` dari Drizzle ORM tidak terpakai. Berhasil dihapus.
4. **`simma-be/src/modules/students/students.service.ts`:**
   - Import tipe `Parent` tidak pernah digunakan. Berhasil dihapus.
5. **`simma-be/src/modules/tahfidz/tahfidz.service.ts`:**
   - Variabel `existing` pada baris 60 tidak pernah dibaca. Diperbaiki menjadi `await this.getRecordById(id)`.
6. **`simma-fe/src/features/tahfidz/api/tahfidz.api.ts`:**
   - Fungsi `extractList` dideklarasikan namun tidak pernah dipanggil. Berhasil dihapus.
7. **`simma-fe/src/features/attendance/components/AttendanceRecapPage.tsx`:**
   - Import `Calendar`, `BarChart3`, `User`, `Search` yang tidak terpakai telah dibersihkan.
8. **`simma-fe/src/features/grades/components/AssessmentsListPage.tsx`:**
   - Import `CheckCircle2` yang tidak terpakai telah dibersihkan.
9. **`simma-fe/src/features/reports/components/ClassroomLeggerPage.tsx`:**
   - Import `Input` yang tidak terpakai telah dibersihkan.
10. **`simma-fe/src/features/reports/components/StudentReportCardPage.tsx`:**
    - Import `BookOpen`, `CalendarCheck`, `CheckCircle2`, `Sparkles` yang tidak terpakai telah dibersihkan.
11. **`simma-fe/src/features/settings/components/AcademicYearsPage.tsx`:**
    - Import `Input` yang tidak terpakai telah dibersihkan.
12. **`simma-fe/src/features/students/components/StudentDetailPage.tsx`:**
    - Import `Calendar` dan `Gender` yang tidak terpakai telah dibersihkan.
13. **`simma-fe/src/features/students/components/StudentsListPage.tsx`:**
    - Import `Filter` yang tidak terpakai telah dibersihkan.
14. **`simma-fe/src/features/tahfidz/components/TahfidzRecordsPage.tsx`:**
    - Import `CheckCircle`, `Calendar`, `BookOpen` yang tidak terpakai telah dibersihkan.
15. **`simma-fe/src/features/tahfidz/components/TasmiExamsPage.tsx`:**
    - Import `Award` yang tidak terpakai telah dibersihkan.

---

## 5. Implementasi Centralized API Endpoints Registry di FE

Sesuai kebutuhan arsitektur Anda (di mana endpoint backend dapat diakses dan diperbarui dari satu file terpusat seperti env):

### File Baru Dibuat: `simma-fe/src/config/endpoints.ts`

File ini mengumpulkan seluruh daftar endpoint BE secara terstruktur per modul. Setiap kali tim BE mengubah rute URL (misal: penyesuaian versi `/v2` atau renaming dari `/setup` ke `/settings`), developer cukup mengganti nilai di file ini tanpa menyentuh ratusan baris di komponen UI atau custom hook.

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  SETUP: {
    INSTITUTION: "/setup/institution",
    ACADEMIC_YEARS: "/setup/academic-years",
    ACADEMIC_YEAR_DETAIL: (id: string) => `/setup/academic-years/${id}`,
    ACADEMIC_YEAR_ACTIVE: (id: string) => `/setup/academic-years/${id}/active`,
    SEMESTERS: "/setup/semesters",
    SEMESTER_DETAIL: (id: string) => `/setup/semesters/${id}`,
    SEMESTER_ACTIVE: (id: string) => `/setup/semesters/${id}/active`,
    CLASSROOMS: "/setup/classrooms",
    CLASSROOM_DETAIL: (id: string) => `/setup/classrooms/${id}`,
    SUBJECTS: "/setup/subjects",
    SUBJECT_DETAIL: (id: string) => `/setup/subjects/${id}`,
    TEACHERS: "/setup/teachers",
    TEACHER_DETAIL: (id: string) => `/setup/teachers/${id}`,
  },
  STUDENTS: {
    LIST: "/students",
    CREATE: "/students",
    DETAIL: (id: string) => `/students/${id}`,
    UPDATE: (id: string) => `/students/${id}`,
    DELETE: (id: string) => `/students/${id}`,
    PARENTS: (id: string) => `/students/${id}/parents`,
    ASSIGN_CLASSROOM: (id: string) => `/students/${id}/classroom`,
  },
  TAHFIDZ: {
    LIST: "/tahfidz",
    CREATE: "/tahfidz",
    DETAIL: (id: string) => `/tahfidz/${id}`,
    UPDATE: (id: string) => `/tahfidz/${id}`,
    DELETE: (id: string) => `/tahfidz/${id}`,
    PROGRESS: (studentId: string) => `/tahfidz/progress/${studentId}`,
    TASMI_LIST: "/tahfidz/tasmi",
    TASMI_CREATE: "/tahfidz/tasmi",
    TASMI_DETAIL: (id: string) => `/tahfidz/tasmi/${id}`,
    TASMI_UPDATE: (id: string) => `/tahfidz/tasmi/${id}`,
    TASMI_DELETE: (id: string) => `/tahfidz/tasmi/${id}`,
  },
  ATTENDANCE: {
    STUDENTS: "/attendance/students",
    STUDENT_DETAIL: (id: string) => `/attendance/students/${id}`,
    BULK_STUDENTS: "/attendance/bulk",
    CLASSROOM_DAILY: (classId: string, date: string) => `/attendance/classroom/${classId}/date/${date}`,
    STUDENT_SUMMARY: (studentId: string) => `/attendance/student/${studentId}/summary`,
    TEACHERS: "/attendance/teachers",
    TEACHER_DETAIL: (id: string) => `/attendance/teachers/${id}`,
    BULK_TEACHERS: "/attendance/teachers/bulk",
    TEACHER_SUMMARY: (teacherId: string) => `/attendance/teacher/${teacherId}/summary`,
    RECAP: "/attendance/recap",
  },
  GRADES: {
    ASSESSMENTS: "/grades/assessments",
    ASSESSMENT_DETAIL: (id: string) => `/grades/assessments/${id}`,
    ASSESSMENT_GRADES: (id: string) => `/grades/assessments/${id}/grades`,
    BATCH_UPSERT: "/grades/batch",
    SEMESTERS: "/grades/semesters",
    SEMESTER_DETAIL: (id: string) => `/grades/semesters/${id}`,
    SEMESTER_CALCULATE: "/grades/semester/calculate",
  },
  REPORTS: {
    STUDENT_CARD: (studentId: string, semesterId: string) => `/reports/student/${studentId}/semester/${semesterId}`,
    STUDENT_PDF: (studentId: string, semesterId: string) => `/reports/student/${studentId}/semester/${semesterId}/pdf`,
    STUDENT_NOTES: (studentId: string) => `/reports/student/${studentId}/notes`,
    CLASSROOM_LEGGER: (classroomId: string, semesterId: string) => `/reports/classroom/${classroomId}/semester/${semesterId}/legger`,
  },
  PPDB: {
    PUBLIC_INFO: "/ppdb/public-info",
    STATS: "/ppdb/stats",
    REGISTER_ACCOUNT: "/ppdb/register",
    LOGIN: "/ppdb/login",
    PORTAL_REGISTER: "/ppdb/portal/register",
    PORTAL_LOGIN: "/ppdb/portal/login",
    CHECK_STATUS: "/ppdb/check-status",
    PORTAL_ME: "/ppdb/portal/me",
    PORTAL_UPDATE: "/ppdb/portal/me",
    PORTAL_FINALIZE: "/ppdb/portal/me/finalize",
    PORTAL_CARD_PDF: "/ppdb/portal/me/card/pdf",
    PORTAL_DOCUMENTS: "/ppdb/portal/me/documents",
    PORTAL_DOCUMENT_DELETE: (id: string) => `/ppdb/portal/me/documents/${id}`,
    PORTAL_DOCUMENT_FILE: (id: string) => `/ppdb/documents/${id}/file`,
    APPLICANTS: "/ppdb/applicants",
    APPLICANT_DETAIL: (id: string) => `/ppdb/applicants/${id}`,
    APPLICANT_STATUS: (id: string) => `/ppdb/applicants/${id}/status`,
    APPLICANT_ENROLL: (id: string) => `/ppdb/applicants/${id}/enroll`,
    APPLICANT_DELETE: (id: string) => `/ppdb/applicants/${id}`,
    APPLICANT_CARD_PDF: (id: string) => `/ppdb/applicants/${id}/card/pdf`,
    DOCUMENT_VERIFY: (id: string) => `/ppdb/documents/${id}/verify`,
  },
} as const;
```

---

## 6. Checklist Aksi Tindak Lanjut untuk Tim Pengembang

1. [ ] **Refactoring God Components di FE:** Pecah `StudentReportCardPage.tsx` (1.027 baris), `PpdbPublicPortalPage.tsx` (767 baris), dan `AttendanceRecapPage.tsx` (682 baris) sesuai panduan bagian 2.1.
2. [ ] **Refactoring Multi-Domain Service di BE:** Pecah `ppdb.service.ts` (674 baris) menjadi sub-layanan mandiri (`ppdb-auth`, `ppdb-document`, `ppdb-enrollment`).
3. [ ] **Pindahkan Fungsi CSV:** Pindahkan `exportLeggerToCsv` dari `simma-fe/src/features/reports/types.ts` ke `src/lib/csv-exporter.ts`.
4. [x] **Adopsi Centralized Endpoints PPDB:** Migrasikan pemanggilan string literal endpoint PPDB di `features/ppdb/api/ppdb.api.ts` ke `API_ENDPOINTS.PPDB` dari `simma-fe/src/config/endpoints.ts`.
5. [ ] **Adopsi Centralized Endpoints Modul Lain:** Selesaikan migrasi pemanggilan string literal di fitur tersisa (`settings`, `students`, `attendance`, `grades`, `tahfidz`, `reports`).
6. [ ] **Konsolidasi Response Wrapper:** Standarisasi fungsi unwrap data di `api-client.ts` agar modul feature tidak lagi menduplikasi `extractList` / `extractSingle`.
7. [ ] **Setup ESLint Flat Config:** Tambahkan `eslint.config.js` di root/sub-package agar `pnpm -r run lint` berjalan dengan ESLint v9.
