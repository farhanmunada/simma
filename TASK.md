# TASK: Modul 19 Sarana & Prasarana (Worker S)

## Scope Boundary
- Modul: 19 Sarana Prasarana
- BE: `simma-be/src/modules/facilities/*` & `simma-be/src/db/schema/facilities.ts`
- FE: `simma-fe/src/features/facilities/*`
- Shared: `packages/shared/src/schemas/facilities.schema.ts` (lapor Leader jika butuh ekspor bersama)
- DILARANG mengedit modul lain atau file di luar boundary.

## Persyaratan Kritis & Regulasi
- Referensi PRD: `docs/modules/19-sarana-prasarana/PRD.md`
- DB Schema & Entitas:
  - `facility_assets` (id, code, name, category [ELEKTRONIK, FURNITUR, RUANGAN, LABORATORIUM, KENDARAAN], condition [BAIK, RUSAK_RINGAN, RUSAK_BERAT], location/roomId, purchaseDate, sourceOfFund, qrCodeToken, status [TERSEDIA, DIPINJAM, DALAM_PERBAIKAN, DIHAPUSKAN])
  - `facility_loans` (id, assetId, borrowerName, borrowerType [SISWA, GTK, EKSTERNAL], loanDate, dueDate, returnDate, status [DIPINJAM, DIKEMBALIKAN, TERLAMBAT], notes)
  - `facility_maintenance_tickets` (id, assetId, reporterId fk users, title, description, priority [RENDAH, SEDANG, TINGGI, DARURAT], status [MENUNGGU, PROSES, SELESAI, DITOLAK], cost, completedAt)
- API Fastify v5 & Drizzle ORM:
  - Repository, Service, Controller, Routes, Zod Schemas.
  - Endpoint registrasi inventaris aset, generasi token QR label, peminjaman/pengembalian aset, dan tiket perbaikan/pemeliharaan.
  - Co-located unit test (`facilities.spec.ts`) minimal 3 skenario lulus.
- Frontend React 19 + TanStack Query + Tailwind CSS:
  - Inventaris Aset & Cetak Label QR (modal/preview).
  - Manajemen Peminjaman & Pengembalian Aset.
  - Helpdesk / Tiket Pemeliharaan Sarpras Madrasah.
  - UI konsisten nuansa madrasah (emerald/green), clean, modern.
- Kualitas & Aturan Clean Code:
  - Maksimal 300 LOC per file.
  - No mock data di FE/BE.
  - Jalankan `pnpm -r run typecheck` dan `pnpm -r run test` sebelum lapor selesai.
