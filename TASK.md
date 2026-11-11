# TASK: Modul 17 Ekstrakurikuler (Worker Q)

## Scope Boundary
- Modul: 17 Ekstrakurikuler
- BE: `simma-be/src/modules/extracurricular/*` & `simma-be/src/db/schema/extracurricular.ts`
- FE: `simma-fe/src/features/extracurricular/*`
- Shared: `packages/shared/src/schemas/extracurricular.schema.ts` (lapor Leader jika butuh ekspor bersama)
- DILARANG mengedit modul lain atau file di luar boundary.

## Persyaratan Kritis & Regulasi
- Referensi PRD: `docs/modules/17-ekstrakurikuler/PRD.md`
- DB Schema & Entitas:
  - `extracurriculars` (id, code, name, category, coachId fk teachers, scheduleDay, scheduleTime, venue, isActive)
  - `extracurricular_members` (id, extracurricularId, studentId fk students, academicYearId, semester, role [MEMBER, LEADER, SECRETARY], joinedDate, status)
  - `extracurricular_grades` (id, extracurricularMemberId, academicYearId, semester, score/predicate [A/Sangat Baik, B/Baik, C/Cukup, D/Kurang], notes/deskripsi capaian rapor RDM)
- API Fastify v5 & Drizzle ORM:
  - Repository, Service, Controller, Routes, Zod Schemas.
  - Endpoint manajemen ekskul, anggota/registrasi siswa, dan input nilai capaian rapor RDM.
  - Co-located unit test (`extracurricular.spec.ts`) minimal 3 skenario lulus.
- Frontend React 19 + TanStack Query + Tailwind CSS:
  - Daftar ekskul & pembina, pendaftaran anggota, matriks input nilai predikat + deskripsi rapor RDM.
  - UI konsisten nuansa madrasah (emerald/green), clean, modern.
- Kualitas & Aturan Clean Code:
  - Maksimal 300 LOC per file. (SELESAI - seluruh file modul < 300 LOC)
  - No mock data di FE/BE. (SELESAI - query Drizzle ORM murni & backend API client)
  - Jalankan `pnpm -r run typecheck` dan `pnpm -r run test` sebelum lapor selesai. (SELESAI - 100% HIJAU)

## Status Penyelesaian
- [x] Shared constants & Zod schemas (`packages/shared/src/schemas/extracurricular.schema.ts`)
- [x] Drizzle ORM schema (`simma-be/src/db/schema/extracurricular.ts`)
- [x] Backend Layered Architecture (Repo, Service, Controller, Routes)
- [x] Unit test backend Vitest (`extracurricular.spec.ts` - 11/11 lolos)
- [x] Frontend API & Types (`extracurricular.api.ts`, `types.ts`)
- [x] Frontend UI Components (StatsCards, Table, FormModal, MembersTab, GradesTab)
- [x] Frontend Unit test (`extracurricular.spec.ts` - 3/3 lolos)
- [x] Routing & Navigation integrasi (`App.tsx`, `nav-items.ts`)
- [x] Verifikasi Monorepo: `pnpm -r run typecheck` pass, `pnpm -r run test` pass (328/328 tests hijau).
