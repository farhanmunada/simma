// Set environment variables before any module loads
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://simma:simma123@localhost:5432/simma_test";
process.env.JWT_ACCESS_SECRET = "test-jwt-access-secret-minimum-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-minimum-32-chars-long";
process.env.JWT_ACCESS_EXPIRY = "15m";
process.env.JWT_REFRESH_EXPIRY = "7d";

import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { StudentsService } from "./students.service.js";
import { StudentsRepository } from "./students.repository.js";
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "../../core/errors/index.js";
import type {
  Student,
  Parent,
  StudentParent,
  StudentParentDetail,
} from "./students.types.js";
import { signAccessToken } from "../../core/auth/jwt.js";
import { buildApp } from "../../app.js";

const mockStudent: Student = {
  id: "018f3a2c-1234-7000-8000-000000000001",
  nik: "3515123456780001",
  nisn: "0051234567",
  nis: "2024001",
  fullName: "Ahmad Dahlan",
  birthPlace: "Sidoarjo",
  birthDate: "2007-05-10",
  gender: "L",
  motherName: "Siti Aminah",
  status: "aktif",
  photoPath: null,
  emisData: {},
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockParent: Parent = {
  id: "018f3a2c-1234-7000-8000-000000000002",
  nik: "3515123456780002",
  name: "Budi Santoso",
  birthPlace: "Surabaya",
  birthDate: "1978-08-17",
  gender: "L",
  education: "S1",
  occupation: "PNS",
  income: "5.000.000 - 10.000.000",
  phone: "081234567890",
  address: "Jl. Merdeka No. 10",
  emisData: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStudentParentDetail: StudentParentDetail = {
  ...mockParent,
  relationType: "ayah",
  isGuardian: true,
};

const mockStudentParent: StudentParent = {
  id: "018f3a2c-1234-7000-8000-000000000003",
  studentId: mockStudent.id,
  parentId: mockParent.id,
  relationType: "ayah",
  isGuardian: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("StudentsService", () => {
  let repo: StudentsRepository;
  let service: StudentsService;

  beforeEach(() => {
    repo = new StudentsRepository();
    service = new StudentsService(repo);
  });

  describe("getStudents", () => {
    it("should return paginated students list", async () => {
      vi.spyOn(repo, "findStudents").mockResolvedValue({
        data: [mockStudent],
        total: 1,
      });

      const result = await service.getStudents({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].fullName).toBe("Ahmad Dahlan");
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it("should pass filters to repository", async () => {
      const spy = vi.spyOn(repo, "findStudents").mockResolvedValue({
        data: [],
        total: 0,
      });

      await service.getStudents({
        search: "Ahmad",
        status: "aktif",
        gender: "L",
      });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "Ahmad",
          status: "aktif",
          gender: "L",
        }),
      );
    });
  });

  describe("getStudentById", () => {
    it("should return student if found", async () => {
      vi.spyOn(repo, "findStudentById").mockResolvedValue(mockStudent);
      const result = await service.getStudentById(mockStudent.id);
      expect(result).toEqual(mockStudent);
    });

    it("should throw NotFoundError if student not found", async () => {
      vi.spyOn(repo, "findStudentById").mockResolvedValue(null);
      await expect(service.getStudentById("non-existent-id")).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("createStudent", () => {
    it("should create student successfully", async () => {
      vi.spyOn(repo, "findStudentByNik").mockResolvedValue(null);
      vi.spyOn(repo, "findStudentByNisn").mockResolvedValue(null);
      vi.spyOn(repo, "createStudent").mockResolvedValue(mockStudent);

      const result = await service.createStudent({
        nik: mockStudent.nik,
        nisn: mockStudent.nisn,
        nis: mockStudent.nis,
        fullName: mockStudent.fullName,
        birthPlace: mockStudent.birthPlace,
        birthDate: mockStudent.birthDate,
        gender: "L",
        motherName: mockStudent.motherName,
      });

      expect(result).toEqual(mockStudent);
    });

    it("should throw ConflictError if NIK already exists", async () => {
      vi.spyOn(repo, "findStudentByNik").mockResolvedValue(mockStudent);

      await expect(
        service.createStudent({
          nik: mockStudent.nik,
          fullName: "Ahmad Dahlan",
          birthPlace: "Sidoarjo",
          birthDate: "2007-05-10",
          gender: "L",
          motherName: "Siti Aminah",
        }),
      ).rejects.toThrow(ConflictError);
    });

    it("should throw ConflictError if NISN already exists", async () => {
      vi.spyOn(repo, "findStudentByNik").mockResolvedValue(null);
      vi.spyOn(repo, "findStudentByNisn").mockResolvedValue(mockStudent);

      await expect(
        service.createStudent({
          nik: "3515123456789999",
          nisn: mockStudent.nisn,
          fullName: "Ahmad Dahlan",
          birthPlace: "Sidoarjo",
          birthDate: "2007-05-10",
          gender: "L",
          motherName: "Siti Aminah",
        }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe("updateStudent", () => {
    it("should update student successfully as super_admin", async () => {
      vi.spyOn(repo, "findStudentById").mockResolvedValue(mockStudent);
      vi.spyOn(repo, "findStudentByNik").mockResolvedValue(null);
      vi.spyOn(repo, "findStudentByNisn").mockResolvedValue(null);
      vi.spyOn(repo, "updateStudent").mockResolvedValue({
        ...mockStudent,
        fullName: "Ahmad Dahlan Baru",
      });

      const result = await service.updateStudent(
        mockStudent.id,
        { fullName: "Ahmad Dahlan Baru" },
        "super_admin",
      );

      expect(result.fullName).toBe("Ahmad Dahlan Baru");
    });

    it("should throw ForbiddenError when non-super_admin tries to edit locked fields (F-SIS-02)", async () => {
      vi.spyOn(repo, "findStudentById").mockResolvedValue(mockStudent);

      await expect(
        service.updateStudent(
          mockStudent.id,
          { fullName: "Nama Diganti Oleh TU" },
          "admin_tu",
        ),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should allow non-super_admin to update non-locked fields (e.g. status, photoPath)", async () => {
      vi.spyOn(repo, "findStudentById").mockResolvedValue(mockStudent);
      vi.spyOn(repo, "updateStudent").mockResolvedValue({
        ...mockStudent,
        status: "tidak_aktif",
      });

      const result = await service.updateStudent(
        mockStudent.id,
        { status: "tidak_aktif" },
        "admin_tu",
      );

      expect(result.status).toBe("tidak_aktif");
    });

    it("should throw ConflictError if updated NIK belongs to another student", async () => {
      vi.spyOn(repo, "findStudentById").mockResolvedValue(mockStudent);
      vi.spyOn(repo, "findStudentByNik").mockResolvedValue({
        ...mockStudent,
        id: "another-student-id",
        nik: "3515999999990001",
      });

      await expect(
        service.updateStudent(
          mockStudent.id,
          { nik: "3515999999990001" },
          "super_admin",
        ),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe("deleteStudent", () => {
    it("should soft delete student", async () => {
      vi.spyOn(repo, "findStudentById").mockResolvedValue(mockStudent);
      vi.spyOn(repo, "softDeleteStudent").mockResolvedValue({
        ...mockStudent,
        deletedAt: new Date(),
      });

      await expect(service.deleteStudent(mockStudent.id)).resolves.not.toThrow();
    });

    it("should throw NotFoundError if student not found", async () => {
      vi.spyOn(repo, "findStudentById").mockResolvedValue(null);
      await expect(service.deleteStudent("non-existent-id")).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("getStudentParents", () => {
    it("should return parents of student", async () => {
      vi.spyOn(repo, "findStudentById").mockResolvedValue(mockStudent);
      vi.spyOn(repo, "findParentsByStudentId").mockResolvedValue([
        mockStudentParentDetail,
      ]);

      const result = await service.getStudentParents(mockStudent.id);
      expect(result).toHaveLength(1);
      expect(result[0].relationType).toBe("ayah");
    });

    it("should throw NotFoundError if student not found", async () => {
      vi.spyOn(repo, "findStudentById").mockResolvedValue(null);
      await expect(
        service.getStudentParents("non-existent-id"),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("addStudentParent & createAndLinkParent", () => {
    it("should link existing parent to student", async () => {
      vi.spyOn(repo, "findStudentById").mockResolvedValue(mockStudent);
      vi.spyOn(repo, "findParentById").mockResolvedValue(mockParent);
      vi.spyOn(repo, "linkStudentParent").mockResolvedValue(mockStudentParent);

      const result = await service.addStudentParent(mockStudent.id, {
        parentId: mockParent.id,
        relationType: "ayah",
        isGuardian: true,
      });

      expect(result.relationType).toBe("ayah");
    });

    it("should throw NotFoundError if parent not found", async () => {
      vi.spyOn(repo, "findStudentById").mockResolvedValue(mockStudent);
      vi.spyOn(repo, "findParentById").mockResolvedValue(null);

      await expect(
        service.addStudentParent(mockStudent.id, {
          parentId: "non-existent-parent",
          relationType: "ayah",
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("should create new parent and link to student", async () => {
      vi.spyOn(repo, "findStudentById").mockResolvedValue(mockStudent);
      vi.spyOn(repo, "createParent").mockResolvedValue(mockParent);
      vi.spyOn(repo, "linkStudentParent").mockResolvedValue(mockStudentParent);

      const result = await service.createAndLinkParent(mockStudent.id, {
        relationType: "ayah",
        isGuardian: true,
        parent: {
          name: "Budi Santoso",
        },
      });

      expect(result.name).toBe("Budi Santoso");
      expect(result.relationType).toBe("ayah");
    });
  });

  describe("assignClassroom", () => {
    it("should assign students to classroom", async () => {
      vi.spyOn(repo, "findClassroomById").mockResolvedValue({
        id: "classroom-id-1",
        name: "X-A",
      } as any);
      vi.spyOn(repo, "findStudentById").mockResolvedValue(mockStudent);
      vi.spyOn(repo, "assignStudentsToClassroom").mockResolvedValue(1);

      const result = await service.assignClassroom({
        classroomId: "classroom-id-1",
        studentIds: [mockStudent.id],
      });

      expect(result.classroomId).toBe("classroom-id-1");
      expect(result.assignedCount).toBe(1);
    });

    it("should throw NotFoundError if classroom not found", async () => {
      vi.spyOn(repo, "findClassroomById").mockResolvedValue(null);

      await expect(
        service.assignClassroom({
          classroomId: "non-existent-class",
          studentIds: [mockStudent.id],
        }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});

describe("Student HTTP Endpoints (Integration)", () => {
  let app: FastifyInstance;
  let adminToken: string;
  let teacherToken: string;
  let tuToken: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();

    adminToken = await signAccessToken({
      sub: "admin-id",
      username: "admin",
      role: "super_admin",
    });

    tuToken = await signAccessToken({
      sub: "tu-id",
      username: "tu_user",
      role: "admin_tu",
    });

    teacherToken = await signAccessToken({
      sub: "teacher-id",
      username: "guru_user",
      role: "guru_mapel",
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/v1/students should return 401 without token", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/students",
    });

    expect(res.statusCode).toBe(401);
  });

  it("POST /api/v1/students should return 403 when user is guru_mapel", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/students",
      headers: {
        authorization: `Bearer ${teacherToken}`,
      },
      payload: {
        nik: "3515123456780001",
        fullName: "Siswa Baru",
        birthPlace: "Sidoarjo",
        birthDate: "2007-01-01",
        gender: "L",
        motherName: "Ibu Baru",
      },
    });

    expect(res.statusCode).toBe(403);
  });

  it("POST /api/v1/students should reject invalid body with 400", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/students",
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        nik: "123", // invalid length
      },
    });

    expect(res.statusCode).toBe(400);
  });
});
