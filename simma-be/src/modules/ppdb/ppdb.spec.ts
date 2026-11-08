process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://simma:***@localhost:5432/simma_test";
process.env.JWT_ACCESS_SECRET = "test-jwt-access-secret-minimum-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-minimum-32-chars-long";
process.env.JWT_ACCESS_EXPIRY = "15m";
process.env.JWT_REFRESH_EXPIRY = "7d";

import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { PpdbService } from "./ppdb.service.js";
import { PpdbRepository } from "./ppdb.repository.js";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../../core/errors/index.js";
import type { PpdbApplicant } from "./ppdb.types.js";
import { signAccessToken } from "../../core/auth/jwt.js";
import { buildApp } from "../../app.js";

const mockApplicant: PpdbApplicant = {
  id: "018f3a2c-1234-7000-8000-000000000099",
  registrationNumber: "PPDB-2025-0001",
  academicYearId: "018f3a2c-1234-7000-8000-000000000001",
  fullName: "Muhammad Zaki",
  nik: "3515123456789999",
  nisn: "0081234567",
  birthPlace: "Malang",
  birthDate: "2009-08-15",
  gender: "L",
  religion: "Islam",
  phone: "08123456789",
  email: "zaki@gmail.com",
  address: "Jl. Merdeka No. 1",
  previousSchoolType: "MTs",
  previousSchoolName: "MTs Negeri 1 Malang",
  npsnOrigin: "20580001",
  fatherName: "Ahmad Subagio",
  fatherPhone: "081299998888",
  motherName: "Siti Rahma",
  motherPhone: "081277776666",
  guardianName: null,
  chosenMajor: "MIPA",
  status: "submitted",
  notes: null,
  documents: {},
  studentId: null,
  enrolledAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("PpdbService", () => {
  let service: PpdbService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      getActiveAcademicYear: vi.fn().mockResolvedValue({
        id: "018f3a2c-1234-7000-8000-000000000001",
        name: "2024/2025",
      }),
      findApplicants: vi.fn().mockResolvedValue({
        data: [mockApplicant],
        total: 1,
      }),
      findById: vi.fn().mockResolvedValue(mockApplicant),
      findByRegistrationNumber: vi.fn().mockResolvedValue(mockApplicant),
      findByNik: vi.fn().mockResolvedValue(null),
      getLatestRegistrationNumber: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(mockApplicant),
      updateStatus: vi.fn().mockResolvedValue({ ...mockApplicant, status: "verified" }),
      setEnrolled: vi.fn().mockResolvedValue({
        ...mockApplicant,
        status: "enrolled",
        studentId: "student-uuid-1",
      }),
      delete: vi.fn().mockResolvedValue(true),
      getStats: vi.fn().mockResolvedValue({
        total: 1,
        submitted: 1,
        verified: 0,
        accepted: 0,
        rejected: 0,
        enrolled: 0,
      }),
    };

    service = new PpdbService(mockRepo as unknown as PpdbRepository);
  });

  describe("registerApplicant", () => {
    it("should register new applicant and generate registration number", async () => {
      const input = {
        fullName: "Muhammad Zaki",
        nik: "3515123456789999",
        nisn: "0081234567",
        birthPlace: "Malang",
        birthDate: "2009-08-15",
        gender: "L" as const,
        religion: "Islam",
        previousSchoolType: "MTs" as const,
        previousSchoolName: "MTs Negeri 1 Malang",
        motherName: "Siti Rahma",
        chosenMajor: "MIPA" as const,
        documents: {},
      };

      const result = await service.registerApplicant(input);

      expect(mockRepo.findByNik).toHaveBeenCalledWith(input.nik);
      expect(mockRepo.create).toHaveBeenCalled();
      expect(result.fullName).toBe("Muhammad Zaki");
    });

    it("should throw ConflictError if NIK is already registered", async () => {
      mockRepo.findByNik.mockResolvedValueOnce(mockApplicant);

      const input = {
        fullName: "Muhammad Zaki",
        nik: "3515123456789999",
        birthPlace: "Malang",
        birthDate: "2009-08-15",
        gender: "L" as const,
        religion: "Islam",
        previousSchoolType: "MTs" as const,
        previousSchoolName: "MTs Negeri 1 Malang",
        motherName: "Siti Rahma",
        chosenMajor: "MIPA" as const,
        documents: {},
      };

      await expect(service.registerApplicant(input)).rejects.toThrow(ConflictError);
    });
  });

  describe("checkStatus", () => {
    it("should return applicant status when regNumber and NIK match", async () => {
      const result = await service.checkStatus({
        registrationNumber: "PPDB-2025-0001",
        nikOrNisn: "3515123456789999",
      });

      expect(result.registrationNumber).toBe("PPDB-2025-0001");
      expect(result.status).toBe("submitted");
    });

    it("should throw NotFoundError if registration number does not exist", async () => {
      mockRepo.findByRegistrationNumber.mockResolvedValueOnce(null);

      await expect(
        service.checkStatus({
          registrationNumber: "PPDB-INVALID",
          nikOrNisn: "1234",
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError if NIK/NISN verification fails", async () => {
      await expect(
        service.checkStatus({
          registrationNumber: "PPDB-2025-0001",
          nikOrNisn: "WRONG_KEY",
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("updateStatus", () => {
    it("should update applicant status", async () => {
      const result = await service.updateStatus(mockApplicant.id, {
        status: "verified",
        notes: "Berkas lengkap",
      });

      expect(result.status).toBe("verified");
    });

    it("should throw ValidationError if trying to change status of already enrolled applicant", async () => {
      mockRepo.findById.mockResolvedValueOnce({
        ...mockApplicant,
        status: "enrolled",
      });

      await expect(
        service.updateStatus(mockApplicant.id, { status: "rejected" })
      ).rejects.toThrow(ValidationError);
    });
  });
});

describe("PPDB Routes Integration", () => {
  let app: FastifyInstance;
  let adminToken: string;
  let teacherToken: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    adminToken = await signAccessToken({
      sub: "018f3a2c-0000-7000-8000-000000000001",
      username: "admin_tu",
      role: "admin_tu",
    });

    teacherToken = await signAccessToken({
      sub: "018f3a2c-0000-7000-8000-000000000002",
      username: "guru_user",
      role: "guru_mapel",
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/v1/ppdb/applicants should return 401 without token", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/ppdb/applicants",
    });

    expect(res.statusCode).toBe(401);
  });

  it("POST /api/v1/ppdb/applicants/018f3a2c-0000-7000-8000-000000000099/enroll should return 403 for guru_mapel", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/ppdb/applicants/018f3a2c-0000-7000-8000-000000000099/enroll",
      headers: {
        Authorization: `Bearer ${teacherToken}`,
      },
    });

    expect(res.statusCode).toBe(403);
  });

  it("POST /api/v1/ppdb/register should reject invalid payload with 400", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/ppdb/register",
      payload: {
        nik: "123", // invalid length
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it("GET /api/v1/ppdb/check-status should reject missing params with 400", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/ppdb/check-status",
    });

    expect(res.statusCode).toBe(400);
  });
});
