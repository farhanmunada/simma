import { describe, it, expect, vi, beforeEach } from "vitest";

// Environment variables before any module loads
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://simma:simma123@localhost:5432/simma_test";
process.env.JWT_ACCESS_SECRET = "test-jwt-access-secret-minimum-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-minimum-32-chars-long";
process.env.JWT_ACCESS_EXPIRY = "15m";
process.env.JWT_REFRESH_EXPIRY = "7d";

import { ReportsService } from "./reports.service.js";
import { reportsRepository, type ReportsRepository } from "./reports.repository.js";
import { NotFoundError, ValidationError } from "../../core/errors/index.js";
import {
  StudentSemesterParamSchema,
  ClassroomSemesterParamSchema,
  StudentIdParamSchema,
  LeggerQuerySchema,
  ReportCardQuerySchema,
  ReportNotesBodySchema,
} from "./reports.schema.js";
import { buildApp } from "../../app.js";
import { signAccessToken } from "../../core/auth/jwt.js";
import type {
  Student,
  Semester,
  AcademicYear,
  Classroom,
  Teacher,
  Institution,
  Subject,
  SemesterGrade,
  AttendanceStudent,
  TahfidzRecord,
  TasmiExam,
} from "../../db/schema/index.js";

const studentId = "11111111-1111-1111-1111-111111111111";
const semesterId = "22222222-2222-2222-2222-222222222222";
const academicYearId = "33333333-3333-3333-3333-333333333333";
const classroomId = "44444444-4444-4444-4444-444444444444";
const teacherId = "55555555-5555-5555-5555-555555555555";
const institutionId = "77777777-7777-7777-7777-777777777777";
const subjectId1 = "88888888-8888-8888-8888-888888888881";
const subjectId2 = "88888888-8888-8888-8888-888888888882";

