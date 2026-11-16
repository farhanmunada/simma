import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://simma:***@localhost:5432/simma_test";
process.env.JWT_ACCESS_SECRET = "test-jwt-access-secret-minimum-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-minimum-32-chars-long";
process.env.JWT_ACCESS_EXPIRY = "15m";
process.env.JWT_REFRESH_EXPIRY = "7d";

import { MutabaahService } from "./mutabaah.service.js";
import type { MutabaahRepository } from "./mutabaah.repository.js";
import {
  CreateMutabaahActivitySchema,
  BatchUpsertMutabaahEntriesSchema,
  CreateMutabaahUzurRecordSchema,
} from "./mutabaah.schema.js";
import { buildApp } from "../../app.js";
import { signAccessToken } from "../../core/auth/jwt.js";
import { generateMutabaahPdf } from "./mutabaah.pdf.js";

function createMockMutabaahRepo(): MutabaahRepository {
  return {
    findActivities: vi.fn(),
    findActivityById: vi.fn(),
    createActivity: vi.fn(),
    updateActivity: vi.fn(),
    deleteActivity: vi.fn(),
    countActivities: vi.fn(),
    insertDefaultActivities: vi.fn(),
    findStudentsForChecklist: vi.fn(),
    findDailyEntries: vi.fn(),
    batchUpsertDailyEntries: vi.fn(),
    findUzurRecords: vi.fn(),
    createUzurRecord: vi.fn(),
    deleteUzurRecord: vi.fn(),
    findEntriesInRange: vi.fn(),
    findStudentById: vi.fn(),
    findInstitution: vi.fn(),
  } as unknown as MutabaahRepository;
}

