Tugas: Implementasi Modul Presensi Harian Siswa dan Guru di Fastify BE dan Shared Types.

Instruksi:
1. Buat Schema Drizzle di 'simma-be/src/db/schema/attendance.ts':
   - attendanceStudents: id (uuid/cuid/serial), studentId (references students.id), classroomId (references classrooms.id), date, status ('hadir', 'izin', 'sakit', 'alpa'), note, teacherId (references teachers.id), createdAt.
   - attendanceTeachers: id, teacherId (references teachers.id), date, status ('hadir', 'izin', 'sakit', 'alpa', 'dinas_luar'), note, createdAt.
2. Buat Zod DTO di 'packages/shared/src/schemas/attendance.schema.ts' dan re-export di shared index.
3. Modul presensi di 'simma-be/src/modules/attendance/':
   - attendance.routes.ts, attendance.controller.ts, attendance.service.ts, attendance.repository.ts, attendance.schema.ts, attendance.types.ts, attendance.spec.ts.
4. Route auth guard dan RBAC:
   - Gunakan authenticate hook.
   - Hak akses role: guru, wali_kelas, admin_tu, super_admin.
5. Co-located unit dan integration tests di attendance.spec.ts.

KONTRAK SELESAI WAJIB:
1. 'pnpm -r run typecheck' dan 'pnpm --filter simma-be test' wajib 100% HIJAU.
2. Commit git atomik: 'git commit -m "feat(attendance): implement attendance module"'.
3. Cetak sinyal di terminal: 'STATUS_WORKER: SELESAI, BRANCH: wave3-attendance'.
Jalankan sekarang sampai selesai.
