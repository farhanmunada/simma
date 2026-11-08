# Laporan Audit & Code Review Arsitektur SIMMA

> **Tanggal:** 8 November 2026  
> **Auditor:** Agent Code Reviewer (Clean Code & Architecture Gatekeeper)  
> **Cakupan:** `simma-be`, `simma-fe`, `packages/shared` *(Fitur PPDB dikecualikan sesuai instruksi)*  
> **Status Verifikasi:** Typecheck Hijau (`tsc --noEmit`), Test Hijau (BE: 151 passed, FE: 44 passed, Total: 195 tests)

---

## 1. Ringkasan Eksekutif & Metrik Basis Kode

Pemeriksaan menyeluruh dilakukan terhadap seluruh repositori monorepo SIMMA. Struktur monorepo telah mengimplementasikan pemisahan layer Fastify di Backend dan React Vite di Frontend, didukung oleh package `@simma/shared`.

### Metrik Baris Kode (Lines of Code / LOC)

| Sub-Project | Jumlah File | Total Baris (LOC) | Rata-rata LOC/File | Status Batas 300 Baris |
|---|---|---|---|---|
| **`simma-be`** (Backend) | 69 file | 11.409 baris | 165 baris | 3 file melanggar (>300 LOC) |
| **`simma-fe`** (Frontend) | 71 file | 16.019 baris | 225 baris | **17 file melanggar (>300 LOC)** |
| **`packages/shared`** | 10 file | 893 baris | 89 baris | Memenuhi standar (sangat ramping) |
| **Total Keseluruhan** | **150 file** | **28.321 baris** | **188 baris** | **20 file butuh pemecahan** |

> **Temuan Utama:**  
> Backend relatif modular dan terstruktur rapi per domain. Masalah bloated file terbesar berpusat di **`simma-fe`**, khususnya halaman-halaman laporan, rekap, dan master data yang menggabungkan modal dialog, filter, tabel matriks, kalkulasi lokal, dan layout cetak ke dalam satu file komponen tunggal (*God Component*).

---

## 2. Pemetaan & Rekomendasi Pemecahan File Berukuran Panjang (>300 Baris)

Sesuai standar Clean Code (*Single Responsibility Principle* dan batas maksimal 300 baris per file), berkas-berkas berikut **wajib dipecah**:

### 2.1 Frontend (`simma-fe`)

| No | File | LOC | Masalah Utama | Rekomendasi Pemecahan |
|---|---|---|---|---|
| 1 | `src/features/reports/components/StudentReportCardPage.tsx` | **1.027** | *God Component*: menyatukan selector kelas, preview kartu rapor interaktif, form modal catatan wali kelas, kalkulasi deskripsi, dan 300 baris markup khusus print CSS. | Pecah menjadi 5 file:<br>1. `ReportCardFilterBar.tsx` (~80 baris)<br>2. `ReportCardPreview.tsx` (~220 baris)<br>3. `ReportCardPrintLayout.tsx` (~260 baris)<br>4. `EditReportNotesModal.tsx` (~180 baris)<br>5. `useReportCardState.ts` (custom hook ~150 baris) |
| 2 | `src/features/attendance/components/AttendanceRecapPage.tsx` | **682** | Menyatukan tab rekap siswa, tab rekap guru, filter tanggal, tabel matriks, serta 2 modal detail rekap siswa & guru. | Pecah menjadi 4 file:<br>1. `StudentAttendanceRecapTable.tsx` (~180 baris)<br>2. `TeacherAttendanceRecapTable.tsx` (~180 baris)<br>3. `StudentAttendanceDetailModal.tsx` (~140 baris)<br>4. `TeacherAttendanceDetailModal.tsx` (~140 baris) |
| 3 | `src/features/reports/components/ClassroomLeggerPage.tsx` | **592** | Menyatukan kartu agregasi nilai, tabel matriks besar (siswa x mapel), fungsi kalkulasi peringkat, dan layout print legger. | Pecah menjadi 3 file:<br>1. `LeggerSummaryCards.tsx` (~110 baris)<br>2. `LeggerMatrixTable.tsx` (~260 baris)<br>3. `LeggerPrintView.tsx` (~180 baris) |
| 4 | `src/features/students/components/StudentDetailPage.tsx` | **568** | Menggabungkan identitas siswa, tab wali murid, modal mutasi status, dan modal tambah wali. | Pecah menjadi 4 file:<br>1. `StudentIdentityCard.tsx` (~160 baris)<br>2. `StudentParentsTab.tsx` (~150 baris)<br>3. `StudentStatusModal.tsx` (~120 baris)<br>4. `AddParentModal.tsx` (~130 baris) |
| 5 | `src/features/settings/components/SubjectsPage.tsx` | **563** | Menyatukan tabel master mata pelajaran Kemenag, filter kelompok mapel, modal tambah/edit, dan dialog konfirmasi hapus. | Pecah menjadi:<br>1. `SubjectsTable.tsx` (~200 baris)<br>2. `SubjectFormModal.tsx` (~160 baris) |
| 6 | `src/features/tahfidz/components/TahfidzRecordsPage.tsx` | **535** | Menggabungkan histori setoran hafalan, kalkulasi skor tajwid/makhroj, dan modal input setoran harian. | Pecah menjadi:<br>1. `TahfidzRecordsTable.tsx` (~220 baris)<br>2. `TahfidzRecordFormModal.tsx` (~190 baris) |
| 7 | `src/features/students/components/StudentsListPage.tsx` | **534** | Menyatukan filter NISN/status, pagination, tabel siswa, dan modal pendaftaran siswa baru. | Pecah menjadi:<br>1. `StudentsTable.tsx` (~220 baris)<br>2. `CreateStudentModal.tsx` (~200 baris) |
| 8 | `src/features/settings/components/ClassroomsPage.tsx` | **534** | Menyatukan tabel rombel, form modal assign wali kelas, dan kuota siswa. | Pecah menjadi:<br>1. `ClassroomsTable.tsx` (~210 baris)<br>2. `ClassroomFormModal.tsx` (~180 baris) |
| 9 | `src/features/settings/api/settings.api.ts` | **529** | Menggabungkan 5 domain berbeda (Institution, Academic Years, Semesters, Classrooms, Subjects, Teachers) ke dalam 1 file API. | Pecah menjadi folder `src/features/settings/api/`:<br>1. `academic-years.api.ts`<br>2. `semesters.api.ts`<br>3. `classrooms.api.ts`<br>4. `subjects.api.ts`<br>5. `teachers.api.ts`<br>6. `institution.api.ts` |
| 10 | `src/features/tahfidz/components/TasmiExamsPage.tsx` | **496** | Menggabungkan daftar ujian tasmi', modal penilaian penguji, dan status kelulusan. | Pecah menjadi `TasmiExamsTable.tsx` dan `TasmiExamFormModal.tsx` |
| 11 | `src/features/grades/components/AssessmentsListPage.tsx` | **442** | Manajemen asesmen (tugas, UH, UTS, UAS) dan modal pembuatannya. | Pecah menjadi `AssessmentsTable.tsx` dan `AssessmentFormModal.tsx` |
| 12 | `src/features/settings/components/AcademicYearsPage.tsx` | **429** | Tabel tahun ajaran dan modal aktivasi/edit. | Pecah menjadi `AcademicYearsTable.tsx` dan `AcademicYearModal.tsx` |
| 13 | `src/features/settings/components/SemestersPage.tsx` | **425** | Tabel semester dan modal aktivasi/edit. | Pecah menjadi `SemestersTable.tsx` dan `SemesterModal.tsx` |
| 14 | `src/features/settings/components/TeachersPage.tsx` | **418** | Tabel guru dan modal input GTK. | Pecah menjadi `TeachersTable.tsx` dan `TeacherModal.tsx` |
| 15 | `src/features/grades/components/SemesterGradesPage.tsx` | **392** | Rangkuman nilai akhir semester dan kalkulasi rapor. | Pisahkan tabel nilai dan modal batch calculate. |
| 16 | `src/features/grades/components/GradeInputSheetPage.tsx` | **384** | Matriks spreadsheet input nilai siswa per asesmen. | Pisahkan baris input spreadsheet ke `GradeInputRow.tsx`. |
| 17 | `src/features/attendance/components/AttendanceStudentPage.tsx` | **380** | Input presensi harian siswa per kelas. | Pisahkan baris tabel presensi ke `StudentAttendanceRow.tsx`. |
| 18 | `src/features/attendance/components/AttendanceTeacherPage.tsx` | **340** | Presensi harian guru & staf. | Pisahkan baris presensi ke `TeacherAttendanceRow.tsx`. |

