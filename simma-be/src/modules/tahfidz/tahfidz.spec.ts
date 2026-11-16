import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";

// Set environment variables before any module loads
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://simma:simma_secret@localhost:5432/simma_test";
process.env.JWT_ACCESS_SECRET = "test-jwt-access-secret-minimum-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-minimum-32-chars-long";
process.env.JWT_ACCESS_EXPIRY = "15m";
process.env.JWT_REFRESH_EXPIRY = "7d";

import { TahfidzService } from "./tahfidz.service.js";
import type { TahfidzRepository } from "./tahfidz.repository.js";
import { NotFoundError } from "../../core/errors/index.js";
import {
  CreateTahfidzRecordSchema,
  CreateTasmiExamSchema,
  TahfidzQuerySchema,
} from "./tahfidz.schema.js";
import { buildApp } from "../../app.js";
import { signAccessToken } from "../../core/auth/jwt.js";
import type { TahfidzRecord, TasmiExam } from "./tahfidz.types.js";

// Mock repository
function createMockTahfidzRepo(): TahfidzRepository {
  return {
    findRecordById: vi.fn(),
    createRecord: vi.fn(),
    updateRecord: vi.fn(),
    deleteRecord: vi.fn(),
    findRecords: vi.fn(),
    findRecordsByStudentId: vi.fn(),
    findTasmiExamById: vi.fn(),
    createTasmiExam: vi.fn(),
    updateTasmiExam: vi.fn(),
    deleteTasmiExam: vi.fn(),
    findTasmiExams: vi.fn(),
    findTasmiExamsByStudentId: vi.fn(),
  } as unknown as TahfidzRepository;
}

const mockDate = "2026-11-08";
const mockTimestamp = new Date("2026-11-08T00:00:00Z");

const sampleTahfidzRecord: TahfidzRecord = {
  id: "00000000-0000-0000-0000-000000000001",
  studentId: "11111111-1111-1111-1111-111111111111",
  teacherId: "22222222-2222-2222-2222-222222222222",
  type: "Z",
  juz: 30,
  surah: 78,
  ayahStart: 1,
  ayahEnd: 10,
  tajwidScore: 85,
  makhrojScore: 90,
  fluencyScore: 88,
  status: "lulus",
  notes: "Bagus dan lancar",
  date: mockDate,
  createdAt: mockTimestamp,
  updatedAt: mockTimestamp,
};

const sampleTasmiExam: TasmiExam = {
  id: "00000000-0000-0000-0000-000000000002",
  studentId: "11111111-1111-1111-1111-111111111111",
  examinerId: "22222222-2222-2222-2222-222222222222",
  juz: 30,
  tajwidScore: 90,
  makhrojScore: 85,
  fluencyScore: 95,
  finalScore: 90,
  status: "lulus",
  notes: "Lulus ujian tasmi' Juz 30",
  examDate: mockDate,
  createdAt: mockTimestamp,
  updatedAt: mockTimestamp,
};

