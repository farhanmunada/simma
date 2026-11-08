# TASK: FE Wave 3 - Presensi Harian UI (Attendance Management)

## 1. Boundary & Scope
- **Worktree:** `C:\Users\vola\orca\workspaces\simma\wave3-fe-attendance`
- **Folder Kerja:** `simma-fe/src/features/attendance/`
- **File Sentuh Lainnya:** `simma-fe/src/App.tsx` (hubungkan route `attendance/*`)
- **DILARANG:** Menyentuh backend `simma-be`, folder `packages/shared`, atau folder fitur lainnya (`auth`, `settings`, `students`, `tahfidz`, `grades`).

## 2. Requirements UI & Fungsional
1. **API Integration via TanStack Query:**
   - Gunakan `apiClient` dari `simma-fe/src/lib/api-client.ts`.
   - Modul API di `simma-fe/src/features/attendance/api/attendance.api.ts`:
     - GET `/api/v1/attendance/classroom/:classId/date/:date` (ambil presensi kelas per tanggal)
     - POST `/api/v1/attendance/bulk` (body: classroomId, date YYYY-MM-DD, teacherId?, attendances: Array<{ studentId, status: 'hadir'|'izin'|'sakit'|'alpa', note?: string }>)
     - GET `/api/v1/attendance/student/:studentId/summary` (rekap akumulasi kehadiran siswa)
     - GET `/api/v1/attendance/students` (list catatan presensi siswa, params: page, limit, classroomId, studentId, date, startDate, endDate, status)
     - GET `/api/v1/attendance/teachers` (list catatan presensi guru)
     - POST `/api/v1/attendance/teachers/bulk` (body: date, attendances: Array<{ teacherId, status: 'hadir'|'izin'|'sakit'|'alpa'|'dinas_luar', note?: string }>)
     - GET `/api/v1/attendance/teacher/:teacherId/summary` (rekap akumulasi kehadiran guru)
2. **Halaman & Komponen yang Harus Dibuat:**
   - `types.ts`: Interface AttendanceStudent, AttendanceTeacher, AttendanceSummary, form DTOs, dan filter params.
   - `AttendanceStudentPage.tsx`:
     - Pemilihan kelas (classroom dropdown) dan tanggal presensi (default hari ini).
     - Grid/Tabel daftar siswa di kelas tersebut dengan radio / toggle status cepat (Hadir [H], Izin [I], Sakit [S], Alpa [A]).
     - Field catatan opsional per siswa.
     - Tombol Simpan Presensi Kelas (batch).
   - `AttendanceTeacherPage.tsx`:
     - Grid presensi harian guru/karyawan (Hadir, Izin, Sakit, Alpa, Dinas Luar).
     - Tombol Simpan Presensi GTK.
   - `AttendanceRecapPage.tsx`:
     - Tampilan rekap kehadiran siswa/kelas per periode tanggal atau bulan (total H/I/S/A dan % kehadiran).
   - `AttendanceRoutes.tsx`:
     - Sub-router navigasi tab untuk path `attendance` (Presensi Siswa), `attendance/teachers` (Presensi GTK), dan `attendance/recap` (Rekap Kehadiran).
   - `index.ts`: Public barrel export.
   - `attendance.spec.ts`: Unit test untuk fungsi API & hooks (sediakan mock `globalThis.localStorage` jika import modul client).
3. **Route Integration:**
   - Di `simma-fe/src/App.tsx`, ganti route placeholder `attendance/*` dengan `<AttendanceRoutes />`.

## 3. UI Guidelines
- Clean, padat, tanpa teks petunjuk bertele-tele, tanpa hero banner bertumpuk.
- Gunakan tombol status dengan warna jelas: Hadir (hijau/emerald), Izin (biru/sky), Sakit (kuning/amber), Alpa (merah/rose), Dinas Luar (ungu/violet).
- Gunakan komponen dasar `Button`, `Input`, `Select`, `Badge`, `Card`, `Modal` dari `simma-fe/src/components/ui/`.

## 4. Verifikasi & Penyelesaian
1. Jalankan `pnpm --filter simma-fe run test`
2. Jalankan `pnpm --filter simma-fe run typecheck`
3. Jalankan `pnpm --filter simma-fe run build` (harus sukses 0 error)
4. Commit atomik:
   `git add simma-fe/ && git commit -m "feat(fe-attendance): implement student & teacher attendance daily input and recap UI"`
5. Cetak sinyal selesai:
   `[WORKER STATUS: FINISHED] Module FE-Attendance complete. Ready for Gatekeeper audit.`
