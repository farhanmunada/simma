import { describe, it, expect, vi, beforeEach } from "vitest";

// Set environment variables before any module loads
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://simma:***@localhost:5432/simma_test";
process.env.JWT_ACCESS_SECRET = "test-jwt-access-secret-minimum-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-minimum-32-chars-long";
process.env.JWT_ACCESS_EXPIRY = "15m";
process.env.JWT_REFRESH_EXPIRY = "7d";

import { AttendanceService } from "./attendance.service.js";
import type { AttendanceRepository } from "./attendance.repository.js";
import { NotFoundError } from "../../core/errors/index.js";
import {
  RecordStudentAttendanceSchema,
  BulkStudentAttendanceSchema,
  RecordTeacherAttendanceSchema,
  BulkTeacherAttendanceSchema,
  StudentAttendanceQuerySchema,
  TeacherAttendanceQuerySchema,
} from "./attendance.schema.js";
import { buildApp } from "../../app.js";
import { signAccessToken } from "../../core/auth/jwt.js";
import type {
  AttendanceStudent,
  AttendanceTeacher,
} from "./attendance.types.js";

function createMockAttendanceRepo(): AttendanceRepository {
  return {
    findStudentAttendanceById: vi.fn(),
    upsertStudentAttendance: vi.fn(),
    bulkUpsertStudentAttendance: vi.fn(),
    updateStudentAttendance: vi.fn(),
    deleteStudentAttendance: vi.fn(),
    findStudentAttendances: vi.fn(),
    findClassroomAttendanceByDate: vi.fn(),
    findStudentAttendanceHistory: vi.fn(),
    findTeacherAttendanceById: vi.fn(),
    upsertTeacherAttendance: vi.fn(),
    bulkUpsertTeacherAttendance: vi.fn(),
    updateTeacherAttendance: vi.fn(),
    deleteTeacherAttendance: vi.fn(),
    findTeacherAttendances: vi.fn(),
    findTeacherAttendanceHistory: vi.fn(),
  } as unknown as AttendanceRepository;
}

const mockDate = "2026-11-08";
const mockTimestamp = new Date("2026-11-08T00:00:00Z");

const sampleStudentAttendance: AttendanceStudent = {
  id: "00000000-0000-0000-0000-000000000001",
  studentId: "11111111-1111-1111-1111-111111111111",
  classroomId: "22222222-2222-2222-2222-222222222222",
  teacherId: "33333333-3333-3333-3333-333333333333",
  date: mockDate,
  status: "hadir",
  note: "Tepat waktu",
  createdAt: mockTimestamp,
  updatedAt: mockTimestamp,
};

const sampleTeacherAttendance: AttendanceTeacher = {
  id: "00000000-0000-0000-0000-000000000002",
  teacherId: "33333333-3333-3333-3333-333333333333",
  date: mockDate,
  status: "hadir",
  note: "Hadir piket",
  createdAt: mockTimestamp,
  updatedAt: mockTimestamp,
};