describe("Tahfidz Module", () => {
  describe("Zod Validation Schemas", () => {
    it("validates valid tahfidz record input", () => {
      const valid = {
        studentId: "11111111-1111-1111-1111-111111111111",
        teacherId: "22222222-2222-2222-2222-222222222222",
        type: "Z",
        juz: 30,
        surah: 114,
        ayahStart: 1,
        ayahEnd: 6,
        tajwidScore: 90,
        makhrojScore: 85,
        fluencyScore: 95,
        status: "lulus",
        notes: "Muntaz",
        date: "2026-11-08",
      };

      const parsed = CreateTahfidzRecordSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("rejects when ayahEnd is less than ayahStart", () => {
      const invalid = {
        studentId: "11111111-1111-1111-1111-111111111111",
        type: "Z",
        juz: 1,
        surah: 1,
        ayahStart: 5,
        ayahEnd: 2, // invalid
        tajwidScore: 80,
        makhrojScore: 80,
        fluencyScore: 80,
        status: "lulus",
        date: "2026-11-08",
      };

      const parsed = CreateTahfidzRecordSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.errors[0]?.message).toContain(
          "Ayat akhir harus lebih besar atau sama dengan ayat awal",
        );
      }
    });

    it("rejects invalid juz range (> 30)", () => {
      const invalid = {
        studentId: "11111111-1111-1111-1111-111111111111",
        type: "M",
        juz: 31, // invalid
        surah: 1,
        ayahStart: 1,
        ayahEnd: 5,
        tajwidScore: 80,
        makhrojScore: 80,
        fluencyScore: 80,
        status: "lulus",
        date: "2026-11-08",
      };

      const parsed = CreateTahfidzRecordSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it("rejects invalid score (> 100 or < 0)", () => {
      const invalid = {
        studentId: "11111111-1111-1111-1111-111111111111",
        type: "M",
        juz: 1,
        surah: 1,
        ayahStart: 1,
        ayahEnd: 5,
        tajwidScore: 105, // invalid
        makhrojScore: -5, // invalid
        fluencyScore: 80,
        status: "lulus",
        date: "2026-11-08",
      };

      const parsed = CreateTahfidzRecordSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it("validates valid tasmi exam input", () => {
      const valid = {
        studentId: "11111111-1111-1111-1111-111111111111",
        examinerId: "22222222-2222-2222-2222-222222222222",
        juz: 30,
        tajwidScore: 90,
        makhrojScore: 85,
        fluencyScore: 89,
        finalScore: 88,
        status: "lulus",
        notes: "Ujian lancar",
        examDate: "2026-11-08",
      };

      const parsed = CreateTasmiExamSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("validates query pagination defaults", () => {
      const parsed = TahfidzQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(20);
    });
  });

  describe("TahfidzService - Records", () => {
    let mockRepo: TahfidzRepository;
    let service: TahfidzService;

    beforeEach(() => {
      mockRepo = createMockTahfidzRepo();
      service = new TahfidzService(mockRepo);
    });

    it("creates a tahfidz record and falls back to authTeacherId if teacherId not provided", async () => {
      vi.mocked(mockRepo.createRecord).mockResolvedValue(sampleTahfidzRecord);

      const input = {
        studentId: "11111111-1111-1111-1111-111111111111",
        type: "Z" as const,
        juz: 30,
        surah: 78,
        ayahStart: 1,
        ayahEnd: 10,
        tajwidScore: 85,
        makhrojScore: 90,
        fluencyScore: 88,
        status: "lulus" as const,
        notes: "Bagus dan lancar",
        date: "2026-11-08",
      };

      const result = await service.createRecord(input, "teacher-uuid-fallback");

      expect(mockRepo.createRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          teacherId: "teacher-uuid-fallback",
          surah: 78,
        }),
      );
      expect(result).toEqual(sampleTahfidzRecord);
    });

    it("gets record by ID successfully", async () => {
      vi.mocked(mockRepo.findRecordById).mockResolvedValue(sampleTahfidzRecord);

      const result = await service.getRecordById(sampleTahfidzRecord.id);
      expect(result).toEqual(sampleTahfidzRecord);
    });

    it("throws NotFoundError when record is not found", async () => {
      vi.mocked(mockRepo.findRecordById).mockResolvedValue(null);

      await expect(service.getRecordById("nonexistent")).rejects.toThrow(NotFoundError);
    });

    it("updates record successfully", async () => {
      vi.mocked(mockRepo.findRecordById).mockResolvedValue(sampleTahfidzRecord);
      const updated = { ...sampleTahfidzRecord, tajwidScore: 95 };
      vi.mocked(mockRepo.updateRecord).mockResolvedValue(updated);

      const result = await service.updateRecord(sampleTahfidzRecord.id, {
        tajwidScore: 95,
      });

      expect(mockRepo.updateRecord).toHaveBeenCalledWith(sampleTahfidzRecord.id, {
        tajwidScore: 95,
      });
      expect(result.tajwidScore).toBe(95);
    });

    it("deletes record successfully", async () => {
      vi.mocked(mockRepo.findRecordById).mockResolvedValue(sampleTahfidzRecord);
      vi.mocked(mockRepo.deleteRecord).mockResolvedValue(true);

      await expect(service.deleteRecord(sampleTahfidzRecord.id)).resolves.not.toThrow();
      expect(mockRepo.deleteRecord).toHaveBeenCalledWith(sampleTahfidzRecord.id);
    });

    it("gets paginated records", async () => {
      vi.mocked(mockRepo.findRecords).mockResolvedValue({
        data: [sampleTahfidzRecord],
        total: 1,
      });

      const result = await service.getRecords({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });
  });

  describe("TahfidzService - Student Progress & Heatmap", () => {
    let mockRepo: TahfidzRepository;
    let service: TahfidzService;

    beforeEach(() => {
      mockRepo = createMockTahfidzRepo();
      service = new TahfidzService(mockRepo);
    });

    it("calculates 30 juz heatmap and progress accurately", async () => {
      const studentId = "11111111-1111-1111-1111-111111111111";

      vi.mocked(mockRepo.findRecordsByStudentId).mockResolvedValue([
        sampleTahfidzRecord, // juz 30, type Z, lulus, 10 ayahs
        {
          ...sampleTahfidzRecord,
          id: "00000000-0000-0000-0000-000000000003",
          type: "M",
          juz: 30,
          ayahStart: 11,
          ayahEnd: 20, // 10 ayahs
          date: "2026-11-07",
        },
      ]);

      vi.mocked(mockRepo.findTasmiExamsByStudentId).mockResolvedValue([
        sampleTasmiExam, // juz 30, status lulus
      ]);

      const progress = await service.getStudentProgress(studentId);

      expect(progress.studentId).toBe(studentId);
      expect(progress.juzMap).toHaveLength(30);

      // Juz 30 verification
      const juz30 = progress.juzMap.find((j) => j.juz === 30);
      expect(juz30).toBeDefined();
      expect(juz30?.ziyadahCount).toBe(1);
      expect(juz30?.murajaahCount).toBe(1);
      expect(juz30?.totalPassedAyahs).toBe(20);
      expect(juz30?.tasmiStatus).toBe("lulus");
      expect(juz30?.isCompleted).toBe(true);

      // Other juz should be unstarted
      const juz1 = progress.juzMap.find((j) => j.juz === 1);
      expect(juz1?.ziyadahCount).toBe(0);
      expect(juz1?.isCompleted).toBe(false);
      expect(juz1?.tasmiStatus).toBe("none");

      // Summary verification
      expect(progress.summary.totalZiyadah).toBe(1);
      expect(progress.summary.totalMurajaah).toBe(1);
      expect(progress.summary.totalTasmiPassed).toBe(1);
      expect(progress.summary.completedJuzCount).toBe(1);
      expect(progress.summary.lastMemorized).toEqual({
        juz: 30,
        surah: 78,
        ayahEnd: 10,
        date: mockDate,
      });
    });

    it("gets student history containing both records and tasmi exams", async () => {
      const studentId = "11111111-1111-1111-1111-111111111111";
      vi.mocked(mockRepo.findRecordsByStudentId).mockResolvedValue([sampleTahfidzRecord]);
      vi.mocked(mockRepo.findTasmiExamsByStudentId).mockResolvedValue([sampleTasmiExam]);

      const history = await service.getStudentHistory(studentId);
      expect(history.records).toHaveLength(1);
      expect(history.tasmiExams).toHaveLength(1);
    });
  });

  describe("TahfidzService - Tasmi' Exams", () => {
    let mockRepo: TahfidzRepository;
    let service: TahfidzService;

    beforeEach(() => {
      mockRepo = createMockTahfidzRepo();
      service = new TahfidzService(mockRepo);
    });

    it("calculates final score automatically when omitted", async () => {
      vi.mocked(mockRepo.createTasmiExam).mockImplementation(async (data) => ({
        ...sampleTasmiExam,
        ...data,
        examinerId: data.examinerId ?? null,
        notes: data.notes ?? null,
      }));

      const input = {
        studentId: "11111111-1111-1111-1111-111111111111",
        examinerId: "22222222-2222-2222-2222-222222222222",
        juz: 30,
        tajwidScore: 90,
        makhrojScore: 80,
        fluencyScore: 85,
        // finalScore omitted -> should be round((90+80+85)/3) = 85
        status: "lulus" as const,
        examDate: "2026-11-08",
      };

      const result = await service.createTasmiExam(input);

      expect(mockRepo.createTasmiExam).toHaveBeenCalledWith(
        expect.objectContaining({
          finalScore: 85,
        }),
      );
      expect(result.finalScore).toBe(85);
    });

    it("gets tasmi exam by ID and handles not found", async () => {
      vi.mocked(mockRepo.findTasmiExamById).mockResolvedValue(sampleTasmiExam);
      const found = await service.getTasmiExamById(sampleTasmiExam.id);
      expect(found).toEqual(sampleTasmiExam);

      vi.mocked(mockRepo.findTasmiExamById).mockResolvedValue(null);
      await expect(service.getTasmiExamById("nonexistent")).rejects.toThrow(NotFoundError);
    });

    it("deletes tasmi exam", async () => {
      vi.mocked(mockRepo.findTasmiExamById).mockResolvedValue(sampleTasmiExam);
      vi.mocked(mockRepo.deleteTasmiExam).mockResolvedValue(true);

      await expect(service.deleteTasmiExam(sampleTasmiExam.id)).resolves.not.toThrow();
    });
  });

  describe("API Routes & Auth Guards", () => {
    let app: any;

    beforeAll(async () => {
      app = await buildApp();
      await app.ready();
    }, 30000);

    afterAll(async () => {
      if (app) {
        await app.close();
      }
    });

    it("returns 401 when request is unauthenticated", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/tahfidz",
      });

      expect(res.statusCode).toBe(401);
    });

    it("returns 403 when user lacks required role to record setoran", async () => {
      // Role 'guru_mapel' is not in writeRoles for tahfidz recording
      const token = await signAccessToken({
        sub: "33333333-3333-3333-3333-333333333333",
        username: "guru_biasa",
        role: "guru_mapel",
        teacherId: null,
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/tahfidz",
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          studentId: "11111111-1111-1111-1111-111111111111",
          type: "Z",
          juz: 30,
          surah: 78,
          ayahStart: 1,
          ayahEnd: 5,
          tajwidScore: 90,
          makhrojScore: 85,
          fluencyScore: 88,
          status: "lulus",
          date: "2026-11-08",
        },
      });

      expect(res.statusCode).toBe(403);
    });

    it("allows guru_tahfidz or super_admin to pass guard check", async () => {
      const token = await signAccessToken({
        sub: "44444444-4444-4444-4444-444444444444",
        username: "ustadz_hafizh",
        role: "guru_tahfidz",
        teacherId: null,
      });

      // Sending invalid payload to verify auth passes and reaches validation handler (400, not 401/403)
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/tahfidz",
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {},
      });

      expect(res.statusCode).toBe(400); // Validation error, not Auth 401/403
    });
  });
});
