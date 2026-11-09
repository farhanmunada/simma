# REFACTOR TASK: Modul 06 Presensi Siswa (Clean Code & Boundary <300 LOC)

## Role & Boundary
- Role: Worker Attendance (Model: worker-gemini)
- Working Directory: C:/Users/vola/orca/workspaces/simma/refactor-attendance
- Branch: farhanmunada/refactor-attendance
- Boundary BE: `simma-be/src/modules/attendance/`
- Boundary FE: `simma-fe/src/features/attendance/`
- DILARANG mengedit modul lain atau file shared/core tanpa izin.

## Target Refactor
1. Pecah `AttendanceRecapPage.tsx` (678 LOC) & `AttendanceDailyPage.tsx` (>300 LOC) menjadi komponen-komponen terisolasi di `components/`:
   - `AttendanceFilterBar.tsx`
   - `AttendanceRecapTable.tsx`
   - `AttendanceRecapSummaryCards.tsx`
   - `AttendanceExportModal.tsx`
   File `AttendanceRecapPage.tsx` dan `AttendanceDailyPage.tsx` wajib < 300 LOC.
2. Periksa `attendance.service.ts` & `attendance.repository.ts`. Jika ada file > 300 LOC, pecah logic per concern.
3. Pastikan pencatatan presensi massal (bulk attendance submit) menggunakan `db.transaction(...)`.
4. Migrasi semua pemanggilan API di `attendance.api.ts` ke `API_ENDPOINTS.ATTENDANCE.*`.
5. Berkas `types.ts` wajib 100% deklaratif.

## Verification & Completion Protocol
1. Jalankan verifikasi:
   - `pnpm --filter simma-be exec tsc --noEmit`
   - `pnpm --filter simma-fe exec tsc --noEmit`
   - `pnpm --filter simma-be test`
   - `pnpm --filter simma-fe test`
2. Git commit atomik:
   `git commit -am "refactor(attendance): decompose AttendanceRecapPage and AttendanceDailyPage under 300 LOC"`
3. Tandai worktree comment:
   `orca worktree set --comment "PR_READY: farhanmunada/refactor-attendance"`
4. Kirim sinyal selesai ke Leader:
   `orca orchestration send --run run_7f527f8b9449 --type worker_done --from "Worker Attendance" --body "Refactor attendance complete: recap and daily pages split under 300 LOC, tests pass."`
