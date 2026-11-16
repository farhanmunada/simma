import { describe, it, expect, vi, beforeEach } from "vitest";
import { SetupService } from "./setup.service.js";
import { SetupRepository } from "./setup.repository.js";
import { NotFoundError, ConflictError } from "../../core/errors/index.js";
import type {
  Institution,
  AcademicYear,
  Semester,
  Classroom,
  Subject,
  Teacher,
} from "./setup.types.js";

describe("SetupService", () => {
  let repo: SetupRepository;
  let service: SetupService;

  beforeEach(() => {
    repo = new SetupRepository();
    service = new SetupService(repo);
  });

  describe("Institutions", () => {
    const mockInstitution: Institution = {
      id: "11111111-1111-1111-1111-111111111111",
      nsm: "131235150001",
      npsn: "20580001",
      name: "MA Negeri 1 Contoh",
      status: "negeri",
      address: "Jl. Pendidikan No. 1",
      logoPath: null,
      emisData: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should return the first institution when found", async () => {
      vi.spyOn(repo, "findFirstInstitution").mockResolvedValue(mockInstitution);
      const result = await service.getInstitution();
      expect(result).toEqual(mockInstitution);
    });

    it("should throw NotFoundError if no institution exists", async () => {
      vi.spyOn(repo, "findFirstInstitution").mockResolvedValue(null);
      await expect(service.getInstitution()).rejects.toThrow(NotFoundError);
    });

    it("should create an institution", async () => {
      vi.spyOn(repo, "createInstitution").mockResolvedValue(mockInstitution);
      const result = await service.createInstitution({
        nsm: "131235150001",
        npsn: "20580001",
        name: "MA Negeri 1 Contoh",
        status: "negeri",
        address: "Jl. Pendidikan No. 1",
      });
      expect(result).toEqual(mockInstitution);
    });
  });

  describe("Academic Years", () => {
    const mockAY: AcademicYear = {
      id: "22222222-2222-2222-2222-222222222222",
      name: "2024/2025",
      startDate: "2024-07-15",
      endDate: "2025-06-20",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should return paginated academic years", async () => {
      vi.spyOn(repo, "findAcademicYears").mockResolvedValue({
        data: [mockAY],
        total: 1,
      });

      const result = await service.getAcademicYears({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it("should throw NotFoundError if academic year not found by id", async () => {
      vi.spyOn(repo, "findAcademicYearById").mockResolvedValue(null);
      await expect(
        service.getAcademicYearById("non-existent-id"),
      ).rejects.toThrow(NotFoundError);
    });

    it("should activate an academic year", async () => {
      vi.spyOn(repo, "findAcademicYearById").mockResolvedValue(mockAY);
      vi.spyOn(repo, "setActiveAcademicYear").mockResolvedValue({
        ...mockAY,
        isActive: true,
      });

      const result = await service.setActiveAcademicYear(mockAY.id);
      expect(result.isActive).toBe(true);
    });
  });

  describe("Semesters", () => {
    const mockAY: AcademicYear = {
      id: "22222222-2222-2222-2222-222222222222",
      name: "2024/2025",
      startDate: "2024-07-15",
      endDate: "2025-06-20",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockSemester: Semester = {
      id: "33333333-3333-3333-3333-333333333333",
      academicYearId: mockAY.id,
      type: 1,
      isActive: true,
      startDate: "2024-07-15",
      endDate: "2024-12-20",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should verify academic year exists before creating semester", async () => {
      vi.spyOn(repo, "findAcademicYearById").mockResolvedValue(null);

      await expect(
        service.createSemester({
          academicYearId: mockAY.id,
          type: 1,
          startDate: "2024-07-15",
          endDate: "2024-12-20",
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should create semester when academic year exists", async () => {
      vi.spyOn(repo, "findAcademicYearById").mockResolvedValue(mockAY);
      vi.spyOn(repo, "createSemester").mockResolvedValue(mockSemester);

      const result = await service.createSemester({
        academicYearId: mockAY.id,
        type: 1,
        startDate: "2024-07-15",
        endDate: "2024-12-20",
      });
      expect(result).toEqual(mockSemester);
    });
  });

  describe("Classrooms", () => {
    const mockSemester: Semester = {
      id: "33333333-3333-3333-3333-333333333333",
      academicYearId: "22222222-2222-2222-2222-222222222222",
      type: 1,
      isActive: true,
      startDate: "2024-07-15",
      endDate: "2024-12-20",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockClassroom: Classroom = {
      id: "44444444-4444-4444-4444-444444444444",
      semesterId: mockSemester.id,
      name: "X-A",
      gradeLevel: 10,
      homeroomTeacherId: null,
      capacity: 36,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should create classroom when semester exists", async () => {
      vi.spyOn(repo, "findSemesterById").mockResolvedValue(mockSemester);
      vi.spyOn(repo, "createClassroom").mockResolvedValue(mockClassroom);

      const result = await service.createClassroom({
        semesterId: mockSemester.id,
        name: "X-A",
        gradeLevel: 10,
      });

      expect(result).toEqual(mockClassroom);
    });
  });

  describe("Subjects", () => {
    const mockSubject: Subject = {
      id: "55555555-5555-5555-5555-555555555555",
      code: "PAI-01",
      name: "Al-Qur'an Hadis",
      group: "PAI",
      jpPerWeek: 2,
      isRequired: true,
      phase: "E",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should throw ConflictError if subject code already exists", async () => {
      vi.spyOn(repo, "findSubjectByCode").mockResolvedValue(mockSubject);

      await expect(
        service.createSubject({
          code: "PAI-01",
          name: "Al-Qur'an Hadis",
          group: "PAI",
          jpPerWeek: 2,
          isRequired: true,
          phase: "E",
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("should create subject when code is unique", async () => {
      vi.spyOn(repo, "findSubjectByCode").mockResolvedValue(null);
      vi.spyOn(repo, "createSubject").mockResolvedValue(mockSubject);

      const result = await service.createSubject({
        code: "PAI-01",
        name: "Al-Qur'an Hadis",
        group: "PAI",
        jpPerWeek: 2,
        isRequired: true,
        phase: "E",
      });

      expect(result).toEqual(mockSubject);
    });
  });

  describe("Teachers", () => {
    const mockTeacher: Teacher = {
      id: "66666666-6666-6666-6666-666666666666",
      userId: null,
      positionId: null,
      nik: "3515000000000001",
      nuptk: "1234567890123456",
      fullName: "Ahmad Dahlan, S.Pd.",
      employmentType: "GTY",
      certification: "Sertifikasi Guru PAI",
      emisData: {},
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should throw ConflictError if teacher NIK already registered", async () => {
      vi.spyOn(repo, "findTeacherByNik").mockResolvedValue(mockTeacher);

      await expect(
        service.createTeacher({
          nik: "3515000000000001",
          fullName: "Ahmad Dahlan, S.Pd.",
          employmentType: "GTY",
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("should soft delete teacher", async () => {
      vi.spyOn(repo, "findTeacherById").mockResolvedValue(mockTeacher);
      vi.spyOn(repo, "softDeleteTeacher").mockResolvedValue(true);

      await expect(service.deleteTeacher(mockTeacher.id)).resolves.not.toThrow();
      expect(repo.softDeleteTeacher).toHaveBeenCalledWith(mockTeacher.id);
    });
  });
});
