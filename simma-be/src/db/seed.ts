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
  positions,
  teacherProfiles,
  teacherEducation,
  teacherRanks,
  teacherWorkloads,
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
  letterClassifications,
  incomingLetters,
  dispositions,
  letterSequences,
  outgoingLetters,
  expeditionBooks,
} from "./schema/index.js";
import crypto from "crypto";

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

  // 4. SEED POSITIONS & TEACHERS
  console.log("4. Seeding Master Jabatan & GTK...");
  const defaultPositionsData = [
    { code: "KAMAD", name: "Kepala Madrasah", category: "Pendidik", isLeadership: true, allowance: 1500000 },
    { code: "WAKA_KUR", name: "Waka Kurikulum", category: "Pendidik", isLeadership: true, allowance: 1000000 },
    { code: "WAKA_SIS", name: "Waka Kesiswaan", category: "Pendidik", isLeadership: true, allowance: 1000000 },
    { code: "WAKA_SAR", name: "Waka Sarana Prasarana", category: "Pendidik", isLeadership: true, allowance: 1000000 },
    { code: "WAKA_HUM", name: "Waka Humas", category: "Pendidik", isLeadership: true, allowance: 1000000 },
    { code: "GURU_MAPEL", name: "Guru Mata Pelajaran", category: "Pendidik", isLeadership: false, allowance: 0 },
    { code: "GURU_BK", name: "Guru Bimbingan Konseling (BK)", category: "Pendidik", isLeadership: false, allowance: 0 },
    { code: "KEPALA_TU", name: "Kepala Tata Usaha", category: "Tenaga Kependidikan", isLeadership: true, allowance: 750000 },
    { code: "STAF_TU", name: "Staf Tata Usaha", category: "Tenaga Kependidikan", isLeadership: false, allowance: 0 },
    { code: "LABORAN", name: "Kepala Laboratorium", category: "Pendidik", isLeadership: false, allowance: 500000 },
    { code: "PUSTAKAWAN", name: "Kepala Perpustakaan", category: "Tenaga Kependidikan", isLeadership: false, allowance: 500000 },
    { code: "BENDAHARA", name: "Bendahara Madrasah", category: "Tenaga Kependidikan", isLeadership: false, allowance: 500000 },
  ];

  const posMap: Record<string, string> = {};
  for (const p of defaultPositionsData) {
    const existing = await db.select({ id: positions.id }).from(positions).where(eq(positions.code, p.code)).limit(1);
    if (existing.length > 0) {
      posMap[p.code] = existing[0].id;
    } else {
      const [inserted] = await db.insert(positions).values(p).returning({ id: positions.id });
      posMap[p.code] = inserted.id;
    }
  }

  const teacherData = [
    {
      nik: "3201011508800001",
      nuptk: "198008152005011001",
      fullName: "Drs. H. Ahmad Fauzi, M.Pd.I",
      employmentType: "PNS",
      certification: "Sertifikasi Guru Qur'an Hadis",
      userId: userMap["guru"],
      positionId: posMap["KAMAD"],
      gtkType: "pendidik",
      gender: "L",
      birthPlace: "Jakarta",
      birthDate: "1980-08-15",
      address: "Jl. Lapangan Banteng Barat No. 34, Jakarta",
      phone: "081234567801",
      email: "ahmad.fauzi@madrasah.sch.id",
      dutyStatus: "aktif",
      rank: "Pembina Tk. I",
      gradeGroup: "IV/b",
      jtm: 24,
    },
    {
      nik: "3201012503850002",
      nuptk: "198503252008012002",
      fullName: "Ustadzah Siti Rahmawati, S.Ag., M.Pd.",
      employmentType: "PPPK",
      certification: "Sertifikasi Guru Fiqih",
      userId: userMap["walikelas"],
      gtkType: "pendidik",
      gender: "P",
      birthPlace: "Bandung",
      birthDate: "1985-03-25",
      address: "Jl. Cihampelas No. 12, Bandung",
      phone: "081234567802",
      email: "siti.rahmawati@madrasah.sch.id",
      dutyStatus: "aktif",
      rank: "Penata Tk. I",
      gradeGroup: "III/d",
      jtm: 26,
    },
    {
      nik: "3201011111900003",
      nuptk: "199011112015011003",
      fullName: "Ustadz Muhammad Ridwan, S.Th.I., Al-Hafidz",
      employmentType: "GTY",
      certification: "Sanad Tahfidz 30 Juz & Asesmen Al-Qur'an",
      userId: userMap["tahfidz"],
      gtkType: "pendidik",
      gender: "L",
      birthPlace: "Surabaya",
      birthDate: "1990-11-11",
      address: "Kompleks Pesantren Nusantara No. 5, Jakarta",
      phone: "081234567803",
      email: "ridwan.tahfidz@madrasah.sch.id",
      dutyStatus: "aktif",
      rank: "Penata Muda Tk. I",
      gradeGroup: "III/b",
      jtm: 28,
    },
    {
      nik: "3201011204820004",
      nuptk: "198204122006041004",
      fullName: "Dr. K.H. Syamsul Arifin, M.A.",
      employmentType: "PNS",
      certification: "Sertifikasi Pendidik Bahasa Arab",
      userId: null,
      gtkType: "pendidik",
      gender: "L",
      birthPlace: "Yogyakarta",
      birthDate: "1982-04-12",
      address: "Jl. Kaliurang Km 7, Yogyakarta",
      phone: "081234567804",
      email: "syamsul.arifin@madrasah.sch.id",
      dutyStatus: "aktif",
      rank: "Pembina Utama Muda",
      gradeGroup: "IV/c",
      jtm: 24,
    },
    {
      nik: "3201011807880005",
      nuptk: "198807182011012005",
      fullName: "Hj. Nurul Hidayati, S.Pd., M.Si.",
      employmentType: "PNS",
      certification: "Sertifikasi Guru Matematika",
      userId: null,
      gtkType: "pendidik",
      gender: "P",
      birthPlace: "Semarang",
      birthDate: "1988-07-18",
      address: "Jl. Pahlawan No. 20, Semarang",
      phone: "081234567805",
      email: "nurul.hidayati@madrasah.sch.id",
      dutyStatus: "aktif",
      rank: "Penata",
      gradeGroup: "III/c",
      jtm: 24,
    },
    {
      nik: "3201012209910006",
      nuptk: "199109222019031006",
      fullName: "Ahmad Zaki Mubarak, S.Kom.",
      employmentType: "GTY",
      certification: "Sertifikasi Guru Informatika & Komputer",
      userId: null,
      gtkType: "pendidik",
      gender: "L",
      birthPlace: "Malang",
      birthDate: "1991-09-22",
      address: "Jl. Soekarno Hatta No. 88, Malang",
      phone: "081234567806",
      email: "zaki.mubarak@madrasah.sch.id",
      dutyStatus: "aktif",
      rank: "Penata Muda",
      gradeGroup: "III/a",
      jtm: 24,
    },
    {
      nik: "3201013005840007",
      nuptk: "198405302009022007",
      fullName: "Dra. Fatimah Zahro, M.Pd.",
      employmentType: "PNS",
      certification: "Sertifikasi Guru Sejarah Kebudayaan Islam",
      userId: null,
      gtkType: "pendidik",
      gender: "P",
      birthPlace: "Solo",
      birthDate: "1984-05-30",
      address: "Jl. Slamet Riyadi No. 40, Surakarta",
      phone: "081234567807",
      email: "fatimah.zahro@madrasah.sch.id",
      dutyStatus: "aktif",
      rank: "Penata Tk. I",
      gradeGroup: "III/d",
      jtm: 24,
    },
    {
      nik: "3201011402890008",
      nuptk: "198902142014021008",
      fullName: "Bambang Triyono, S.Sos.",
      employmentType: "PPPK",
      certification: null,
      userId: userMap["tu"],
      gtkType: "tenaga_kependidikan",
      gender: "L",
      birthPlace: "Bogor",
      birthDate: "1989-02-14",
      address: "Jl. Pajajaran No. 15, Bogor",
      phone: "081234567808",
      email: "bambang.tu@madrasah.sch.id",
      dutyStatus: "aktif",
      rank: "Pengatur Tk. I",
      gradeGroup: "II/d",
      jtm: 0,
    },
    {
      nik: "3201010808930009",
      nuptk: null,
      fullName: "Rudi Hartono, S.AP.",
      employmentType: "GTT",
      certification: null,
      userId: null,
      gtkType: "tenaga_kependidikan",
      gender: "L",
      birthPlace: "Depok",
      birthDate: "1993-08-08",
      address: "Jl. Margonda Raya No. 101, Depok",
      phone: "081234567809",
      email: "rudi.ekspedisi@madrasah.sch.id",
      dutyStatus: "aktif",
      rank: "Pengatur",
      gradeGroup: "II/c",
      jtm: 0,
    },
    {
      nik: "3201011910920010",
      nuptk: "199210192020122010",
      fullName: "Dewi Lestari, S.Pd. (Guru BK)",
      employmentType: "PPPK",
      certification: "Sertifikasi Guru Bimbingan dan Konseling",
      userId: null,
      gtkType: "pendidik",
      gender: "P",
      birthPlace: "Cirebon",
      birthDate: "1992-10-19",
      address: "Jl. Siliwangi No. 12, Cirebon",
      phone: "081234567810",
      email: "dewi.bk@madrasah.sch.id",
      dutyStatus: "aktif",
      rank: "Penata Muda Tk. I",
      gradeGroup: "III/b",
      jtm: 24,
    },
  ];

  const teacherIds: string[] = [];
  for (const t of teacherData) {
    const existing = await db
      .select({ id: teachers.id })
      .from(teachers)
      .where(eq(teachers.nik, t.nik))
      .limit(1);

    let tId: string;
    if (existing.length > 0) {
      tId = existing[0].id;
      await db
        .update(teachers)
        .set({
          nuptk: t.nuptk,
          fullName: t.fullName,
          employmentType: t.employmentType,
          certification: t.certification,
          userId: t.userId,
          positionId: t.positionId ?? null,
        })
        .where(eq(teachers.id, tId));
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
          positionId: t.positionId ?? null,
        })
        .returning({ id: teachers.id });
      tId = inserted.id;
    }
    teacherIds.push(tId);

    // Seed profil detail GTK untuk modul kepegawaian
    const existingProfile = await db
      .select()
      .from(teacherProfiles)
      .where(eq(teacherProfiles.teacherId, tId))
      .limit(1);

    if (existingProfile.length === 0) {
      await db.insert(teacherProfiles).values({
        teacherId: tId,
        nip: t.nuptk || t.nik,
        birthPlace: t.birthPlace,
        birthDate: t.birthDate,
        gender: t.gender,
        religion: "Islam",
        address: t.address,
        phone: t.phone,
        email: t.email,
        dutyStatus: t.dutyStatus,
        gtkType: t.gtkType,
        certificationField: t.certification,
      });

      // Seed riwayat kepangkatan
      await db.insert(teacherRanks).values({
        teacherId: tId,
        rank: t.rank,
        gradeGroup: t.gradeGroup,
        skNumber: `SK/Kemenag/2023/${t.gradeGroup.replace("/", "")}/${t.nik.slice(-4)}`,
        skDate: "2023-01-02",
        tmtRank: "2023-04-01",
        isCurrent: true,
      });

      // Seed beban mengajar (24 JTM Simpatika)
      if (t.gtkType === "pendidik") {
        await db.insert(teacherWorkloads).values({
          teacherId: tId,
          academicYearId,
          semesterId,
          teachingJtm: t.jtm,
          additionalDutyType: "Wali Kelas / Pembina",
          additionalDutyJtm: 4,
          totalJtm: t.jtm + 4,
          isEligibleTpg: t.jtm >= 24,
          simpatikaStatus: "layak",
          notes: "Memenuhi syarat minimal 24 JTM regulasi Simpatika Kemenag.",
        });
      }
    }
  }

  // 5. SEED CLASSROOMS
  console.log("5. Seeding Kelas / Rombel...");
  const classData = [
    { name: "Kelas X", gradeLevel: 10, homeroomTeacherId: teacherIds[0] },
    { name: "Kelas XI", gradeLevel: 11, homeroomTeacherId: teacherIds[1] },
    { name: "Kelas XII", gradeLevel: 12, homeroomTeacherId: teacherIds[2] },
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

  // 6. SEED SUBJECTS (Sesuai KMA 347/2022, KMA 450/2024 & RESEARCH.md)
  console.log("6. Seeding Mata Pelajaran (Mapel Kemenag Kurikulum Merdeka)...");
  const subjectList = [
    // Kelompok A (PAI & Bahasa Arab - Fase E)
    { code: "QURDIS-10", name: "Al-Qur'an Hadis", group: "A", jpPerWeek: 2, phase: "E", isRequired: true },
    { code: "AKIDAH-10", name: "Akidah Akhlak", group: "A", jpPerWeek: 2, phase: "E", isRequired: true },
    { code: "FIKIH-10", name: "Fikih", group: "A", jpPerWeek: 2, phase: "E", isRequired: true },
    { code: "SKI-10", name: "Sejarah Kebudayaan Islam", group: "A", jpPerWeek: 2, phase: "E", isRequired: true },
    { code: "BARAB-10", name: "Bahasa Arab", group: "A", jpPerWeek: 4, phase: "E", isRequired: true },

    // Kelompok A (PAI & Bahasa Arab - Fase F)
    { code: "QURDIS-F", name: "Al-Qur'an Hadis", group: "A", jpPerWeek: 2, phase: "F", isRequired: true },
    { code: "AKIDAH-F", name: "Akidah Akhlak", group: "A", jpPerWeek: 2, phase: "F", isRequired: true },
    { code: "FIKIH-F", name: "Fikih", group: "A", jpPerWeek: 2, phase: "F", isRequired: true },
    { code: "SKI-F", name: "Sejarah Kebudayaan Islam", group: "A", jpPerWeek: 2, phase: "F", isRequired: true },
    { code: "BARAB-F", name: "Bahasa Arab", group: "A", jpPerWeek: 2, phase: "F", isRequired: true },

    // Kelompok B (Umum - Fase E)
    { code: "PPKN-10", name: "Pendidikan Pancasila", group: "B", jpPerWeek: 2, phase: "E", isRequired: true },
    { code: "BIND-10", name: "Bahasa Indonesia", group: "B", jpPerWeek: 4, phase: "E", isRequired: true },
    { code: "MTK-10", name: "Matematika", group: "B", jpPerWeek: 4, phase: "E", isRequired: true },
    { code: "BING-10", name: "Bahasa Inggris", group: "B", jpPerWeek: 2, phase: "E", isRequired: true },
    { code: "PJOK-10", name: "Pendidikan Jasmani, Olahraga, dan Kesehatan", group: "B", jpPerWeek: 3, phase: "E", isRequired: true },
    { code: "SEJ-10", name: "Sejarah", group: "B", jpPerWeek: 2, phase: "E", isRequired: true },
    { code: "SENI-10", name: "Seni dan Budaya", group: "B", jpPerWeek: 2, phase: "E", isRequired: true },
    { code: "INF-10", name: "Informatika", group: "B", jpPerWeek: 2, phase: "E", isRequired: true },

    // Kelompok B (Umum - Fase F)
    { code: "PPKN-F", name: "Pendidikan Pancasila", group: "B", jpPerWeek: 2, phase: "F", isRequired: true },
    { code: "BIND-F", name: "Bahasa Indonesia", group: "B", jpPerWeek: 3, phase: "F", isRequired: true },
    { code: "MTK-F", name: "Matematika", group: "B", jpPerWeek: 3, phase: "F", isRequired: true },
    { code: "BING-F", name: "Bahasa Inggris", group: "B", jpPerWeek: 3, phase: "F", isRequired: true },
    { code: "PJOK-F", name: "Pendidikan Jasmani, Olahraga, dan Kesehatan", group: "B", jpPerWeek: 2, phase: "F", isRequired: true },
    { code: "SEJ-F", name: "Sejarah", group: "B", jpPerWeek: 2, phase: "F", isRequired: true },
    { code: "SENI-F", name: "Seni dan Budaya", group: "B", jpPerWeek: 2, phase: "F", isRequired: true },

    // Kelompok Pilihan / Peminatan Fase F (MIPA)
    { code: "BIO-F", name: "Biologi", group: "Pilihan", jpPerWeek: 5, phase: "F", isRequired: false },
    { code: "KIM-F", name: "Kimia", group: "Pilihan", jpPerWeek: 5, phase: "F", isRequired: false },
    { code: "FIS-F", name: "Fisika", group: "Pilihan", jpPerWeek: 5, phase: "F", isRequired: false },
    { code: "MTKL-F", name: "Matematika Tingkat Lanjut", group: "Pilihan", jpPerWeek: 5, phase: "F", isRequired: false },
    { code: "INFL-F", name: "Informatika Tingkat Lanjut", group: "Pilihan", jpPerWeek: 5, phase: "F", isRequired: false },

    // Kelompok Pilihan / Peminatan Fase F (IPS)
    { code: "SOS-F", name: "Sosiologi", group: "Pilihan", jpPerWeek: 5, phase: "F", isRequired: false },
    { code: "EKO-F", name: "Ekonomi", group: "Pilihan", jpPerWeek: 5, phase: "F", isRequired: false },
    { code: "GEO-F", name: "Geografi", group: "Pilihan", jpPerWeek: 5, phase: "F", isRequired: false },
    { code: "ANTRO-F", name: "Antropologi", group: "Pilihan", jpPerWeek: 5, phase: "F", isRequired: false },

    // Kelompok Pilihan / Peminatan Fase F (Bahasa & Budaya)
    { code: "BARABL-F", name: "Bahasa Arab Tingkat Lanjut", group: "Pilihan", jpPerWeek: 5, phase: "F", isRequired: false },
    { code: "BINGL-F", name: "Bahasa Inggris Tingkat Lanjut", group: "Pilihan", jpPerWeek: 5, phase: "F", isRequired: false },

    // Kelompok Pilihan / Peminatan Fase F (Keagamaan khas MA/MAPK)
    { code: "TAFSIR-F", name: "Ilmu Tafsir", group: "Pilihan", jpPerWeek: 5, phase: "F", isRequired: false },
    { code: "HADIS-F", name: "Ilmu Hadis", group: "Pilihan", jpPerWeek: 5, phase: "F", isRequired: false },
    { code: "USHUL-F", name: "Ushul Fikih", group: "Pilihan", jpPerWeek: 5, phase: "F", isRequired: false },
    { code: "BARABP-F", name: "Bahasa Arab Peminatan", group: "Pilihan", jpPerWeek: 5, phase: "F", isRequired: false },

    // Vokasi & Prakarya
    { code: "PKWU-F", name: "Prakarya dan Kewirausahaan", group: "Pilihan", jpPerWeek: 2, phase: "F", isRequired: false },

    // Muatan Lokal Khas Madrasah
    { code: "TFZ-MULOK", name: "Tahfidz Al-Qur'an (Mulok)", group: "Mulok", jpPerWeek: 2, phase: "E", isRequired: true },
    { code: "TFZ-MULOK-F", name: "Tahfidz Al-Qur'an (Mulok)", group: "Mulok", jpPerWeek: 2, phase: "F", isRequired: true },
    { code: "KIR-MULOK", name: "Karya Ilmiah Remaja / Riset", group: "Mulok", jpPerWeek: 2, phase: "E", isRequired: false },
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

  // 7. SEED STUDENTS & PARENTS (90 SISWA: 30 SISWA PER KELAS TINGKAT X, XI, XII)
  console.log("7. Seeding Siswa & Orang Tua (90 Siswa Lengkap)...");

  const firstNamesL = [
    "Muhammad", "Ahmad", "Ali", "Hasan", "Husain", "Umar", "Utsman", "Bilal", "Zubair", "Thalhah",
    "Sa'ad", "Salman", "Hamzah", "Khalid", "Tariq", "Ziyad", "Fatih", "Rafi", "Rayhan", "Rizky",
    "Faris", "Naufal", "Ihsan", "Arif", "Hafiz", "Ilyas", "Yusuf", "Ibrahim", "Yahya", "Zakaria",
    "Fauzan", "Akmal", "Danial", "Farhan", "Adit", "Bagas", "Dimas", "Gilang", "Ilham", "Lukman"
  ];
  const firstNamesP = [
    "Aisyah", "Fatimah", "Khadijah", "Maryam", "Zainab", "Ruqayyah", "Ummu Kulsum", "Safiyyah", "Hafshah", "Juwayriyah",
    "Zahra", "Nabila", "Salma", "Hana", "Yasmin", "Layla", "Sarah", "Najwa", "Syifa", "Amira",
    "Tasnim", "Salsabila", "Wardah", "Marwah", "Safira", "Kamila", "Inas", "Rania", "Farida", "Azizah",
    "Dina", "Fitri", "Gita", "Intan", "Lestari", "Maya", "Nurul", "Putri", "Rahma", "Suci"
  ];
  const lastNames = [
    "Al-Ghifari", "Pratama", "Ramadhan", "Saputra", "Hidayat", "Nugroho", "Santoso", "Setiawan",
    "Kusuma", "Wijaya", "Firmansyah", "Hakim", "Rabbani", "Syahputra", "Utomo", "Kurniawan",
    "Purnomo", "Wibowo", "Subagyo", "Mubarak", "Maulana", "Irawan", "Gunawan", "Anshori", "Zulkarnain"
  ];
  const birthPlaces = ["Jakarta", "Bandung", "Surabaya", "Semarang", "Yogyakarta", "Solo", "Bogor", "Depok", "Tangerang", "Bekasi", "Malang", "Cirebon"];
  const occupations = ["PNS / ASN", "Wiraswasta", "Karyawan Swasta", "Guru / Dosen", "Pedagang", "Dokter / Nakes", "TNI / Polri", "BUMN"];
  const incomes = ["Rp 3.000.000 - Rp 5.000.000", "Rp 5.000.000 - Rp 10.000.000", "> Rp 10.000.000", "Rp 2.000.000 - Rp 3.000.000"];
  const educations = ["S1", "D3 / D4", "S2", "SMA / MA Sederajat"];

  const studentIds: string[] = [];
  const classStudentEntries: { classroomId: string; studentId: string; nisInClass: string }[] = [];

  // Generate 90 Siswa: 30 Kelas X, 30 Kelas XI, 30 Kelas XII
  const gradesConfig = [
    { grade: 10, classId: classroomIds[0], classPrefix: "10", yearBirth: 2008, nisnPrefix: "008" },
    { grade: 11, classId: classroomIds[1], classPrefix: "11", yearBirth: 2007, nisnPrefix: "007" },
    { grade: 12, classId: classroomIds[2], classPrefix: "12", yearBirth: 2006, nisnPrefix: "006" },
  ];

  let studentGlobalIndex = 1;
  for (const gc of gradesConfig) {
    for (let i = 1; i <= 30; i++) {
      const isMale = (i % 2 === 1);
      const gender = isMale ? "L" : "P";
      const fName = isMale
        ? firstNamesL[(studentGlobalIndex + i) % firstNamesL.length]
        : firstNamesP[(studentGlobalIndex + i) % firstNamesP.length];
      const lName = lastNames[(studentGlobalIndex * 3 + i) % lastNames.length];
      const fullName = `${fName} ${lName}`;
      const birthPlace = birthPlaces[(i + studentGlobalIndex) % birthPlaces.length];
      const birthMonth = ((i % 12) + 1).toString().padStart(2, "0");
      const birthDay = ((i % 28) + 1).toString().padStart(2, "0");
      const birthDate = `${gc.yearBirth}-${birthMonth}-${birthDay}`;

      const nikSuffix = (1000 + studentGlobalIndex).toString();
      const nik = `320101${birthDay}${birthMonth}${gc.yearBirth.toString().slice(-2)}${nikSuffix}`;
      const nisn = `${gc.nisnPrefix}${studentGlobalIndex.toString().padStart(7, "0")}`;
      const nis = `2024${gc.grade}${i.toString().padStart(3, "0")}`;

      const fatherName = `H. ${firstNamesL[(i * 2) % firstNamesL.length]} ${lName}`;
      const motherName = `Hj. ${firstNamesP[(i * 2) % firstNamesP.length]} ${lastNames[(i * 2) % lastNames.length]}`;

      const existing = await db
        .select({ id: students.id })
        .from(students)
        .where(eq(students.nik, nik))
        .limit(1);

      let sId: string;
      if (existing.length > 0) {
        sId = existing[0].id;
        await db
          .update(students)
          .set({
            fullName,
            birthPlace,
            birthDate,
            gender,
            motherName,
            status: "aktif",
          })
          .where(eq(students.id, sId));
      } else {
        const [inserted] = await db
          .insert(students)
          .values({
            nik,
            nisn,
            nis,
            fullName,
            birthPlace,
            birthDate,
            gender,
            motherName,
            status: "aktif",
          })
          .returning({ id: students.id });
        sId = inserted.id;
      }
      studentIds.push(sId);

      // Data Orang Tua (Ayah dan Ibu)
      const existingParents = await db
        .select()
        .from(studentParents)
        .where(eq(studentParents.studentId, sId))
        .limit(1);

      if (existingParents.length === 0) {
        // Ayah
        const [ayah] = await db
          .insert(parents)
          .values({
            nik: `320101010170${(2000 + studentGlobalIndex).toString()}`,
            name: fatherName,
            birthPlace,
            birthDate: "1975-04-12",
            gender: "L",
            education: educations[i % educations.length],
            occupation: occupations[i % occupations.length],
            income: incomes[i % incomes.length],
            phone: `0812${studentGlobalIndex.toString().padStart(8, "0")}`,
            address: `Jl. Madrasah As-Salam No. ${i}, ${birthPlace}`,
          })
          .returning({ id: parents.id });

        await db.insert(studentParents).values({
          studentId: sId,
          parentId: ayah.id,
          relationType: "ayah",
          isGuardian: true,
        });

        // Ibu
        const [ibu] = await db
          .insert(parents)
          .values({
            nik: `320101020275${(3000 + studentGlobalIndex).toString()}`,
            name: motherName,
            birthPlace,
            birthDate: "1978-08-20",
            gender: "P",
            education: educations[(i + 1) % educations.length],
            occupation: occupations[(i + 1) % occupations.length],
            income: incomes[(i + 1) % incomes.length],
            phone: `0813${studentGlobalIndex.toString().padStart(8, "0")}`,
            address: `Jl. Madrasah As-Salam No. ${i}, ${birthPlace}`,
          })
          .returning({ id: parents.id });

        await db.insert(studentParents).values({
          studentId: sId,
          parentId: ibu.id,
          relationType: "ibu",
          isGuardian: false,
        });
      }

      classStudentEntries.push({
        classroomId: gc.classId,
        studentId: sId,
        nisInClass: `${gc.classPrefix}-${i.toString().padStart(2, "0")}`,
      });

      studentGlobalIndex++;
    }
  }

  // 8. ENROLL 90 SISWA KE KELAS (30 per rombel X, XI, XII)
  console.log("8. Mendaftarkan Siswa ke Kelas X, XI, XII (30 siswa per kelas)...");
  for (const entry of classStudentEntries) {
    const existing = await db
      .select()
      .from(classStudents)
      .where(eq(classStudents.studentId, entry.studentId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(classStudents).values(entry);
    } else {
      await db
        .update(classStudents)
        .set({
          classroomId: entry.classroomId,
          nisInClass: entry.nisInClass,
        })
        .where(eq(classStudents.studentId, entry.studentId));
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

  // 12. SEED TATA USAHA & PERSURATAN MADRASAH (KMA 44/2010)
  console.log("12. Seeding Tata Usaha & Persuratan Madrasah...");
  
  // 12.1 Master Klasifikasi Surat
  const defaultClassifications = [
    { code: "PP.00", name: "Kurikulum & Pembelajaran", description: "Pedoman kurikulum, silabus, dan pembelajaran madrasah" },
    { code: "PP.00.6", name: "Kesiswaan & Buku Induk", description: "Administrasi kesiswaan, NISN, mutasi, dan ijazah" },
    { code: "PP.00.8", name: "Ujian & Penilaian", description: "Asesmen madrasah, ujian semester, dan kelulusan" },
    { code: "KP.00", name: "Kepegawaian & GTK", description: "Kenaikan pangkat, penugasan, izin cuti, sertifikasi GTK" },
    { code: "KS.01", name: "Kerjasama Antar Lembaga", description: "MoU dan kemitraan dengan instansi eksternal" },
    { code: "HM.00", name: "Hubungan Masyarakat", description: "Publikasi madrasah, dokumentasi, siaran pers" },
    { code: "OT.00", name: "Organisasi & Tata Kerja", description: "Struktur komite, statuta madrasah, dan tata tertib" },
    { code: "KU.00", name: "Keuangan & BOS/BOP", description: "Pengelolaan anggaran, SPP, dan pelaporan BOS madrasah" },
    { code: "TL.00", name: "Tata Usaha & Perlengkapan", description: "Persuratan dinas, inventaris barang, sarpras" },
    { code: "BA.00", name: "Berita Acara", description: "Berita acara serah terima jabatan, rapat komite, ujian" },
  ];

  const classMap: Record<string, string> = {};
  for (const c of defaultClassifications) {
    const existing = await db
      .select({ id: letterClassifications.id })
      .from(letterClassifications)
      .where(eq(letterClassifications.code, c.code))
      .limit(1);

    if (existing.length > 0) {
      classMap[c.code] = existing[0].id;
    } else {
      const [inserted] = await db
        .insert(letterClassifications)
        .values({ ...c, isActive: true })
        .returning({ id: letterClassifications.id });
      classMap[c.code] = inserted.id;
    }
  }

  // 12.2 Agenda Surat Masuk & Disposisi Kamad
  const existingIncoming = await db.select().from(incomingLetters).limit(1);
  if (existingIncoming.length === 0) {
    const [inc1] = await db
      .insert(incomingLetters)
      .values({
        agendaNumber: 1,
        year: 2026,
        mailNumber: "B-128/Kk.13.04/PP.00/03/2026",
        sender: "Kantor Kementerian Agama Kota",
        mailDate: "2026-03-01",
        receivedDate: "2026-03-02",
        subject: "Edaran Pelaksanaan Asesmen Madrasah Tahun Ajaran 2025/2026",
        summary: "Penyampaian jadwal serentak dan POS Asesmen Madrasah tingkat Aliyah.",
        classificationCode: "PP.00.8",
        classificationId: classMap["PP.00.8"],
        status: "disposed",
      })
      .returning({ id: incomingLetters.id });

    const [inc2] = await db
      .insert(incomingLetters)
      .values({
        agendaNumber: 2,
        year: 2026,
        mailNumber: "421/089/Disdik/2026",
        sender: "Dinas Pendidikan Provinsi",
        mailDate: "2026-03-05",
        receivedDate: "2026-03-06",
        subject: "Undangan Rakor Koordinasi Bantuan Operasional Sekolah",
        summary: "Rapat verifikasi dan sinkronisasi data rekening penyaluran dana BOS Triwulan I.",
        classificationCode: "KU.00",
        classificationId: classMap["KU.00"],
        status: "completed",
      })
      .returning({ id: incomingLetters.id });

    const [inc3] = await db
      .insert(incomingLetters)
      .values({
        agendaNumber: 3,
        year: 2026,
        mailNumber: "105/Puskesmas/III/2026",
        sender: "Puskesmas Kecamatan",
        mailDate: "2026-03-10",
        receivedDate: "2026-03-11",
        subject: "Pemberitahuan Pelaksanaan Skrining Kesehatan dan Imunisasi Remaja",
        summary: "Permohonan jadwal fasilitasi pemeriksaan kesehatan berkala peserta didik kelas X.",
        classificationCode: "PP.00.6",
        classificationId: classMap["PP.00.6"],
        status: "waiting_disposition",
      })
      .returning({ id: incomingLetters.id });

    // Seed Disposisi Kepala Madrasah (user kamad)
    const kamadUserId = userMap["kamad"] || userMap["admin"];
    const tuUserId = userMap["tu"] || userMap["admin"];
    const guruUserId = userMap["guru"] || userMap["admin"];

    if (kamadUserId) {
      await db.insert(dispositions).values([
        {
          incomingLetterId: inc1.id,
          disposedBy: kamadUserId,
          targetUserId: guruUserId,
          targetRole: "Waka Kurikulum / Guru",
          urgency: "segera",
          instruction: "tindak_lanjuti",
          notes: "Segera koordinasikan dengan panitia ujian dan susun jadwal pelaksanaan AM.",
          deadline: "2026-03-15",
          status: "in_progress",
        },
        {
          incomingLetterId: inc2.id,
          disposedBy: kamadUserId,
          targetUserId: tuUserId,
          targetRole: "Staf Tata Usaha / Bendahara",
          urgency: "sangat_segera",
          instruction: "hadiri",
          notes: "Hadiri tepat waktu dengan membawa berkas SPJ dan rekening koran madrasah.",
          deadline: "2026-03-08",
          status: "completed",
          followUpNotes: "Sudah dihadiri oleh Bendahara BOS, berkas verifikasi lengkap dan disetujui.",
          completedAt: new Date("2026-03-08T15:30:00Z"),
        },
      ]);
    }
  }

  // 12.3 Sekuens Surat Keluar & Agenda Surat Keluar
  const existingSeq = await db
    .select()
    .from(letterSequences)
    .where(eq(letterSequences.year, 2026))
    .limit(1);

  if (existingSeq.length === 0) {
    await db.insert(letterSequences).values({
      year: 2026,
      securityDegree: "B",
      lastSequence: 2,
    });
  }

  const existingOutgoing = await db.select().from(outgoingLetters).limit(1);
  if (existingOutgoing.length === 0) {
    const hash1 = crypto.randomBytes(16).toString("hex");
    const hash2 = crypto.randomBytes(16).toString("hex");

    const [out1] = await db
      .insert(outgoingLetters)
      .values({
        letterNumber: "B-001/Ma.13.04/PP.00.6/03/2026",
        securityDegree: "B",
        sequenceNumber: 1,
        year: 2026,
        month: 3,
        satkerCode: "Ma.13.04",
        classificationCode: "PP.00.6",
        classificationId: classMap["PP.00.6"],
        letterDate: "2026-03-05",
        recipient: "Orang Tua / Wali Siswa",
        subject: "Surat Keterangan Aktif Belajar",
        signerName: "Drs. H. Ahmad Fauzi, M.Pd.I",
        signerNip: "197508122002121003",
        signerRole: "Kepala Madrasah",
        templateType: "active_student",
        studentId: studentIds[0],
        contentData: {
          purpose: "Persyaratan pengajuan beasiswa prestasi tingkat provinsi",
          semester: "Genap",
        },
        verificationHash: hash1,
        status: "sent",
      })
      .returning({ id: outgoingLetters.id });

    const [out2] = await db
      .insert(outgoingLetters)
      .values({
        letterNumber: "B-002/Ma.13.04/KP.00/03/2026",
        securityDegree: "B",
        sequenceNumber: 2,
        year: 2026,
        month: 3,
        satkerCode: "Ma.13.04",
        classificationCode: "KP.00",
        classificationId: classMap["KP.00"],
        letterDate: "2026-03-08",
        recipient: "Kepala Balai Diklat Keagamaan",
        subject: "Surat Tugas Mengikuti Bimbingan Teknis Implementasi Kurikulum Kemenag",
        signerName: "Drs. H. Ahmad Fauzi, M.Pd.I",
        signerNip: "197508122002121003",
        signerRole: "Kepala Madrasah",
        templateType: "duty_teacher",
        teacherId: teacherIds[0],
        contentData: {
          destination: "Balai Diklat Keagamaan",
          durationDays: 3,
        },
        verificationHash: hash2,
        status: "signed",
      })
      .returning({ id: outgoingLetters.id });

    // 12.4 Buku Ekspedisi Pengiriman Surat
    await db.insert(expeditionBooks).values({
      outgoingLetterId: out1.id,
      dispatchDate: "2026-03-05",
      courierName: "Rudi Hartono (Staf TU)",
      recipientName: "Bpk. Abdullah (Wali Siswa)",
      recipientProof: "Tanda terima fisik buku ekspedisi lembar ke-12",
      notes: "Diserahkan langsung di loket pelayanan Tata Usaha.",
    });
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