---

### 2.2 Backend (`simma-be`)

| No | File | LOC | Masalah Utama | Rekomendasi Pemecahan |
|---|---|---|---|---|
| 1 | `src/modules/setup/setup.repository.ts` | **520** | Menggabungkan 6 model database Drizzle dalam 1 repository tunggal (institution, academicYears, semesters, classrooms, subjects, teachers). | Pecah menjadi sub-repository:<br>1. `academic-years.repo.ts`<br>2. `semesters.repo.ts`<br>3. `classrooms.repo.ts`<br>4. `subjects.repo.ts`<br>5. `teachers.repo.ts`<br>*(atau pertahankan satu file jika masih di bawah 600 baris, namun modul lain rata-rata <300 baris)* |
| 2 | `src/modules/setup/setup.service.ts` | **450** | Berisi seluruh business logic validasi & transaksi untuk 6 entitas setup sekaligus. | Pecah sejalan dengan repository: pisahkan logic rombel & guru ke service mandiri. |
| 3 | `src/modules/grades/grades.service.ts` | **333** | Logika kalkulasi bobot asesmen dan semester grade calculation. | Pisahkan fungsi kalkulasi murni bobot nilai ke `grades.calculator.ts`. |

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
} as const;
```

---

## 6. Checklist Aksi Tindak Lanjut untuk Tim Pengembang

1. [ ] **Refactoring God Components di FE:** Pecah `StudentReportCardPage.tsx` (1.027 baris) dan `AttendanceRecapPage.tsx` (682 baris) sesuai panduan bagian 2.1.
2. [ ] **Pindahkan Fungsi CSV:** Pindahkan `exportLeggerToCsv` dari `simma-fe/src/features/reports/types.ts` ke `src/lib/csv-exporter.ts`.
3. [ ] **Adopsi Centralized Endpoints:** Migrasikan pemanggilan string literal endpoint di `features/*/api/*.ts` ke `API_ENDPOINTS` dari `simma-fe/src/config/endpoints.ts`.
4. [ ] **Konsolidasi Response Wrapper:** Standarisasi fungsi unwrap data di `api-client.ts` agar modul feature tidak lagi menduplikasi `extractList` / `extractSingle`.
5. [ ] **Setup ESLint Flat Config:** Tambahkan `eslint.config.js` di root/sub-package agar `pnpm -r run lint` berjalan dengan ESLint v9.
