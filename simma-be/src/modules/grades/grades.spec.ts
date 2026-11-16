import { describe, it, expect, vi, beforeEach } from "vitest";

// Set environment variables before any module loads
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://simma:***@localhost:5432/simma_test";
process.env.JWT_ACCESS_SECRET = "test-jwt-access-secret-minimum-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-minimum-32-chars-long";
process.env.JWT_ACCESS_EXPIRY = "15m";
process.env.JWT_REFRESH_EXPIRY = "7d";

import { GradesService } from "./grades.service.js";
import type { GradesRepository } from "./grades.repository.js";
import { gradesRepository } from "./grades.repository.js";
import { NotFoundError, ValidationError } from "../../core/errors/index.js";
import {
  CreateAssessmentSchema,
  CreateStudentGradeSchema,
  BatchUpsertGradesSchema,
  CreateSemesterGradeSchema,
  calculateLetterGrade,
} from "@simma/shared";
import { buildApp } from "../../app.js";
import { signAccessToken } from "../../core/auth/jwt.js";
import type {
  Assessment,
  StudentGrade,
  SemesterGrade,
} from "./grades.types.js";

// Mock repository helper
function createMockGradesRepo(): GradesRepository {
  return {
    findAssessmentById: vi.fn(),
    createAssessment: vi.fn(),
    updateAssessment: vi.fn(),
    deleteAssessment: vi.fn(),
    hasGradesForAssessment: vi.fn(),
    findAssessments: vi.fn(),
    findStudentGradeById: vi.fn(),
    findStudentGradeByAssessmentAndStudent: vi.fn(),
    createStudentGrade: vi.fn(),
    upsertStudentGrade: vi.fn(),
    batchUpsertStudentGrades: vi.fn(),
    updateStudentGrade: vi.fn(),
    deleteStudentGrade: vi.fn(),
    findStudentGrades: vi.fn(),
    findStudentGradesByAssessmentId: vi.fn(),
    findSemesterGradeById: vi.fn(),
    createSemesterGrade: vi.fn(),
    upsertSemesterGrade: vi.fn(),
    updateSemesterGrade: vi.fn(),
    deleteSemesterGrade: vi.fn(),
    findSemesterGrades: vi.fn(),
    findAssessmentScoresForClassroomSubject: vi.fn(),
  } as unknown as GradesRepository;
}

const mockTimestamp = new Date("2026-11-08T00:00:00Z");

const sampleAssessment: Assessment = {
  id: "00000000-0000-0000-0000-000000000001",
  subjectId: "11111111-1111-1111-1111-111111111111",
  classroomId: "22222222-2222-2222-2222-222222222222",
  teacherId: "33333333-3333-3333-3333-333333333333",
  academicYearId: "44444444-4444-4444-4444-444444444444",
  semesterId: "55555555-5555-5555-5555-555555555555",
  type: "harian",
  title: "Penilaian Harian Bab 1",
  maxScore: 100,
  weight: 1,
  createdAt: mockTimestamp,
  updatedAt: mockTimestamp,
};

const sampleStudentGrade: StudentGrade = {
  id: "00000000-0000-0000-0000-000000000010",
  assessmentId: sampleAssessment.id,
  studentId: "99999999-9999-9999-9999-999999999999",
  score: 88.5,
  feedback: "Sangat baik",
  createdAt: mockTimestamp,
  updatedAt: mockTimestamp,
};

const sampleSemesterGrade: SemesterGrade = {
  id: "00000000-0000-0000-0000-000000000020",
  studentId: "99999999-9999-9999-9999-999999999999",
  classroomId: sampleAssessment.classroomId,
  subjectId: sampleAssessment.subjectId,
  semesterId: sampleAssessment.semesterId,
  finalScore: 88.5,
  letterGrade: "A",
  createdAt: mockTimestamp,
  updatedAt: mockTimestamp,
};