describe("Attendance Module", () => {
  describe("Zod Validation Schemas", () => {
    it("validates valid student attendance input", () => {
      const valid = {
        studentId: "11111111-1111-1111-1111-111111111111",
        classroomId: "22222222-2222-2222-2222-222222222222",
        date: "2026-11-08",
        status: "hadir",
        note: "Masuk",
      };
      const parsed = RecordStudentAttendanceSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("rejects invalid student attendance status", () => {
      const invalid = {
        studentId: "11111111-1111-1111-1111-111111111111",
        classroomId: "22222222-2222-2222-2222-222222222222",
        date: "2026-11-08",
        status: "invalid_status",
      };
      const parsed = RecordStudentAttendanceSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it("validates bulk student attendance input", () => {
      const valid = {
        classroomId: "22222222-2222-2222-2222-222222222222",
        date: "2026-11-08",
        attendances: [
          {
            studentId: "11111111-1111-1111-1111-111111111111",
            status: "hadir",
          },
          {
            studentId: "11111111-1111-1111-1111-111111111112",
            status: "sakit",
            note: "Demam",
          },
        ],
      };
      const parsed = BulkStudentAttendanceSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("rejects empty bulk student attendance list", () => {
      const invalid = {
        classroomId: "22222222-2222-2222-2222-222222222222",
        date: "2026-11-08",
        attendances: [],
      };
      const parsed = BulkStudentAttendanceSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it("validates teacher attendance input", () => {
      const valid = {
        teacherId: "33333333-3333-3333-3333-333333333333",
        date: "2026-11-08",
        status: "dinas_luar",
        note: "Workshop MGMP",
      };
      const parsed = RecordTeacherAttendanceSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });

    it("validates bulk teacher attendance", () => {
      const valid = {
        date: "2026-11-08",
        attendances: [
          {
            teacherId: "33333333-3333-3333-3333-333333333333",
            status: "hadir",
          },
        ],
      };
      const parsed = BulkTeacherAttendanceSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
    });
  });

  describe("AttendanceService - Unit Tests", () => {
    let service: AttendanceService;
    let mockRepo: ReturnType<typeof createMockAttendanceRepo>;

    beforeEach(() => {
      mockRepo = createMockAttendanceRepo();
      service = new AttendanceService(mockRepo);
    });

    it("records single student attendance", async () => {
      vi.mocked(mockRepo.upsertStudentAttendance).mockResolvedValue(
        sampleStudentAttendance,
      );

      const result = await service.recordStudentAttendance({
        studentId: sampleStudentAttendance.studentId,
        classroomId: sampleStudentAttendance.classroomId,
        date: sampleStudentAttendance.date,
        status: sampleStudentAttendance.status,
      });

      expect(mockRepo.upsertStudentAttendance).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: sampleStudentAttendance.studentId,
          status: "hadir",
        }),
      );
      expect(result).toEqual(sampleStudentAttendance);
    });

    it("bulk records student attendance", async () => {
      vi.mocked(mockRepo.bulkUpsertStudentAttendance).mockResolvedValue([
        sampleStudentAttendance,
      ]);

      const result = await service.bulkRecordStudentAttendance({
        classroomId: sampleStudentAttendance.classroomId,
        date: sampleStudentAttendance.date,
        attendances: [
          {
            studentId: sampleStudentAttendance.studentId,
            status: "hadir",
          },
        ],
      });

      expect(mockRepo.bulkUpsertStudentAttendance).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
    });

    it("gets student attendance by ID and throws if not found", async () => {
      vi.mocked(mockRepo.findStudentAttendanceById).mockResolvedValue(
        sampleStudentAttendance,
      );
      const found = await service.getStudentAttendanceById(
        sampleStudentAttendance.id,
      );
      expect(found).toEqual(sampleStudentAttendance);

      vi.mocked(mockRepo.findStudentAttendanceById).mockResolvedValue(null);
      await expect(
        service.getStudentAttendanceById("nonexistent"),
      ).rejects.toThrow(NotFoundError);
    });

    it("updates student attendance", async () => {
      vi.mocked(mockRepo.findStudentAttendanceById).mockResolvedValue(
        sampleStudentAttendance,
      );
      vi.mocked(mockRepo.updateStudentAttendance).mockResolvedValue({
        ...sampleStudentAttendance,
        status: "izin",
      });

      const updated = await service.updateStudentAttendance(
        sampleStudentAttendance.id,
        { status: "izin" },
      );
      expect(updated.status).toBe("izin");
    });

    it("deletes student attendance", async () => {
      vi.mocked(mockRepo.findStudentAttendanceById).mockResolvedValue(
        sampleStudentAttendance,
      );
      vi.mocked(mockRepo.deleteStudentAttendance).mockResolvedValue(true);

      await expect(
        service.deleteStudentAttendance(sampleStudentAttendance.id),
      ).resolves.not.toThrow();
    });

    it("gets classroom attendance and calculates summary percentage correctly", async () => {
      const records: AttendanceStudent[] = [
        { ...sampleStudentAttendance, id: "1", status: "hadir" },
        { ...sampleStudentAttendance, id: "2", status: "hadir" },
        { ...sampleStudentAttendance, id: "3", status: "izin" },
        { ...sampleStudentAttendance, id: "4", status: "alpa" },
      ];
      vi.mocked(mockRepo.findClassroomAttendanceByDate).mockResolvedValue(
        records,
      );

      const result = await service.getClassroomAttendance(
        sampleStudentAttendance.classroomId,
        mockDate,
      );

      expect(result.summary.total).toBe(4);
      expect(result.summary.hadir).toBe(2);
      expect(result.summary.izin).toBe(1);
      expect(result.summary.alpa).toBe(1);
      expect(result.summary.attendancePercentage).toBe(50);
    });

    it("gets student attendance summary accurately", async () => {
      const history: AttendanceStudent[] = [
        { ...sampleStudentAttendance, id: "1", status: "hadir" },
        { ...sampleStudentAttendance, id: "2", status: "hadir" },
        { ...sampleStudentAttendance, id: "3", status: "sakit" },
      ];
      vi.mocked(mockRepo.findStudentAttendanceHistory).mockResolvedValue(
        history,
      );

      const summary = await service.getStudentAttendanceSummary(
        sampleStudentAttendance.studentId,
      );

      expect(summary.total).toBe(3);
      expect(summary.hadir).toBe(2);
      expect(summary.sakit).toBe(1);
      expect(summary.attendancePercentage).toBe(66.67);
    });

    it("records and updates teacher attendance", async () => {
      vi.mocked(mockRepo.upsertTeacherAttendance).mockResolvedValue(
        sampleTeacherAttendance,
      );
      vi.mocked(mockRepo.findTeacherAttendanceById).mockResolvedValue(
        sampleTeacherAttendance,
      );
      vi.mocked(mockRepo.updateTeacherAttendance).mockResolvedValue({
        ...sampleTeacherAttendance,
        status: "dinas_luar",
      });

      const recorded = await service.recordTeacherAttendance({
        teacherId: sampleTeacherAttendance.teacherId,
        date: sampleTeacherAttendance.date,
        status: "hadir",
      });
      expect(recorded).toEqual(sampleTeacherAttendance);

      const updated = await service.updateTeacherAttendance(
        sampleTeacherAttendance.id,
        { status: "dinas_luar" },
      );
      expect(updated.status).toBe("dinas_luar");
    });

    it("gets teacher attendance summary counting dinas_luar in percentage", async () => {
      const history: AttendanceTeacher[] = [
        { ...sampleTeacherAttendance, id: "1", status: "hadir" },
        { ...sampleTeacherAttendance, id: "2", status: "dinas_luar" },
        { ...sampleTeacherAttendance, id: "3", status: "izin" },
        { ...sampleTeacherAttendance, id: "4", status: "alpa" },
      ];
      vi.mocked(mockRepo.findTeacherAttendanceHistory).mockResolvedValue(
        history,
      );

      const summary = await service.getTeacherAttendanceSummary(
        sampleTeacherAttendance.teacherId,
      );

      expect(summary.total).toBe(4);
      expect(summary.hadir).toBe(1);
      expect(summary.dinasLuar).toBe(1);
      expect(summary.attendancePercentage).toBe(50); // (1 hadir + 1 dinas_luar) / 4 = 50%
    });
  });

  describe("API Routes & RBAC Auth Guards (Integration)", () => {
    it("returns 401 when request is unauthenticated", async () => {
      const app = await buildApp();
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/attendance/students",
      });

      expect(res.statusCode).toBe(401);
      await app.close();
    });

    it("returns 403 when user has forbidden role (e.g. guru_tahfidz)", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "44444444-4444-4444-4444-444444444444",
        username: "ustadz_hafizh",
        role: "guru_tahfidz",
        teacherId: null,
      });

      const res = await app.inject({
        method: "GET",
        url: "/api/v1/attendance/students",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(res.statusCode).toBe(403);
      await app.close();
    });

    it("allows authorized role 'guru' to access attendance endpoint", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "55555555-5555-5555-5555-555555555555",
        username: "guru_ahmad",
        role: "guru",
        teacherId: null,
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/attendance/students",
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {}, // Invalid payload triggers 400 validation, proving guard passed
      });

      expect(res.statusCode).toBe(400);
      await app.close();
    });

    it("allows authorized role 'wali_kelas' to access attendance endpoint", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "66666666-6666-6666-6666-666666666666",
        username: "wali_kelas_budi",
        role: "wali_kelas",
        teacherId: null,
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/attendance/bulk",
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {},
      });

      expect(res.statusCode).toBe(400);
      await app.close();
    });

    it("allows authorized role 'admin_tu' to access teacher attendance endpoint", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "77777777-7777-7777-7777-777777777777",
        username: "admin_tu_siti",
        role: "admin_tu",
        teacherId: null,
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/attendance/teachers",
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {},
      });

      expect(res.statusCode).toBe(400);
      await app.close();
    });

    it("allows authorized role 'super_admin' to access attendance endpoint", async () => {
      const app = await buildApp();
      const token = await signAccessToken({
        sub: "88888888-8888-8888-8888-888888888888",
        username: "super_administrator",
        role: "super_admin",
        teacherId: null,
      });

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/attendance/teachers/bulk",
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {},
      });

      expect(res.statusCode).toBe(400);
      await app.close();
    });
  });
});
