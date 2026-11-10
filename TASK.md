# TUGAS WORKER M: MODUL 13 — KEPEGAWAIAN MADRASAH & GTK (GURU & TENAGA KEPENDIDIKAN)

**Run ID:** `run_f46b9854b8ec`
**Branch:** `farhanmunada/feat-teachers`
**Worktree:** `C:/Users/vola/orca/workspaces/simma/feat-teachers`
**Referensi Spesifikasi:** `docs/modules/13-kepegawaian-gtk/PRD.md` dan `AGENTS.md`

---

## 1. Lingkup Modul & Batasan Berkas
Hanya bekerja di dalam boundary modul Kepegawaian GTK:
- Backend: `simma-be/src/modules/teachers/`
  * `teachers.routes.ts`
  * `teachers.controller.ts`
  * `teachers.service.ts`
  * `teachers.repository.ts`
  * `teachers.schema.ts`
  * `teachers.types.ts`
  * `teachers.spec.ts` (unit/integration test Fastify)
- Database Schema: `simma-be/src/db/schema/teachers.ts`
  * Relasi ke `teachers` di `setup.ts` atau perluasan tabel profil GTK (`teacherProfiles`, `teacherEducation`, `teacherRanks`, `teacherDocuments`, `teacherWorkloads`)
  * Daftarkan tabel di `simma-be/src/db/schema/index.ts`
- Shared Schemas & Constants:
  * `packages/shared/src/teachers.schema.ts`
  * Daftarkan di `packages/shared/src/index.ts` dan `packages/shared/src/constants.ts` (jika ada enum baru seperti status kepegawaian, sertifikasi, dll)
- Frontend: `simma-fe/src/features/teachers/`
  * Halaman Direktori GTK & Profil Detail Pendidik/Tenaga Kependidikan
  * Formulir Pendataan & Pemutakhiran Berkas Kepegawaian (Ijazah, SK, Sertifikasi)
  * Pemantauan Beban Kerja 24 JTM & Kelayakan TPG (Simpatika/SIAGA)
  * Riwayat Kepangkatan, Golongan & Kenaikan Gaji Berkala (KGB)
  * Daftarkan endpoint di `simma-fe/src/config/endpoints.ts` (TEACHERS)
  * Daftarkan rute di `simma-fe/src/App.tsx`
  * `teachers.spec.ts` (unit test frontend)

---

## 2. Fitur Inti yang Wajib Diimplementasikan
1. **Master Biodata & Identitas GTK (F-GTK-01):** NIK, NIP, NUPTK, PegID Simpatika, status kepegawaian (PNS, PPPK, GTY, GTT, PTT).
2. **Brankas Digital Berkas Kepegawaian (F-GTK-02):** Pengelolaan dokumen SK Tugas, Ijazah, Sertifikat Pendidik, PAK, file aman dengan metadata valid.
3. **Riwayat Kepangkatan & Kenaikan Gaji Berkala (F-GTK-03):** Pencatatan riwayat SK golongan/pangkat dan estimasi jadwal KGB / kenaikan pangkat berikutnya.
4. **Monitoring Beban Kerja 24 JTM & Linearitas (F-GTK-04):** Penghitungan total Jam Tatap Muka (JTM) tatap muka + tugas tambahan (Waka, Kepala Lab, Pembina, Wali Kelas) untuk syarat kelayakan SKAKPT Simpatika.
5. **Ekspor & Sinkronisasi Format EMIS/Simpatika (F-GTK-05):** Rekap data GTK terstandarisasi Kemenag.

---

## 3. Aturan Wajib Clean Code & Monorepo
1. **LOC Limit <300 Baris:** Komponen UI, service, atau repository DILARANG melebihi 300 LOC. Pecah tabel, tab profil, dokumen list, dan modal ke sub-komponen terisolasi dalam `components/`.
2. **Single Source of Truth:** Validasi Zod DTO didefinisikan di `packages/shared/`.
3. **Database Transaction:** Operasi multi-tabel (misal update profil guru dan riwayat kepangkatan) WAJIB menggunakan `await db.transaction(async (tx) => ...)`.
4. **AppError Hierarchy:** Lempar `NotFoundError`, `BadRequestError`, `ForbiddenError` terstruktur.

---

## 4. Kontrak Penyelesaian (Wajib Dijalankan Sebelum Klaim Selesai)
1. Jalankan `pnpm -r run typecheck` (harus 0 error).
2. Jalankan `pnpm -r run test` (seluruh pengujian modul teachers lulus 100%).
3. Jalankan `pnpm --filter simma-fe run build` (harus lulus tanpa error build Vite).
4. Pastikan tidak ada file >300 baris kode (`wc -l` pada semua file baru).
5. Hapus file `TASK.md` ini sebelum commit.
6. Buat commit git atomik di branch `farhanmunada/feat-teachers`:
   `git add . && git commit -m "feat(teachers): implement kepegawaian GTK, 24 JTM workload, and Simpatika compliance module"`
7. Update status worktree ke Orca:
   `orca worktree set --worktree active --comment "PR_READY: farhanmunada/feat-teachers" --json`
8. Kirim notifikasi penyelesaian ke Leader via Orca message bus:
   `orca orchestration send --run run_f46b9854b8ec --type worker_done --outcome succeeded --subject "Tugas Selesai: Modul 13 Kepegawaian GTK" --body "Branch farhanmunada/feat-teachers selesai dan siap dimerge ke main." --json`
   (Jika ada pertanyaan atau kendala, kirim via: `orca orchestration send --run run_f46b9854b8ec --type question` atau `escalation`)