const mockActivity = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Shalat Subuh Berjama'ah",
  category: "fardhu" as const,
  targetCount: 1,
  unit: "waktu",
  weight: 3,
  isMandatory: true,
  genderSpecific: "all" as const,
  orderIndex: 1,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Mutabaah Module", () => {
  describe("Zod Validation Schemas", () => {
    it("validates valid activity creation", () => {
      const valid = {
        name: "Shalat Subuh Berjama'ah",
        category: "fardhu",
        weight: 3,
        isMandatory: true,
      };
      const parsed = CreateMutabaahActivitySchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("rejects invalid activity category", () => {
      const invalid = {
        name: "Kegiatan Luar",
        category: "unknown_category",
        weight: 1,
      };
      const parsed = CreateMutabaahActivitySchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it("validates batch upsert daily entries", () => {
      const valid = {
        date: "2026-11-10",
        entries: [
          {
            studentId: "22222222-2222-2222-2222-222222222222",
            activityId: "11111111-1111-1111-1111-111111111111",
            status: "terlaksana",
            volume: 1,
            score: 100,
          },
        ],
      };
      const parsed = BatchUpsertMutabaahEntriesSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("validates uzur syar'i record schema", () => {
      const valid = {
        studentId: "22222222-2222-2222-2222-222222222222",
        uzurType: "haidh",
        startDate: "2026-11-10",
        endDate: "2026-11-16",
      };
      const parsed = CreateMutabaahUzurRecordSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });
  });

  describe("MutabaahService", () => {
    let repo: MutabaahRepository;
    let service: MutabaahService;

    beforeEach(() => {
      repo = createMockMutabaahRepo();
      service = new MutabaahService(repo);
    });

    it("seeds default activities when catalog is empty", async () => {
      vi.mocked(repo.countActivities).mockResolvedValue(0);
      vi.mocked(repo.insertDefaultActivities).mockResolvedValue([mockActivity]);
      await service.ensureDefaultActivities();
      expect(repo.insertDefaultActivities).toHaveBeenCalled();
    });

    it("defaults checklist to terlaksana for regular student and uzur for santriwati in uzur", async () => {
      vi.mocked(repo.countActivities).mockResolvedValue(1);
      vi.mocked(repo.findActivities).mockResolvedValue([mockActivity]);
      vi.mocked(repo.findStudentsForChecklist).mockResolvedValue([
        { id: "s1", fullName: "Ahmad", nisn: "123", gender: "L", classroomId: "c1", className: "X-A" },
        { id: "s2", fullName: "Fatimah", nisn: "124", gender: "P", classroomId: "c1", className: "X-A" },
      ]);
      vi.mocked(repo.findDailyEntries).mockResolvedValue([]);
      vi.mocked(repo.findUzurRecords).mockResolvedValue([
        {
          id: "u1",
          studentId: "s2",
          uzurType: "haidh",
          startDate: "2026-11-10",
          endDate: "2026-11-16",
          notes: "Haidh hari pertama",
          recordedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const res = await service.getDailyChecklist({ date: "2026-11-10" });
      expect(res.totalStudents).toBe(2);

      const ahmad = res.students.find((s) => s.studentId === "s1");
      const fatimah = res.students.find((s) => s.studentId === "s2");

      expect(ahmad?.entries[0].status).toBe("terlaksana");
      expect(fatimah?.isUzur).toBe(true);
      expect(fatimah?.entries[0].status).toBe("uzur");
    });

    it("calculates compliance correctly and does not penalize uzur syar'i", async () => {
      vi.mocked(repo.countActivities).mockResolvedValue(1);
      vi.mocked(repo.findStudentsForChecklist).mockResolvedValue([
        { id: "s2", fullName: "Fatimah", nisn: "124", gender: "P", classroomId: "c1", className: "X-A" },
      ]);
      vi.mocked(repo.findActivities).mockResolvedValue([mockActivity]);
      vi.mocked(repo.findEntriesInRange).mockResolvedValue([
        {
          id: "e1",
          studentId: "s2",
          activityId: mockActivity.id,
          date: "2026-11-10",
          status: "uzur",
          volume: 1,
          score: 100,
          notes: null,
          recordedBy: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      vi.mocked(repo.findUzurRecords).mockResolvedValue([]);

      const recap = await service.getComplianceRecap({
        startDate: "2026-11-10",
        endDate: "2026-11-10",
        studentId: "s2",
      });

      expect(recap[0].complianceScore).toBe(100);
      expect(recap[0].status).toBe("istiqamah");
      expect(recap[0].uzurActivities).toBe(1);
    });

    it("triggers early warning when fardhu prayer missed > 2 times", async () => {
      vi.mocked(repo.countActivities).mockResolvedValue(1);
      vi.mocked(repo.findStudentsForChecklist).mockResolvedValue([
        { id: "s1", fullName: "Ahmad", nisn: "123", gender: "L", classroomId: "c1", className: "X-A" },
      ]);
      vi.mocked(repo.findActivities).mockResolvedValue([mockActivity]);
      vi.mocked(repo.findEntriesInRange).mockResolvedValue([
        { id: "e1", studentId: "s1", activityId: mockActivity.id, date: "2026-11-08", status: "tidak_terlaksana", volume: 0, score: 0, notes: null, recordedBy: null, createdAt: new Date(), updatedAt: new Date() },
        { id: "e2", studentId: "s1", activityId: mockActivity.id, date: "2026-11-09", status: "tidak_terlaksana", volume: 0, score: 0, notes: null, recordedBy: null, createdAt: new Date(), updatedAt: new Date() },
        { id: "e3", studentId: "s1", activityId: mockActivity.id, date: "2026-11-10", status: "tidak_terlaksana", volume: 0, score: 0, notes: null, recordedBy: null, createdAt: new Date(), updatedAt: new Date() },
      ]);
      vi.mocked(repo.findUzurRecords).mockResolvedValue([]);

      const warnings = await service.getEarlyWarnings();
      expect(warnings.length).toBe(1);
      expect(warnings[0].studentName).toBe("Ahmad");
      expect(warnings[0].missedFardhuCount).toBe(3);
    });
  });

  describe("PDF Generator", () => {
    it("generates a valid PDF buffer starting with %PDF-1.4", () => {
      const pdf = generateMutabaahPdf({
        student: { id: "s1", fullName: "Ahmad Dahlan", nisn: "0012345", gender: "L" },
        classroom: { id: "c1", name: "X-A" },
        institution: { name: "MA SIMMA", nsm: "123", npsn: "456", address: "Jl. Pesantren" },
        period: { month: 11, year: 2026, startDate: "2026-11-01", endDate: "2026-11-30" },
        summary: {
          studentId: "s1",
          studentName: "Ahmad Dahlan",
          gender: "L",
          totalMandatoryActivities: 150,
          completedActivities: 140,
          masbukActivities: 5,
          uzurActivities: 0,
          missedActivities: 5,
          complianceScore: 95,
          status: "istiqamah",
          consecutiveMissedFardhu: 0,
          hasEarlyWarning: false,
        },
        activityStats: [
          {
            activityId: "a1",
            activityName: "Shalat Subuh",
            category: "fardhu",
            targetCount: 30,
            completedCount: 28,
            masbukCount: 1,
            uzurCount: 0,
            missedCount: 1,
            percentage: 95,
          },
        ],
      });

      expect(Buffer.isBuffer(pdf)).toBe(true);
      expect(pdf.subarray(0, 8).toString()).toContain("%PDF");
    });
  });

  describe("HTTP Routes & RBAC Integration", () => {
    it("returns 401 when no token is provided", async () => {
      const app = await buildApp();
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/mutabaah/activities",
      });
      expect(res.statusCode).toBe(401);
    });

    it("returns 403 when user role is not authorized for write operation", async () => {
      const app = await buildApp();
      const studentToken = await signAccessToken({
        sub: "student-uuid",
        username: "calon_santri",
        role: "calon_siswa",
      });
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/mutabaah/activities",
        headers: {
          authorization: `Bearer ${studentToken}`,
        },
        payload: {
          name: "Shalat Sunnah",
          category: "sunnah",
          weight: 1,
        },
      });
      expect(res.statusCode).toBe(403);
    });

    it("returns 400 when body payload fails validation", async () => {
      const app = await buildApp();
      const adminToken = await signAccessToken({
        sub: "admin-uuid",
        username: "admin_madrasah",
        role: "super_admin",
      });
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/mutabaah/activities",
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
        payload: {
          name: "", // Invalid empty name
          category: "invalid_category",
        },
      });
      expect(res.statusCode).toBe(400);
    });
  });
});
