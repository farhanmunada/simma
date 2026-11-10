import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://simma:***@localhost:5432/simma_test";
process.env.JWT_ACCESS_SECRET = "test-jwt-access-secret-minimum-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-minimum-32-chars-long";
process.env.JWT_ACCESS_EXPIRY = "15m";
process.env.JWT_REFRESH_EXPIRY = "7d";

import { TeachersService } from "./teachers.service.js";
import type { TeachersRepository } from "./teachers.repository.js";
import {
  CreateTeacherFullSchema,
  CreateTeacherRankSchema,
  UpsertTeacherWorkloadSchema,
} from "./teachers.schema.js";

function createMockRepo(): TeachersRepository {
  return {
    findTeachers: vi.fn(),
    findTeacherById: vi.fn(),
    findByNik: vi.fn(),
    findByNuptk: vi.fn(),
    createTeacherWithProfile: vi.fn(),
    updateTeacherWithProfile: vi.fn(),
    softDeleteTeacher: vi.fn(),
    createEducation: vi.fn(),
    deleteEducation: vi.fn(),
    createRank: vi.fn(),
    deleteRank: vi.fn(),
    createDocument: vi.fn(),
    deleteDocument: vi.fn(),
    upsertWorkload: vi.fn(),
    findAllWorkloads: vi.fn(),
  } as unknown as TeachersRepository;
}

const mockTeacher = {
  id: "00000000-0000-0000-0000-000000000001",
  userId: null,
  nik: "3201012345678901",
  nuptk: "1234567890123456",
  fullName: "Ahmad Fauzi, M.Pd.",
  employmentType: "PNS" as const,
  certification: "Sertifikasi PAI",
  emisData: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  profile: {
    id: "10000000-0000-0000-0000-000000000001",
    teacherId: "00000000-0000-0000-0000-000000000001",
    nip: "198501012010011001",
    pegId: "PEG-12345",
    nrg: "NRG-998877",
    noKk: "3201019999990001",
    birthPlace: "Bandung",
    birthDate: "1985-01-01",
    gender: "L",
    religion: "Islam",
    address: "Jl. Pendidikan No. 10",
    phone: "081234567890",
    email: "ahmad.fauzi@madrasah.id",
    marriageStatus: "menikah",
    tmtFirst: "2010-01-01",
    tmtPns: "2012-01-01",
    dutyStatus: "aktif",
    gtkType: "pendidik",
    certificationField: "Pendidikan Agama Islam",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  educations: [],
  ranks: [],
  documents: [],
  workloads: [],
};

describe("Teachers Module (GTK Kepegawaian)", () => {
  describe("Zod Validation Schemas", () => {
    it("validates valid teacher creation input", () => {
      const input = {
        nik: "3201012345678901",
        nuptk: "1234567890123456",
        fullName: "Siti Aminah, S.Pd.",
        employmentType: "GTY",
        profile: {
          gender: "P",
          gtkType: "pendidik",
          dutyStatus: "aktif",
        },
      };
      const result = CreateTeacherFullSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("rejects invalid NIK with length !== 16", () => {
      const input = {
        nik: "12345",
        fullName: "Test Guru",
        employmentType: "GTT",
      };
      const result = CreateTeacherFullSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("validates workload upsert input", () => {
      const input = {
        teacherId: "00000000-0000-0000-0000-000000000001",
        academicYearId: "11111111-1111-1111-1111-111111111111",
        semesterId: "22222222-2222-2222-2222-222222222222",
        teachingJtm: 18,
        additionalDutyType: "waka_kurikulum",
        additionalDutyJtm: 12,
      };
      const result = UpsertTeacherWorkloadSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("TeachersService Logic", () => {
    let repo: ReturnType<typeof createMockRepo>;
    let service: TeachersService;

    beforeEach(() => {
      repo = createMockRepo();
      service = new TeachersService(repo);
    });

    it("creates teacher when NIK is unique", async () => {
      vi.mocked(repo.findByNik).mockResolvedValue(null);
      vi.mocked(repo.findByNuptk).mockResolvedValue(null);
      vi.mocked(repo.createTeacherWithProfile).mockResolvedValue(mockTeacher as any);

      const res = await service.createTeacher({
        nik: "3201012345678901",
        fullName: "Ahmad Fauzi, M.Pd.",
        employmentType: "PNS",
      });

      expect(res.fullName).toBe("Ahmad Fauzi, M.Pd.");
      expect(repo.createTeacherWithProfile).toHaveBeenCalled();
    });

    it("throws ConflictError if NIK already registered", async () => {
      vi.mocked(repo.findByNik).mockResolvedValue(mockTeacher as any);

      await expect(
        service.createTeacher({
          nik: "3201012345678901",
          fullName: "Ahmad Fauzi",
          employmentType: "PNS",
        })
      ).rejects.toThrow("sudah terdaftar");
    });

    it("auto-calculates next KGB and promotion date when adding rank", async () => {
      vi.mocked(repo.findTeacherById).mockResolvedValue(mockTeacher as any);
      vi.mocked(repo.createRank).mockImplementation(async (_, data) => data as any);

      await service.addRank(mockTeacher.id, {
        rank: "Penata Muda",
        gradeGroup: "III/a",
        skNumber: "SK/2024/001",
        skDate: "2024-01-02",
        tmtRank: "2024-04-01",
        isCurrent: true,
      });

      expect(repo.createRank).toHaveBeenCalledWith(
        mockTeacher.id,
        expect.objectContaining({
          nextKgbDate: "2026-04-01",
          nextPromotionDate: "2028-04-01",
        })
      );
    });

    it("correctly evaluates 24 JTM and Simpatika eligibility in workload upsert", async () => {
      vi.mocked(repo.findTeacherById).mockResolvedValue(mockTeacher as any);
      vi.mocked(repo.upsertWorkload).mockImplementation(async (data) => data as any);

      await service.upsertWorkload({
        teacherId: mockTeacher.id,
        academicYearId: "11111111-1111-1111-1111-111111111111",
        semesterId: "22222222-2222-2222-2222-222222222222",
        teachingJtm: 18,
        additionalDutyType: "waka_kurikulum", // map auto 12 JTM
      });

      expect(repo.upsertWorkload).toHaveBeenCalledWith(
        expect.objectContaining({
          teachingJtm: 18,
          additionalDutyJtm: 12,
          totalJtm: 30,
          isEligibleTpg: true,
          simpatikaStatus: "layak",
        })
      );
    });

    it("generates standardized EMIS GTK export format", async () => {
      vi.mocked(repo.findTeachers).mockResolvedValue({
        data: [
          {
            ...mockTeacher,
            currentWorkload: { totalJtm: 24, isEligibleTpg: true } as any,
          },
        ] as any,
        total: 1,
      });

      const exportRows = await service.getEmisExport({});
      expect(exportRows.length).toBe(1);
      expect(exportRows[0].nik).toBe("3201012345678901");
      expect(exportRows[0].nip).toBe("198501012010011001");
      expect(exportRows[0].isCertified).toBe(true);
      expect(exportRows[0].isEligibleTpg).toBe(true);
    });
  });
});
