# REFACTOR TASK: Modul 08 Penilaian Akademik (Clean Code & Boundary <300 LOC)

## Role & Boundary
- Role: Worker Grades (Model: worker-gemini)
- Working Directory: C:/Users/vola/orca/workspaces/simma/refactor-grades
- Branch: farhanmunada/refactor-grades
- Boundary BE: `simma-be/src/modules/grades/`
- Boundary FE: `simma-fe/src/features/grades/`
- DILARANG mengedit modul lain atau file shared/core tanpa izin.

## Target Refactor
1. Pecah `ClassroomGradesPage.tsx` & `BatchGradeEntryPage.tsx` (>300 LOC) menjadi sub-komponen terisolasi di `components/`:
   - `GradeEntryTable.tsx`
   - `GradeWeightSettingsCard.tsx`
   - `GradeSummaryCard.tsx`
   - `BatchGradeToolbar.tsx`
   Setiap berkas wajib < 300 LOC.
2. Periksa `grades.service.ts` & `grades.repository.ts`. Jika > 300 LOC, pecah logic per scope (misal: input nilai harian vs sumatif vs kalkulasi agregat).
3. Pastikan mutasi bulk grade entry di backend dibungkus `db.transaction(...)`.
4. Migrasi seluruh pemanggilan API di `grades.api.ts` ke `API_ENDPOINTS.GRADES.*`.
5. Berkas `types.ts` wajib 100% deklaratif.

## Verification & Completion Protocol
1. Jalankan verifikasi:
   - `pnpm --filter simma-be exec tsc --noEmit`
   - `pnpm --filter simma-fe exec tsc --noEmit`
   - `pnpm --filter simma-be test`
   - `pnpm --filter simma-fe test`
2. Git commit atomik:
   `git commit -am "refactor(grades): decompose batch grade entry UI and split service under 300 LOC"`
3. Tandai worktree comment:
   `orca worktree set --comment "PR_READY: farhanmunada/refactor-grades"`
4. Kirim sinyal selesai ke Leader:
   `orca orchestration send --run run_7f527f8b9449 --type worker_done --from "Worker Grades" --body "Refactor grades complete: batch entry split, atomic transactions on bulk save, tests pass."`