const mockStudent: Student = {
  id: studentId,
  nik: "3201010101010001",
  nisn: "0012345678",
  nis: "2024001",
  fullName: "Ahmad Santoso",
  birthPlace: "Jakarta",
  birthDate: "2008-05-10",
  gender: "L",
  motherName: "Siti Aminah",
  status: "aktif",
  photoPath: null,
  emisData: {},
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSemester: Semester = {
  id: semesterId,
  academicYearId,
  type: 1,
  isActive: true,
  startDate: "2024-07-15",
  endDate: "2024-12-20",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAcademicYear: AcademicYear = {
  id: academicYearId,
  name: "2024/2025",
  startDate: "2024-07-01",
  endDate: "2025-06-30",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockClassroom: Classroom = {
  id: classroomId,
  semesterId,
  name: "X-A",
  gradeLevel: 10,
  homeroomTeacherId: teacherId,
  capacity: 36,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTeacher: Teacher = {
  id: teacherId,
  userId: "66666666-6666-6666-6666-666666666666",
  nik: "3201010202020002",
  nuptk: "1234567890123456",
  fullName: "Ust. Abdullah, M.Pd",
  employmentType: "pns",
  certification: "Sudah Sertifikasi",
  emisData: {},
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockInstitution: Institution = {
  id: institutionId,
  nsm: "131232040001",
  npsn: "69999999",
  name: "MA Al-Hikmah SIMMA",
  status: "swasta",
  address: "Jl. Pesantren No. 99",
  logoPath: null,
  emisData: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSubject1: Subject = {
  id: subjectId1,
  code: "QH-10",
  name: "Al-Qur'an Hadits",
  group: "A",
  jpPerWeek: 2,
  isRequired: true,
  phase: "E",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSubject2: Subject = {
  id: subjectId2,
  code: "MTK-10",
  name: "Matematika",
  group: "B",
  jpPerWeek: 4,
  isRequired: true,
  phase: "E",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockGrade1: SemesterGrade = {
  id: "99999999-9999-9999-9999-999999999991",
  studentId,
  classroomId,
  subjectId: subjectId1,
  semesterId,
  finalScore: 88,
  letterGrade: "A",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockGrade2: SemesterGrade = {
  id: "99999999-9999-9999-9999-999999999992",
  studentId,
  classroomId,
  subjectId: subjectId2,
  semesterId,
  finalScore: 78,
  letterGrade: "B",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAttendance: AttendanceStudent[] = [
  {
    id: "att-1",
    studentId,
    classroomId,
    teacherId,
    date: "2024-08-01",
    status: "hadir",
    note: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "att-2",
    studentId,
    classroomId,
    teacherId,
    date: "2024-08-02",
    status: "sakit",
    note: "Demam",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "att-3",
    studentId,
    classroomId,
    teacherId,
    date: "2024-08-03",
    status: "izin",
    note: "Acara keluarga",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockTahfidzRecords: TahfidzRecord[] = [
  {
    id: "tah-1",
    studentId,
    teacherId,
    type: "Z",
    juz: 30,
    surah: 78,
    ayahStart: 1,
    ayahEnd: 40,
    tajwidScore: 85,
    makhrojScore: 85,
    fluencyScore: 85,
    status: "lulus",
    notes: "Lancar",
    date: "2024-09-01",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockTasmiExams: TasmiExam[] = [
  {
    id: "tasmi-1",
    studentId,
    examinerId: teacherId,
    juz: 30,
    tajwidScore: 90,
    makhrojScore: 88,
    fluencyScore: 89,
    finalScore: 89,
    status: "lulus",
    notes: "Sangat baik",
    examDate: "2024-11-10",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function createMockReportsRepo(): ReportsRepository {
  return {
    findStudentById: vi.fn(),
    findFirstInstitution: vi.fn(),
    findSemesterWithAcademicYear: vi.fn(),
    findStudentClassroom: vi.fn(),
    findStudentSemesterGrades: vi.fn(),
    findStudentAttendance: vi.fn(),
    findStudentTahfidz: vi.fn(),
    getStudentNotes: vi.fn(),
    saveStudentNotes: vi.fn(),
    findClassroomById: vi.fn(),
    findClassroomStudents: vi.fn(),
    findClassroomSemesterGrades: vi.fn(),
    findClassroomAttendance: vi.fn(),
  } as unknown as ReportsRepository;
}

// ====================================================================
// 1. Zod Schemas Validation Tests
// ====================================================================
describe("Reports Zod Schemas", () => {
  it("validates StudentSemesterParamSchema correctly", () => {
    const valid = StudentSemesterParamSchema.safeParse({
      studentId,
      semesterId,
    });
    expect(valid.success).toBe(true);

    const invalid = StudentSemesterParamSchema.safeParse({
      studentId: "invalid-uuid",
      semesterId,
    });
    expect(invalid.success).toBe(false);
  });

  it("validates ClassroomSemesterParamSchema correctly", () => {
    const valid = ClassroomSemesterParamSchema.safeParse({
      classroomId,
      semesterId,
    });
    expect(valid.success).toBe(true);

    const invalid = ClassroomSemesterParamSchema.safeParse({
      classroomId: "not-a-uuid",
      semesterId: "not-a-uuid",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates StudentIdParamSchema correctly", () => {
    const valid = StudentIdParamSchema.safeParse({ studentId });
    expect(valid.success).toBe(true);

    const invalid = StudentIdParamSchema.safeParse({ studentId: "not-uuid" });
    expect(invalid.success).toBe(false);
  });

  it("validates LeggerQuerySchema defaults and options", () => {
    const emptyQuery = LeggerQuerySchema.safeParse({});
    expect(emptyQuery.success).toBe(true);
    if (emptyQuery.success) {
      expect(emptyQuery.data.sortBy).toBe("rank");
      expect(emptyQuery.data.order).toBe("asc");
    }

    const customQuery = LeggerQuerySchema.safeParse({
      sortBy: "totalScore",
      order: "desc",
    });
    expect(customQuery.success).toBe(true);
    if (customQuery.success) {
      expect(customQuery.data.sortBy).toBe("totalScore");
      expect(customQuery.data.order).toBe("desc");
    }
  });

  it("validates ReportCardQuerySchema coercion", () => {
    const defaultQuery = ReportCardQuerySchema.safeParse({});
    expect(defaultQuery.success).toBe(true);
    if (defaultQuery.success) {
      expect(defaultQuery.data.includeTahfidz).toBe(true);
      expect(defaultQuery.data.includeAttendance).toBe(true);
    }

    const coercedFalse = ReportCardQuerySchema.safeParse({
      includeTahfidz: "false",
      includeAttendance: "false",
    });
    expect(coercedFalse.success).toBe(true);
    if (coercedFalse.success) {
      expect(coercedFalse.data.includeTahfidz).toBe(false);
      expect(coercedFalse.data.includeAttendance).toBe(false);
    }
  });

  it("validates ReportNotesBodySchema", () => {
    const validBody = {
      semesterId,
      teacherNotes: "Pertahankan ketekunan belajarnya",
      spiritualAttitude: "Sangat baik",
      socialAttitude: "Aktif dan ramah",
      extracurriculars: [
        { name: "Pramuka", score: "A", description: "Sangat aktif" },
      ],
      achievements: [
        { description: "Juara 1 MTQ Tingkat Kabupaten", type: "Non-Akademik" },
      ],
    };
    const parsed = ReportNotesBodySchema.safeParse(validBody);
    expect(parsed.success).toBe(true);

    const missingNotes = ReportNotesBodySchema.safeParse({
      semesterId,
      teacherNotes: "",
    });
    expect(missingNotes.success).toBe(false);
  });
});

// ====================================================================
// 2. ReportsService Unit Tests
// ====================================================================
describe("ReportsService", () => {
  let mockRepo: ReturnType<typeof createMockReportsRepo>;
  let service: ReportsService;

  beforeEach(() => {
    mockRepo = createMockReportsRepo();
    service = new ReportsService(mockRepo);
  });

  describe("getStudentReportCard", () => {
    it("returns complete student report card with calculations", async () => {
      vi.mocked(mockRepo.findStudentById).mockResolvedValue(mockStudent);
      vi.mocked(mockRepo.findSemesterWithAcademicYear).mockResolvedValue({
        semester: mockSemester,
        academicYear: mockAcademicYear,
      });
      vi.mocked(mockRepo.findStudentClassroom).mockResolvedValue({
        classroom: mockClassroom,
        homeroomTeacher: mockTeacher,
      });
      vi.mocked(mockRepo.findFirstInstitution).mockResolvedValue(mockInstitution);
      vi.mocked(mockRepo.findStudentSemesterGrades).mockResolvedValue([
        { grade: mockGrade1, subject: mockSubject1 },
        { grade: mockGrade2, subject: mockSubject2 },
      ]);
      vi.mocked(mockRepo.findStudentAttendance).mockResolvedValue(mockAttendance);
      vi.mocked(mockRepo.findStudentTahfidz).mockResolvedValue({
        records: mockTahfidzRecords,
        tasmiExams: mockTasmiExams,
      });
      vi.mocked(mockRepo.getStudentNotes).mockResolvedValue(null);
      vi.mocked(mockRepo.findClassroomStudents).mockResolvedValue([mockStudent]);
      vi.mocked(mockRepo.findClassroomSemesterGrades).mockResolvedValue([
        { grade: mockGrade1, subject: mockSubject1 },
        { grade: mockGrade2, subject: mockSubject2 },
      ]);

      const result = await service.getStudentReportCard(studentId, semesterId);

      expect(result.student.fullName).toBe("Ahmad Santoso");
      expect(result.classroom.name).toBe("X-A");
      expect(result.classroom.homeroomTeacher?.fullName).toBe("Ust. Abdullah, M.Pd");
      expect(result.institution.name).toBe("MA Al-Hikmah SIMMA");
      expect(result.grades).toHaveLength(2);
      expect(result.summary.totalScore).toBe(166);
      expect(result.summary.averageScore).toBe(83);
      expect(result.summary.rankInClass).toBe(1);
      expect(result.attendance.hadir).toBe(1);
      expect(result.attendance.sakit).toBe(1);
      expect(result.attendance.izin).toBe(1);
      expect(result.tahfidz.totalJuz).toBe(1);
      expect(result.tahfidz.passedExamsCount).toBe(1);
    });

    it("throws NotFoundError when student not found", async () => {
      vi.mocked(mockRepo.findStudentById).mockResolvedValue(null);

      await expect(
        service.getStudentReportCard(studentId, semesterId),
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError when semester not found", async () => {
      vi.mocked(mockRepo.findStudentById).mockResolvedValue(mockStudent);
      vi.mocked(mockRepo.findSemesterWithAcademicYear).mockResolvedValue(null);

      await expect(
        service.getStudentReportCard(studentId, semesterId),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getClassroomLegger", () => {
    it("returns classroom legger and statistics correctly", async () => {
      const student2: Student = {
        ...mockStudent,
        id: "11111111-1111-1111-1111-111111111112",
        fullName: "Budi Pratama",
        nisn: "0012345679",
        nis: "2024002",
      };

      const gradeStudent2Subject1: SemesterGrade = {
        ...mockGrade1,
        id: "grade-s2-1",
        studentId: student2.id,
        finalScore: 92,
        letterGrade: "A",
      };

      const gradeStudent2Subject2: SemesterGrade = {
        ...mockGrade2,
        id: "grade-s2-2",
        studentId: student2.id,
        finalScore: 94,
        letterGrade: "A",
      };

      vi.mocked(mockRepo.findClassroomById).mockResolvedValue({
        classroom: mockClassroom,
        homeroomTeacher: mockTeacher,
      });
      vi.mocked(mockRepo.findSemesterWithAcademicYear).mockResolvedValue({
        semester: mockSemester,
        academicYear: mockAcademicYear,
      });
      vi.mocked(mockRepo.findClassroomStudents).mockResolvedValue([
        mockStudent,
        student2,
      ]);
      vi.mocked(mockRepo.findClassroomSemesterGrades).mockResolvedValue([
        { grade: mockGrade1, subject: mockSubject1 },
        { grade: mockGrade2, subject: mockSubject2 },
        { grade: gradeStudent2Subject1, subject: mockSubject1 },
        { grade: gradeStudent2Subject2, subject: mockSubject2 },
      ]);
      vi.mocked(mockRepo.findClassroomAttendance).mockResolvedValue([
        ...mockAttendance,
        {
          id: "att-s2",
          studentId: student2.id,
          classroomId,
          teacherId,
          date: "2024-08-01",
          status: "hadir",
          note: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const result = await service.getClassroomLegger(classroomId, semesterId);

      expect(result.classroom.name).toBe("X-A");
      expect(result.subjects).toHaveLength(2);
      expect(result.students).toHaveLength(2);
      expect(result.classStatistics.totalStudents).toBe(2);
      expect(result.classStatistics.highestScore).toBe(186); // student 2
      expect(result.classStatistics.lowestScore).toBe(166); // student 1

      // Verify student 2 has rank 1 and student 1 has rank 2
      const firstStudent = result.students[0];
      const secondStudent = result.students[1];
      expect(firstStudent.studentId).toBe(student2.id);
      expect(firstStudent.rank).toBe(1);
      expect(secondStudent.studentId).toBe(mockStudent.id);
      expect(secondStudent.rank).toBe(2);
    });

    it("throws NotFoundError when classroom not found", async () => {
      vi.mocked(mockRepo.findClassroomById).mockResolvedValue(null);

      await expect(
        service.getClassroomLegger(classroomId, semesterId),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getStudentReportPdf", () => {
    it("generates valid PDF buffer", async () => {
      vi.mocked(mockRepo.findStudentById).mockResolvedValue(mockStudent);
      vi.mocked(mockRepo.findSemesterWithAcademicYear).mockResolvedValue({
        semester: mockSemester,
        academicYear: mockAcademicYear,
      });
      vi.mocked(mockRepo.findStudentClassroom).mockResolvedValue({
        classroom: mockClassroom,
        homeroomTeacher: mockTeacher,
      });
      vi.mocked(mockRepo.findFirstInstitution).mockResolvedValue(mockInstitution);
      vi.mocked(mockRepo.findStudentSemesterGrades).mockResolvedValue([
        { grade: mockGrade1, subject: mockSubject1 },
      ]);
      vi.mocked(mockRepo.findStudentAttendance).mockResolvedValue(mockAttendance);
      vi.mocked(mockRepo.findStudentTahfidz).mockResolvedValue({
        records: mockTahfidzRecords,
        tasmiExams: mockTasmiExams,
      });
      vi.mocked(mockRepo.getStudentNotes).mockResolvedValue(null);
      vi.mocked(mockRepo.findClassroomStudents).mockResolvedValue([mockStudent]);
      vi.mocked(mockRepo.findClassroomSemesterGrades).mockResolvedValue([
        { grade: mockGrade1, subject: mockSubject1 },
      ]);

      const pdfBuffer = await service.getStudentReportPdf(studentId, semesterId);

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      const pdfHeader = pdfBuffer.slice(0, 8).toString("utf-8");
      expect(pdfHeader.startsWith("%PDF-1.4")).toBe(true);
      expect(pdfBuffer.toString("utf-8")).toContain("%%EOF");
    });
  });

  describe("saveStudentNotes", () => {
    it("saves student notes successfully", async () => {
      vi.mocked(mockRepo.findStudentById).mockResolvedValue(mockStudent);
      vi.mocked(mockRepo.findSemesterWithAcademicYear).mockResolvedValue({
        semester: mockSemester,
        academicYear: mockAcademicYear,
      });
      vi.mocked(mockRepo.saveStudentNotes).mockResolvedValue({
        teacherNotes: "Sangat berprestasi",
        spiritualAttitude: "Sangat baik",
        socialAttitude: "Santun",
        extracurriculars: [],
        achievements: [],
        updatedAt: new Date().toISOString(),
      });

      const res = await service.saveStudentNotes(studentId, {
        semesterId,
        teacherNotes: "Sangat berprestasi",
        spiritualAttitude: "Sangat baik",
        socialAttitude: "Santun",
      });

      expect(res.teacherNotes).toBe("Sangat berprestasi");
      expect(mockRepo.saveStudentNotes).toHaveBeenCalledWith(studentId, {
        semesterId,
        teacherNotes: "Sangat berprestasi",
        spiritualAttitude: "Sangat baik",
        socialAttitude: "Santun",
      });
    });
  });
});

// ====================================================================
// 3. Integration Tests & Auth Guards (S3)
// ====================================================================
describe("Reports HTTP Endpoints & Auth Guards", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Authentication Guard (401)", () => {
    it("rejects unauthenticated requests to all reports endpoints with 401", async () => {
      const app = await buildApp();

      const endpoints = [
        {
          method: "GET" as const,
          url: `/api/v1/reports/student/${studentId}/semester/${semesterId}`,
        },
        {
          method: "GET" as const,
          url: `/api/v1/reports/classroom/${classroomId}/semester/${semesterId}/legger`,
        },
        {
          method: "GET" as const,
          url: `/api/v1/reports/student/${studentId}/semester/${semesterId}/pdf`,
        },
        {
          method: "POST" as const,
          url: `/api/v1/reports/student/${studentId}/notes`,
          payload: { semesterId, teacherNotes: "Test" },
        },
      ];

      for (const ep of endpoints) {
        const res = await app.inject({
          method: ep.method,
          url: ep.url,
          payload: ep.payload,
        });
        expect(res.statusCode).toBe(401);
      }

      await app.close();
    }, 30000);
  });

  describe("Role-based Authorization Guard (403)", () => {
    it("rejects unauthorized role (e.g. bendahara) from viewing reports", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "user-bendahara",
        username: "bendahara1",
        role: "bendahara",
      });

      const res = await app.inject({
        method: "GET",
        url: `/api/v1/reports/student/${studentId}/semester/${semesterId}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(res.statusCode).toBe(403);
      await app.close();
    });

    it("rejects teacher role 'guru' from saving student notes (only super_admin and wali_kelas allowed)", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "user-guru",
        username: "guru1",
        role: "guru",
      });

      const res = await app.inject({
        method: "POST",
        url: `/api/v1/reports/student/${studentId}/notes`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          semesterId,
          teacherNotes: "Catatan guru biasa",
        },
      });

      expect(res.statusCode).toBe(403);
      await app.close();
    });
  });

  describe("Validation Errors (400)", () => {
    it("returns 400 when URL params contain invalid UUIDs", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "user-admin",
        username: "admin1",
        role: "super_admin",
      });

      const res = await app.inject({
        method: "GET",
        url: "/api/v1/reports/student/non-uuid-student/semester/non-uuid-sem",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(res.statusCode).toBe(400);
      await app.close();
    });

    it("returns 400 when POST notes body is missing required fields", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "user-wali",
        username: "wali1",
        role: "wali_kelas",
      });

      const res = await app.inject({
        method: "POST",
        url: `/api/v1/reports/student/${studentId}/notes`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          // missing semesterId and teacherNotes
        },
      });

      expect(res.statusCode).toBe(400);
      await app.close();
    });
  });

  describe("Successful Operations (200 / 201)", () => {
    it("GET /api/v1/reports/student/:studentId/semester/:semesterId returns student report card", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "user-admin",
        username: "admin1",
        role: "super_admin",
      });

      vi.spyOn(reportsRepository, "findStudentById").mockResolvedValue(mockStudent);
      vi.spyOn(reportsRepository, "findSemesterWithAcademicYear").mockResolvedValue({
        semester: mockSemester,
        academicYear: mockAcademicYear,
      });
      vi.spyOn(reportsRepository, "findStudentClassroom").mockResolvedValue({
        classroom: mockClassroom,
        homeroomTeacher: mockTeacher,
      });
      vi.spyOn(reportsRepository, "findFirstInstitution").mockResolvedValue(mockInstitution);
      vi.spyOn(reportsRepository, "findStudentSemesterGrades").mockResolvedValue([
        { grade: mockGrade1, subject: mockSubject1 },
      ]);
      vi.spyOn(reportsRepository, "findStudentAttendance").mockResolvedValue(mockAttendance);
      vi.spyOn(reportsRepository, "findStudentTahfidz").mockResolvedValue({
        records: mockTahfidzRecords,
        tasmiExams: mockTasmiExams,
      });
      vi.spyOn(reportsRepository, "getStudentNotes").mockResolvedValue(null);
      vi.spyOn(reportsRepository, "findClassroomStudents").mockResolvedValue([mockStudent]);
      vi.spyOn(reportsRepository, "findClassroomSemesterGrades").mockResolvedValue([
        { grade: mockGrade1, subject: mockSubject1 },
      ]);

      const res = await app.inject({
        method: "GET",
        url: `/api/v1/reports/student/${studentId}/semester/${semesterId}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.student.id).toBe(studentId);
      expect(json.data.grades).toHaveLength(1);
      expect(json.data.summary.totalScore).toBe(88);

      await app.close();
    });

    it("GET /api/v1/reports/classroom/:classroomId/semester/:semesterId/legger returns legger", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "user-wali",
        username: "wali1",
        role: "wali_kelas",
      });

      vi.spyOn(reportsRepository, "findClassroomById").mockResolvedValue({
        classroom: mockClassroom,
        homeroomTeacher: mockTeacher,
      });
      vi.spyOn(reportsRepository, "findSemesterWithAcademicYear").mockResolvedValue({
        semester: mockSemester,
        academicYear: mockAcademicYear,
      });
      vi.spyOn(reportsRepository, "findClassroomStudents").mockResolvedValue([mockStudent]);
      vi.spyOn(reportsRepository, "findClassroomSemesterGrades").mockResolvedValue([
        { grade: mockGrade1, subject: mockSubject1 },
      ]);
      vi.spyOn(reportsRepository, "findClassroomAttendance").mockResolvedValue(mockAttendance);

      const res = await app.inject({
        method: "GET",
        url: `/api/v1/reports/classroom/${classroomId}/semester/${semesterId}/legger`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.classroom.id).toBe(classroomId);
      expect(json.data.students).toHaveLength(1);
      expect(json.data.classStatistics.totalStudents).toBe(1);

      await app.close();
    });

    it("GET /api/v1/reports/student/:studentId/semester/:semesterId/pdf returns binary PDF", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "user-guru",
        username: "guru_mapel1",
        role: "guru_mapel",
      });

      vi.spyOn(reportsRepository, "findStudentById").mockResolvedValue(mockStudent);
      vi.spyOn(reportsRepository, "findSemesterWithAcademicYear").mockResolvedValue({
        semester: mockSemester,
        academicYear: mockAcademicYear,
      });
      vi.spyOn(reportsRepository, "findStudentClassroom").mockResolvedValue({
        classroom: mockClassroom,
        homeroomTeacher: mockTeacher,
      });
      vi.spyOn(reportsRepository, "findFirstInstitution").mockResolvedValue(mockInstitution);
      vi.spyOn(reportsRepository, "findStudentSemesterGrades").mockResolvedValue([
        { grade: mockGrade1, subject: mockSubject1 },
      ]);
      vi.spyOn(reportsRepository, "findStudentAttendance").mockResolvedValue(mockAttendance);
      vi.spyOn(reportsRepository, "findStudentTahfidz").mockResolvedValue({
        records: mockTahfidzRecords,
        tasmiExams: mockTasmiExams,
      });
      vi.spyOn(reportsRepository, "getStudentNotes").mockResolvedValue(null);
      vi.spyOn(reportsRepository, "findClassroomStudents").mockResolvedValue([mockStudent]);
      vi.spyOn(reportsRepository, "findClassroomSemesterGrades").mockResolvedValue([
        { grade: mockGrade1, subject: mockSubject1 },
      ]);

      const res = await app.inject({
        method: "GET",
        url: `/api/v1/reports/student/${studentId}/semester/${semesterId}/pdf`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toBe("application/pdf");
      expect(res.rawPayload.slice(0, 4).toString("utf-8")).toBe("%PDF");

      await app.close();
    });

    it("POST /api/v1/reports/student/:studentId/notes saves homeroom teacher notes with 201", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "user-wali",
        username: "wali1",
        role: "wali_kelas",
      });

      vi.spyOn(reportsRepository, "findStudentById").mockResolvedValue(mockStudent);
      vi.spyOn(reportsRepository, "findSemesterWithAcademicYear").mockResolvedValue({
        semester: mockSemester,
        academicYear: mockAcademicYear,
      });
      vi.spyOn(reportsRepository, "saveStudentNotes").mockResolvedValue({
        teacherNotes: "Pertahankan prestasi belajar dan aktif dalam kegiatan madrasah.",
        spiritualAttitude: "Sangat baik",
        socialAttitude: "Sangat ramah",
        extracurriculars: [{ name: "Pramuka", score: "A", description: "Aktif" }],
        achievements: [],
        updatedAt: new Date().toISOString(),
      });

      const res = await app.inject({
        method: "POST",
        url: `/api/v1/reports/student/${studentId}/notes`,
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          semesterId,
          teacherNotes: "Pertahankan prestasi belajar dan aktif dalam kegiatan madrasah.",
          spiritualAttitude: "Sangat baik",
          socialAttitude: "Sangat ramah",
          extracurriculars: [{ name: "Pramuka", score: "A", description: "Aktif" }],
        },
      });

      expect(res.statusCode).toBe(201);
      const json = JSON.parse(res.payload);
      expect(json.data.teacherNotes).toBe(
        "Pertahankan prestasi belajar dan aktif dalam kegiatan madrasah.",
      );

      await app.close();
    });
  });
});
