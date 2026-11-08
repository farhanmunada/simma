import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { Role } from "@simma/shared";
import { getDb, closeDb } from "../core/database/index.js";
import {
  users,
  institutions,
  academicYears,
  semesters,
  teachers,
  classrooms,
  subjects,
  students,
  parents,
  studentParents,
  classStudents,
  tahfidzRecords,
  tasmiExams,
  attendanceStudents,
  assessments,
  studentGrades,
} from "./schema/index.js";

async function seed() {
  console.log("==> Memulai Seeding Data Riil ke Database PostgreSQL...");

  const db = getDb();
  const defaultPassword = "admin123";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 1. SEED USERS & ROLES
  console.log("1. Seeding Users...");
  const devAccounts: { username: string; role: Role }[] = [
    { username: "superadmin", role: "super_admin" },
    { username: "admin", role: "super_admin" },
    { username: "admin@madrasah.sch.id", role: "super_admin" },
    { username: "kamad", role: "kepala_madrasah" },
    { username: "tu", role: "admin_tu" },
    { username: "guru", role: "guru" },
    { username: "walikelas", role: "wali_kelas" },
    { username: "tahfidz", role: "guru_tahfidz" },
  ];

  const userMap: Record<string, string> = {};

  for (const acc of devAccounts) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, acc.username))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(users)
        .set({
          passwordHash,
          role: acc.role,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(users.username, acc.username));
      userMap[acc.username] = existing[0].id;
    } else {
      const [inserted] = await db
        .insert(users)
        .values({
          username: acc.username,
          passwordHash,
          role: acc.role,
          isActive: true,
        })
        .returning({ id: users.id });
      userMap[acc.username] = inserted.id;
    }
  }

  // 2. SEED INSTITUTION
  console.log("2. Seeding Institution (Madrasah)...");
  const existingInst = await db.select().from(institutions).limit(1);
  let institutionId: string;
  if (existingInst.length === 0) {
    const [inst] = await db
      .insert(institutions)
      .values({
        nsm: "131132040001",
        npsn: "20277001",
        name: "MAN 1 Model Nusantara",
        status: "negeri",
        address: "Jl. Pendidikan Islam No. 45, Jakarta",
        emisData: { akreditasi: "A", kurikulum: "Kurikulum Merdeka Kemenag" },
      })
      .returning({ id: institutions.id });
    institutionId = inst.id;
  } else {
    institutionId = existingInst[0].id;
  }

  // 3. SEED ACADEMIC YEAR & SEMESTER
  console.log("3. Seeding Tahun Ajaran & Semester...");
  const existingAy = await db
    .select()
    .from(academicYears)
    .where(eq(academicYears.name, "2024/2025"))
    .limit(1);

  let academicYearId: string;
  if (existingAy.length === 0) {
    const [ay] = await db
      .insert(academicYears)
      .values({
        name: "2024/2025",
        startDate: "2024-07-15",
        endDate: "2025-06-25",
        isActive: true,
      })
      .returning({ id: academicYears.id });
    academicYearId = ay.id;
  } else {
    academicYearId = existingAy[0].id;
  }

  const existingSem = await db
    .select()
    .from(semesters)
    .where(eq(semesters.academicYearId, academicYearId))
    .limit(1);

  let semesterId: string;
  if (existingSem.length === 0) {
    const [sem] = await db
      .insert(semesters)
      .values({
        academicYearId,
        type: 1, // Ganjil
        isActive: true,
        startDate: "2024-07-15",
        endDate: "2024-12-20",
      })
      .returning({ id: semesters.id });
    semesterId = sem.id;
  } else {
    semesterId = existingSem[0].id;
  }

  // 4. SEED TEACHERS
  console.log("4. Seeding Guru & GTK...");
  const teacherData = [
    {
      nik: "3201011508800001",
      nuptk: "198008152005011001",
      fullName: "Ustadz H. Ahmad Fauzi, M.Pd.",
      employmentType: "PNS",
      certification: "Sertifikasi Guru Qur'an Hadis",
      userId: userMap["guru"],
    },
    {
      nik: "3201012503850002",
      nuptk: "198503252008012002",
      fullName: "Ustadzah Siti Rahmawati, S.Ag.",
      employmentType: "PPPK",
      certification: "Sertifikasi Guru Fiqih",
      userId: userMap["walikelas"],
    },
    {
      nik: "3201011111900003",
      nuptk: "199011112015011003",
      fullName: "Ustadz Muhammad Ridwan, Al-Hafidz",
      employmentType: "GTY",
      certification: "Sanad Tahfidz 30 Juz",
      userId: userMap["tahfidz"],
    },
  ];

  const teacherIds: string[] = [];
  for (const t of teacherData) {
    const existing = await db
      .select({ id: teachers.id })
      .from(teachers)
      .where(eq(teachers.nik, t.nik))
      .limit(1);

    if (existing.length > 0) {
      teacherIds.push(existing[0].id);
    } else {
      const [inserted] = await db
        .insert(teachers)
        .values({
          nik: t.nik,
          nuptk: t.nuptk,
          fullName: t.fullName,
          employmentType: t.employmentType,
          certification: t.certification,
          userId: t.userId,
        })
        .returning({ id: teachers.id });
      teacherIds.push(inserted.id);
    }
  }

  // 5. SEED CLASSROOMS
  console.log("5. Seeding Kelas / Rombel...");
  const classData = [
    { name: "X-A", gradeLevel: 10, homeroomTeacherId: teacherIds[0] },
    { name: "X-B", gradeLevel: 10, homeroomTeacherId: teacherIds[1] },
    { name: "XI-IPA-1", gradeLevel: 11, homeroomTeacherId: teacherIds[2] },
  ];

  const classroomIds: string[] = [];
  for (const c of classData) {
    const existing = await db
      .select({ id: classrooms.id })
      .from(classrooms)
      .where(eq(classrooms.name, c.name))
      .limit(1);

    if (existing.length > 0) {
      classroomIds.push(existing[0].id);
    } else {
      const [inserted] = await db
        .insert(classrooms)
        .values({
          semesterId,
          name: c.name,
          gradeLevel: c.gradeLevel,
          homeroomTeacherId: c.homeroomTeacherId,
          capacity: 36,
        })
        .returning({ id: classrooms.id });
      classroomIds.push(inserted.id);
    }
  }

  // 6. SEED SUBJECTS
  console.log("6. Seeding Mata Pelajaran (Mapel Kemenag)...");
  const subjectList = [
    { code: "QURDIS-10", name: "Al-Qur'an Hadis", group: "A", jpPerWeek: 2, phase: "E" },
    { code: "AKIDAH-10", name: "Akidah Akhlak", group: "A", jpPerWeek: 2, phase: "E" },
    { code: "FIKIH-10", name: "Fikih", group: "A", jpPerWeek: 2, phase: "E" },
    { code: "SKI-10", name: "Sejarah Kebudayaan Islam", group: "A", jpPerWeek: 2, phase: "E" },
    { code: "BARAB-10", name: "Bahasa Arab", group: "A", jpPerWeek: 3, phase: "E" },
    { code: "MTK-10", name: "Matematika", group: "B", jpPerWeek: 4, phase: "E" },
  ];

  const subjectIds: string[] = [];
  for (const s of subjectList) {
    const existing = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.code, s.code))
      .limit(1);

    if (existing.length > 0) {
      subjectIds.push(existing[0].id);
    } else {
      const [inserted] = await db
        .insert(subjects)
        .values({
          code: s.code,
          name: s.name,
          group: s.group,
          jpPerWeek: s.jpPerWeek,
          phase: s.phase,
          isRequired: true,
        })
        .returning({ id: subjects.id });
      subjectIds.push(inserted.id);
    }
  }

  // 7. SEED STUDENTS & PARENTS
  console.log("7. Seeding Siswa & Orang Tua...");
  const studentList = [
    {
      nik: "3201010101070001",
      nisn: "0071234501",
      nis: "202410001",
      fullName: "Muhammad Farhan Al-Ghifari",
      birthPlace: "Jakarta",
      birthDate: "2007-01-01",
      gender: "L",
      motherName: "Hj. Mariam",
    },
    {
      nik: "3201010202070002",
      nisn: "0071234502",
      nis: "202410002",
      fullName: "Aisyah Zahra Khairunnisa",
      birthPlace: "Bandung",
      birthDate: "2007-02-14",
      gender: "P",
      motherName: "Siti Zubaidah",
    },
    {
      nik: "3201010303070003",
      nisn: "0071234503",
      nis: "202410003",
      fullName: "Bilal Ramadhan As-Sayyid",
      birthPlace: "Surabaya",
      birthDate: "2007-09-20",
      gender: "L",
      motherName: "Khadijah",
    },
    {
      nik: "3201010404070004",
      nisn: "0071234504",
      nis: "202410004",
      fullName: "Fatimah Az-Zahra",
      birthPlace: "Yogyakarta",
      birthDate: "2007-05-10",
      gender: "P",
      motherName: "Aminah",
    },
  ];

  const studentIds: string[] = [];
  for (const st of studentList) {
    const existing = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.nik, st.nik))
      .limit(1);

    if (existing.length > 0) {
      studentIds.push(existing[0].id);
    } else {
      const [inserted] = await db
        .insert(students)
        .values({
          nik: st.nik,
          nisn: st.nisn,
          nis: st.nis,
          fullName: st.fullName,
          birthPlace: st.birthPlace,
          birthDate: st.birthDate,
          gender: st.gender,
          motherName: st.motherName,
          status: "aktif",
        })
        .returning({ id: students.id });
      studentIds.push(inserted.id);
    }
  }

  // 8. ENROLL STUDENTS TO CLASS X-A
  console.log("8. Mendaftarkan Siswa ke Kelas X-A...");
  for (let i = 0; i < studentIds.length; i++) {
    const sId = studentIds[i];
    const cId = classroomIds[0];
    const existing = await db
      .select()
      .from(classStudents)
      .where(eq(classStudents.studentId, sId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(classStudents).values({
        classroomId: cId,
        studentId: sId,
        nisInClass: `10-A-${(i + 1).toString().padStart(2, "0")}`,
      });
    }
  }

  // 9. SEED TAHFIDZ & TASMI
  console.log("9. Seeding Catatan Tahfidz & Ujian Tasmi'...");
  const existingTahfidz = await db.select().from(tahfidzRecords).limit(1);
  if (existingTahfidz.length === 0) {
    await db.insert(tahfidzRecords).values([
      {
        studentId: studentIds[0],
        teacherId: teacherIds[2],
        type: "Z",
        juz: 30,
        surah: 78,
        ayahStart: 1,
        ayahEnd: 40,
        tajwidScore: 88,
        makhrojScore: 90,
        fluencyScore: 85,
        status: "lulus",
        notes: "Makharijul huruf sangat baik, pertahankan kelancarannya.",
        date: "2024-09-10",
      },
      {
        studentId: studentIds[1],
        teacherId: teacherIds[2],
        type: "M",
        juz: 30,
        surah: 79,
        ayahStart: 1,
        ayahEnd: 46,
        tajwidScore: 92,
        makhrojScore: 94,
        fluencyScore: 95,
        status: "lulus",
        notes: "Mumtaz, tajwid tartil dan fasih.",
        date: "2024-09-12",
      },
    ]);

    await db.insert(tasmiExams).values([
      {
        studentId: studentIds[0],
        examinerId: teacherIds[2],
        juz: 30,
        tajwidScore: 90,
        makhrojScore: 88,
        fluencyScore: 92,
        finalScore: 90,
        status: "lulus",
        notes: "Ujian Tasmi' 1 Juz Sekali Duduk Lulus dengan predikat Jayyid Jiddan.",
        examDate: "2024-10-01",
      },
    ]);
  }

  // 10. SEED PRESENSI
  console.log("10. Seeding Presensi Siswa...");
  const existingAtt = await db.select().from(attendanceStudents).limit(1);
  if (existingAtt.length === 0) {
    const today = new Date().toISOString().split("T")[0];
    await db.insert(attendanceStudents).values([
      {
        studentId: studentIds[0],
        classroomId: classroomIds[0],
        date: today,
        status: "hadir",
        note: "Hadir tepat waktu",
        teacherId: teacherIds[0],
      },
      {
        studentId: studentIds[1],
        classroomId: classroomIds[0],
        date: today,
        status: "hadir",
        note: "Hadir tepat waktu",
        teacherId: teacherIds[0],
      },
      {
        studentId: studentIds[2],
        classroomId: classroomIds[0],
        date: today,
        status: "sakit",
        note: "Sakit demam, surat izin terlampir",
        teacherId: teacherIds[0],
      },
      {
        studentId: studentIds[3],
        classroomId: classroomIds[0],
        date: today,
        status: "hadir",
        note: "Hadir",
        teacherId: teacherIds[0],
      },
    ]);
  }

  // 11. SEED ASESMEN & NILAI
  console.log("11. Seeding Asesmen & Nilai Raport...");
  const existingAssessment = await db.select().from(assessments).limit(1);
  if (existingAssessment.length === 0) {
    const [asm] = await db
      .insert(assessments)
      .values({
        subjectId: subjectIds[0],
        classroomId: classroomIds[0],
        teacherId: teacherIds[0],
        academicYearId,
        semesterId,
        type: "harian",
        title: "Penilaian Harian 1 - Kandungan Surah Al-Fatihah",
        maxScore: 100,
        weight: 1,
      })
      .returning({ id: assessments.id });

    await db.insert(studentGrades).values([
      { assessmentId: asm.id, studentId: studentIds[0], score: 92, feedback: "Sangat baik memahami tafsir ayat." },
      { assessmentId: asm.id, studentId: studentIds[1], score: 96, feedback: "Luar biasa, analisis hukum tajwid akurat." },
      { assessmentId: asm.id, studentId: studentIds[2], score: 85, feedback: "Baik, tingkatkan hafalan ayat pendukung." },
      { assessmentId: asm.id, studentId: studentIds[3], score: 88, feedback: "Pemahaman materi sangat memuaskan." },
    ]);
  }

  console.log("\n=======================================================");
  console.log("✅ SEEDING BERHASIL! SEMUA DATA TERSIMPAN DI POSTGRESQL");
  console.log("=======================================================");
  console.log("Akun Pengguna yang Tersedia (Password semua akun: admin123):");
  console.log("  1. Username: superadmin              (Role: Super Admin)");
  console.log("  2. Username: admin                   (Role: Super Admin)");
  console.log("  3. Username: admin@madrasah.sch.id   (Role: Super Admin)");
  console.log("  4. Username: kamad                   (Role: Kepala Madrasah)");
  console.log("  5. Username: tu                      (Role: Staf Tata Usaha)");
  console.log("  6. Username: guru                    (Role: Guru Mata Pelajaran)");
  console.log("  7. Username: walikelas               (Role: Wali Kelas)");
  console.log("  8. Username: tahfidz                 (Role: Pembina Tahfidz)");
  console.log("=======================================================\n");

  await closeDb();
}

seed().catch(async (err) => {
  console.error("Seeding failed:", err);
  await closeDb();
  process.exit(1);
});
