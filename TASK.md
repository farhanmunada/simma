# TASK: FE Wave 4 - Rapor & Legger RDM UI (Report Cards & Class Legger)

## 1. Boundary & Scope
- **Worktree:** `C:\Users\vola\orca\workspaces\simma\wave4-fe-reports`
- **Folder Kerja:** `simma-fe/src/features/reports/`
- **File Sentuh Lainnya:** `simma-fe/src/App.tsx` (hubungkan route `reports/*`)
- **DILARANG:** Menyentuh backend `simma-be`, folder `packages/shared`, atau folder fitur lainnya (`auth`, `settings`, `students`, `tahfidz`, `attendance`, `grades`).

## 2. Requirements UI & Fungsional
1. **API Integration via TanStack Query:**
   - Gunakan `apiClient` dari `simma-fe/src/lib/api-client.ts`.
   - Modul API di `simma-fe/src/features/reports/api/reports.api.ts`:
     - GET `/api/v1/reports/student/:studentId/semester/:semesterId` (params: includeTahfidz, includeAttendance)
     - GET `/api/v1/reports/student/:studentId/semester/:semesterId/pdf` (unduh file PDF rapor asli, perhatikan responseType 'blob' untuk download)
     - GET `/api/v1/reports/classroom/:classroomId/semester/:semesterId/legger` (params: sortBy, order)
     - POST `/api/v1/reports/student/:studentId/notes` (body: semesterId, classroomId?, teacherNotes, spiritualAttitude, socialAttitude, extracurriculars: Array<{ name, score, description }>, achievements: Array<{ description, type }>)
2. **Halaman & Komponen yang Harus Dibuat:**
   - `types.ts`: Interface StudentReportCard, ClassroomLegger, StudentReportNotes, LeggerStudentEntry, ExtracurricularItem, AchievementItem, query params.
   - `StudentReportCardPage.tsx`:
     - Filter Siswa & Semester.
     - Kartu Ringkasan Siswa (NISN, Kelas, Wali Kelas, Peringkat Kelas).
     - Tabel Nilai Hasil Belajar (Kelompok Mapel, Nama Mapel, Nilai Akhir, Predikat Huruf, Deskripsi Capaian Kompetensi).
     - Rekap Kehadiran Siswa (Sakit, Izin, Alpa, Persentase).
     - Rekap Tahfidz (Total Juz, Setoran Terakhir, Ujian Lulus).
     - Bagian Ekstrakurikuler, Prestasi, Sikap, dan Catatan Wali Kelas.
     - Tombol "Download PDF Rapor" (panggil endpoint PDF dan simpan ke file lokal).
     - Tombol & Dialog "Edit Catatan Wali Kelas" untuk input catatan, sikap, ekskul, dan prestasi.
   - `ClassroomLeggerPage.tsx`:
     - Filter Kelas & Semester.
     - Kartu Statistik Kelas (Jumlah Siswa, Rata-rata Kelas, Nilai Tertinggi, Nilai Terendah).
     - Tabel Legger RDM Komprehensif: Kolom Nomor, Nama Siswa, NISN, Nilai per Mapel, Total Nilai, Rata-rata, Peringkat, Rekap Kehadiran (H/I/S/A).
   - `ReportsRoutes.tsx`:
     - Sub-router navigasi tab untuk path `reports` (Rapor Siswa) dan `reports/legger` (Buku Legger Kelas).
   - `index.ts`: Public barrel export.
   - `reports.spec.ts`: Unit test untuk fungsi API, query hooks, & helpers.
3. **Route Integration:**
   - Di `simma-fe/src/App.tsx`, ganti route placeholder `reports/*` dengan `<ReportsRoutes />`.

## 3. UI Guidelines
- Clean, padat, tanpa teks petunjuk bertele-tele, tanpa hero banner bertumpuk.
- Gunakan badge status/huruf predikat: A (emerald), B (sky), C (amber), D (rose).
- Format cetak/preview rapi sesuai standar buku rapor madrasah (RDM).
- Gunakan komponen dasar `Button`, `Input`, `Select`, `Badge`, `Card`, `Modal` dari `simma-fe/src/components/ui/`.

## 4. Verifikasi & Penyelesaian
1. Jalankan `pnpm --filter simma-fe run test`
2. Jalankan `pnpm --filter simma-fe run typecheck`
3. Jalankan `pnpm --filter simma-fe run build` (harus sukses 0 error)
4. Commit atomik:
   `git add simma-fe/ && git commit -m "feat(fe-reports): implement student report card preview, pdf download, legger, and homeroom notes UI"`
5. Cetak sinyal selesai:
   `[WORKER STATUS: FINISHED] Module FE-Reports complete. Ready for Gatekeeper audit.`