describe("Grades Module", () => {
  describe("Zod Validation Schemas", () => {
    it("validates valid assessment input", () => {
      const valid = {
        subjectId: "11111111-1111-1111-1111-111111111111",
        classroomId: "22222222-2222-2222-2222-222222222222",
        teacherId: "33333333-3333-3333-3333-333333333333",
        academicYearId: "44444444-4444-4444-4444-444444444444",
        semesterId: "55555555-5555-5555-5555-555555555555",
        type: "uts",
        title: "UTS Ganjil",
        maxScore: 100,
        weight: 2,
      };

      const parsed = CreateAssessmentSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("rejects invalid assessment type", () => {
      const invalid = {
        subjectId: "11111111-1111-1111-1111-111111111111",
        classroomId: "22222222-2222-2222-2222-222222222222",
        teacherId: "33333333-3333-3333-3333-333333333333",
        academicYearId: "44444444-4444-4444-4444-444444444444",
        semesterId: "55555555-5555-5555-5555-555555555555",
        type: "ujian_akhir", // invalid
        title: "UTS Ganjil",
      };

      const parsed = CreateAssessmentSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it("validates valid student grade input", () => {
      const valid = {
        assessmentId: "00000000-0000-0000-0000-000000000001",
        studentId: "99999999-9999-9999-9999-999999999999",
        score: 95,
        feedback: "Luar biasa",
      };

      const parsed = CreateStudentGradeSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("rejects score out of range (< 0 or > 100)", () => {
      const negative = {
        assessmentId: "00000000-0000-0000-0000-000000000001",
        studentId: "99999999-9999-9999-9999-999999999999",
        score: -5,
      };
      expect(CreateStudentGradeSchema.safeParse(negative).success).toBe(false);

      const excess = {
        assessmentId: "00000000-0000-0000-0000-000000000001",
        studentId: "99999999-9999-9999-9999-999999999999",
        score: 105,
      };
      expect(CreateStudentGradeSchema.safeParse(excess).success).toBe(false);
    });

    it("validates batch upsert grades schema", () => {
      const validBatch = {
        assessmentId: "00000000-0000-0000-0000-000000000001",
        grades: [
          {
            studentId: "99999999-9999-9999-9999-999999999991",
            score: 80,
          },
          {
            studentId: "99999999-9999-9999-9999-999999999992",
            score: 90,
            feedback: "Bagus",
          },
        ],
      };

      const parsed = BatchUpsertGradesSchema.safeParse(validBatch);
      expect(parsed.success).toBe(true);
    });

    it("calculates letter grades correctly", () => {
      expect(calculateLetterGrade(92)).toBe("A");
      expect(calculateLetterGrade(85)).toBe("A");
      expect(calculateLetterGrade(80)).toBe("B");
      expect(calculateLetterGrade(75)).toBe("B");
      expect(calculateLetterGrade(70)).toBe("C");
      expect(calculateLetterGrade(60)).toBe("C");
      expect(calculateLetterGrade(59)).toBe("D");
      expect(calculateLetterGrade(0)).toBe("D");
    });
  });

  describe("GradesService (Unit Tests)", () => {
    let mockRepo: GradesRepository;
    let service: GradesService;

    beforeEach(() => {
      mockRepo = createMockGradesRepo();
      service = new GradesService(mockRepo);
    });

    // --- Assessments ---
    it("creates an assessment successfully", async () => {
      vi.mocked(mockRepo.createAssessment).mockResolvedValue(sampleAssessment);

      const result = await service.createAssessment({
        subjectId: sampleAssessment.subjectId,
        classroomId: sampleAssessment.classroomId,
        teacherId: sampleAssessment.teacherId!,
        academicYearId: sampleAssessment.academicYearId,
        semesterId: sampleAssessment.semesterId,
        type: "harian",
        title: sampleAssessment.title,
        maxScore: 100,
        weight: 1,
      });

      expect(mockRepo.createAssessment).toHaveBeenCalled();
      expect(result.id).toBe(sampleAssessment.id);
    });

    it("gets assessment by id successfully", async () => {
      vi.mocked(mockRepo.findAssessmentById).mockResolvedValue(sampleAssessment);

      const result = await service.getAssessmentById(sampleAssessment.id);
      expect(result.id).toBe(sampleAssessment.id);
    });

    it("throws NotFoundError when assessment not found", async () => {
      vi.mocked(mockRepo.findAssessmentById).mockResolvedValue(null);

      await expect(
        service.getAssessmentById("00000000-0000-0000-0000-000000000999"),
      ).rejects.toThrow(NotFoundError);
    });

    it("updates assessment successfully", async () => {
      vi.mocked(mockRepo.findAssessmentById).mockResolvedValue(sampleAssessment);
      vi.mocked(mockRepo.updateAssessment).mockResolvedValue({
        ...sampleAssessment,
        title: "Updated Title",
      });

      const updated = await service.updateAssessment(sampleAssessment.id, {
        title: "Updated Title",
      });

      expect(updated.title).toBe("Updated Title");
    });

    it("deletes assessment when no grades exist", async () => {
      vi.mocked(mockRepo.findAssessmentById).mockResolvedValue(sampleAssessment);
      vi.mocked(mockRepo.hasGradesForAssessment).mockResolvedValue(false);
      vi.mocked(mockRepo.deleteAssessment).mockResolvedValue(true);

      await expect(
        service.deleteAssessment(sampleAssessment.id),
      ).resolves.not.toThrow();
    });

    it("throws ValidationError when deleting assessment with existing grades", async () => {
      vi.mocked(mockRepo.findAssessmentById).mockResolvedValue(sampleAssessment);
      vi.mocked(mockRepo.hasGradesForAssessment).mockResolvedValue(true);

      await expect(
        service.deleteAssessment(sampleAssessment.id),
      ).rejects.toThrow(ValidationError);
    });

    it("gets paginated assessments", async () => {
      vi.mocked(mockRepo.findAssessments).mockResolvedValue({
        data: [sampleAssessment],
        total: 1,
      });

      const res = await service.getAssessments({ page: 1, limit: 10 });
      expect(res.data).toHaveLength(1);
      expect(res.meta.total).toBe(1);
    });

    // --- Student Grades ---
    it("creates student grade successfully", async () => {
      vi.mocked(mockRepo.findAssessmentById).mockResolvedValue(sampleAssessment);
      vi.mocked(mockRepo.upsertStudentGrade).mockResolvedValue(sampleStudentGrade);

      const res = await service.createStudentGrade({
        assessmentId: sampleAssessment.id,
        studentId: sampleStudentGrade.studentId,
        score: sampleStudentGrade.score,
        feedback: sampleStudentGrade.feedback,
      });

      expect(res.id).toBe(sampleStudentGrade.id);
    });

    it("performs batch upsert student grades", async () => {
      vi.mocked(mockRepo.findAssessmentById).mockResolvedValue(sampleAssessment);
      vi.mocked(mockRepo.batchUpsertStudentGrades).mockResolvedValue([
        sampleStudentGrade,
      ]);

      const res = await service.batchUpsertGrades({
        assessmentId: sampleAssessment.id,
        grades: [
          {
            studentId: sampleStudentGrade.studentId,
            score: 88.5,
          },
        ],
      });

      expect(res).toHaveLength(1);
    });

    it("updates student grade successfully", async () => {
      vi.mocked(mockRepo.findStudentGradeById).mockResolvedValue(sampleStudentGrade);
      vi.mocked(mockRepo.updateStudentGrade).mockResolvedValue({
        ...sampleStudentGrade,
        score: 95,
      });

      const res = await service.updateStudentGrade(sampleStudentGrade.id, {
        score: 95,
      });

      expect(res.score).toBe(95);
    });

    it("deletes student grade successfully", async () => {
      vi.mocked(mockRepo.findStudentGradeById).mockResolvedValue(sampleStudentGrade);
      vi.mocked(mockRepo.deleteStudentGrade).mockResolvedValue(true);

      await expect(
        service.deleteStudentGrade(sampleStudentGrade.id),
      ).resolves.not.toThrow();
    });

    // --- Semester Grades ---
    it("creates or upserts semester grade and calculates letterGrade", async () => {
      vi.mocked(mockRepo.upsertSemesterGrade).mockResolvedValue(sampleSemesterGrade);

      const res = await service.createOrUpsertSemesterGrade({
        studentId: sampleSemesterGrade.studentId,
        classroomId: sampleSemesterGrade.classroomId,
        subjectId: sampleSemesterGrade.subjectId,
        semesterId: sampleSemesterGrade.semesterId,
        finalScore: 88.5,
      });

      expect(mockRepo.upsertSemesterGrade).toHaveBeenCalledWith(
        expect.objectContaining({
          letterGrade: "A",
        }),
      );
      expect(res.id).toBe(sampleSemesterGrade.id);
    });

    it("calculates semester grades automatically from assessment scores", async () => {
      vi.mocked(
        mockRepo.findAssessmentScoresForClassroomSubject,
      ).mockResolvedValue([
        {
          studentId: "student-1",
          score: 80,
          maxScore: 100,
          weight: 1, // weight 1 => 80
        },
        {
          studentId: "student-1",
          score: 90,
          maxScore: 100,
          weight: 3, // weight 3 => 270. Total: 350 / 4 = 87.5 => letter 'A'
        },
      ]);

      vi.mocked(mockRepo.upsertSemesterGrade).mockImplementation(
        async (data) =>
          ({
            id: "sem-grade-1",
            createdAt: mockTimestamp,
            updatedAt: mockTimestamp,
            ...data,
          }) as SemesterGrade,
      );

      const res = await service.calculateSemesterGrades({
        classroomId: sampleAssessment.classroomId,
        subjectId: sampleAssessment.subjectId,
        semesterId: sampleAssessment.semesterId,
      });

      expect(res.calculatedCount).toBe(1);
      expect(res.grades[0]?.finalScore).toBe(87.5);
      expect(res.grades[0]?.letterGrade).toBe("A");
    });
  });

  describe("API Routes & Auth Guards", () => {
    it("returns 401 when request is unauthenticated", async () => {
      const app = await buildApp();
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/grades/assessments",
      });

      expect(res.statusCode).toBe(401);
      await app.close();
    });

    it("returns 403 when user role is unauthorized for write", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "user-unauthorized",
        username: "pembina",
        role: "pembina_ekskul",
        teacherId: null,
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/grades/assessments",
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          title: "UTS",
        },
      });

      expect(res.statusCode).toBe(403);
      await app.close();
    });

    it("allows guru role to pass RBAC guard check (returns 400 on invalid payload)", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "user-guru",
        username: "guru_user",
        role: "guru",
        teacherId: "33333333-3333-3333-3333-333333333333",
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/grades/assessments",
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {}, // triggers validation 400
      });

      expect(res.statusCode).toBe(400);
      await app.close();
    });

    it("allows wali_kelas role to pass RBAC guard check", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "user-wali",
        username: "wali_user",
        role: "wali_kelas",
        teacherId: "33333333-3333-3333-3333-333333333333",
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/grades/assessments",
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {},
      });

      expect(res.statusCode).toBe(400);
      await app.close();
    });

    it("allows super_admin role to access endpoints", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "user-admin",
        username: "admin_user",
        role: "super_admin",
        teacherId: null,
      });

      vi.spyOn(gradesRepository, "findAssessments").mockResolvedValue({
        data: [sampleAssessment],
        total: 1,
      });

      const res = await app.inject({
        method: "GET",
        url: "/api/v1/grades/assessments",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data).toHaveLength(1);

      await app.close();
    });

    it("POST /api/v1/grades/assessments creates assessment with valid payload", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "user-guru",
        username: "guru_user",
        role: "guru",
        teacherId: sampleAssessment.teacherId,
      });

      vi.spyOn(gradesRepository, "createAssessment").mockResolvedValue(
        sampleAssessment,
      );

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/grades/assessments",
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          subjectId: sampleAssessment.subjectId,
          classroomId: sampleAssessment.classroomId,
          teacherId: sampleAssessment.teacherId,
          academicYearId: sampleAssessment.academicYearId,
          semesterId: sampleAssessment.semesterId,
          type: "harian",
          title: "Penilaian Harian Bab 1",
          maxScore: 100,
          weight: 1,
        },
      });

      expect(res.statusCode).toBe(201);
      const json = JSON.parse(res.payload);
      expect(json.data.id).toBe(sampleAssessment.id);

      await app.close();
    });

    it("PATCH /api/v1/grades/batch upserts batch grades", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "user-guru",
        username: "guru_user",
        role: "guru",
        teacherId: sampleAssessment.teacherId,
      });

      vi.spyOn(gradesRepository, "findAssessmentById").mockResolvedValue(
        sampleAssessment,
      );
      vi.spyOn(gradesRepository, "batchUpsertStudentGrades").mockResolvedValue([
        sampleStudentGrade,
      ]);

      const res = await app.inject({
        method: "PATCH",
        url: "/api/v1/grades/batch",
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          assessmentId: sampleAssessment.id,
          grades: [
            {
              studentId: sampleStudentGrade.studentId,
              score: 88.5,
              feedback: "Sangat baik",
            },
          ],
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data).toHaveLength(1);

      await app.close();
    });

    it("POST /api/v1/grades/semester/calculate calculates semester grades", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "user-guru",
        username: "guru_user",
        role: "wali_kelas",
        teacherId: sampleAssessment.teacherId,
      });

      vi.spyOn(
        gradesRepository,
        "findAssessmentScoresForClassroomSubject",
      ).mockResolvedValue([
        {
          studentId: sampleSemesterGrade.studentId,
          score: 88.5,
          maxScore: 100,
          weight: 1,
        },
      ]);
      vi.spyOn(gradesRepository, "upsertSemesterGrade").mockResolvedValue(
        sampleSemesterGrade,
      );

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/grades/semester/calculate",
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          classroomId: sampleAssessment.classroomId,
          subjectId: sampleAssessment.subjectId,
          semesterId: sampleAssessment.semesterId,
        },
      });

      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.payload);
      expect(json.data.calculatedCount).toBe(1);

      await app.close();
    });
  });
});
