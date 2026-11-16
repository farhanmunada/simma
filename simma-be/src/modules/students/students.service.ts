import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "../../core/errors/index.js";
import {
  StudentsRepository,
  studentsRepository,
} from "./students.repository.js";
import type {
  CreateStudentInput,
  UpdateStudentInput,
  StudentQueryParams,
  AddStudentParentInput,
  CreateAndLinkParentInput,
  AssignClassroomInput,
} from "./students.schema.js";
import type {
  Student,
  StudentParent,
  StudentParentDetail,
} from "./students.types.js";
import type { PaginatedResponse } from "@simma/shared";

const LOCKED_IDENTITY_FIELDS: (keyof UpdateStudentInput)[] = [
  "nik",
  "fullName",
  "birthPlace",
  "birthDate",
  "gender",
  "motherName",
];

export class StudentsService {
  constructor(private readonly repo: StudentsRepository = studentsRepository) {}

  async getStudents(
    query: StudentQueryParams = {},
  ): Promise<PaginatedResponse<Student>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { data, total } = await this.repo.findStudents({
      page,
      limit,
      search: query.search,
      status: query.status,
      gender: query.gender,
      classroomId: query.classroomId,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getStudentById(id: string): Promise<Student> {
    const student = await this.repo.findStudentById(id);
    if (!student) {
      throw new NotFoundError("Siswa", id);
    }
    return student;
  }

  async createStudent(input: CreateStudentInput): Promise<Student> {
    const existingNik = await this.repo.findStudentByNik(input.nik);
    if (existingNik) {
      throw new ConflictError("Siswa dengan NIK tersebut sudah terdaftar");
    }

    if (input.nisn) {
      const existingNisn = await this.repo.findStudentByNisn(input.nisn);
      if (existingNisn) {
        throw new ConflictError("Siswa dengan NISN tersebut sudah terdaftar");
      }
    }

    return this.repo.createStudent({
      nik: input.nik,
      nisn: input.nisn ?? null,
      nis: input.nis ?? null,
      fullName: input.fullName,
      birthPlace: input.birthPlace,
      birthDate: input.birthDate,
      gender: input.gender,
      motherName: input.motherName,
      status: input.status ?? "aktif",
      photoPath: input.photoPath ?? null,
      emisData: input.emisData ?? {},
    });
  }

  async updateStudent(
    id: string,
    input: UpdateStudentInput,
    userRole?: string,
  ): Promise<Student> {
    const existing = await this.getStudentById(id);

    // F-SIS-02: 6 locked identity fields — only super_admin can modify
    if (userRole && userRole !== "super_admin") {
      const attemptedLockedFields = LOCKED_IDENTITY_FIELDS.filter(
        (field) => input[field] !== undefined && input[field] !== (existing as Record<string, unknown>)[field],
      );

      if (attemptedLockedFields.length > 0) {
        throw new ForbiddenError(
          "Hanya Super Admin yang diizinkan mengubah 6 field identitas pokok siswa (NIK, Nama, Tempat/Tgl Lahir, Jenis Kelamin, Nama Ibu)",
        );
      }
    }

    if (input.nik && input.nik !== existing.nik) {
      const duplicateNik = await this.repo.findStudentByNik(input.nik);
      if (duplicateNik && duplicateNik.id !== id) {
        throw new ConflictError("Siswa dengan NIK tersebut sudah terdaftar");
      }
    }

    if (input.nisn && input.nisn !== existing.nisn) {
      const duplicateNisn = await this.repo.findStudentByNisn(input.nisn);
      if (duplicateNisn && duplicateNisn.id !== id) {
        throw new ConflictError("Siswa dengan NISN tersebut sudah terdaftar");
      }
    }

    const updated = await this.repo.updateStudent(id, input);
    if (!updated) {
      throw new NotFoundError("Siswa", id);
    }
    return updated;
  }

  async deleteStudent(id: string): Promise<void> {
    await this.getStudentById(id);
    const deleted = await this.repo.softDeleteStudent(id);
    if (!deleted) {
      throw new NotFoundError("Siswa", id);
    }
  }

  async getStudentParents(studentId: string): Promise<StudentParentDetail[]> {
    await this.getStudentById(studentId);
    return this.repo.findParentsByStudentId(studentId);
  }

  async addStudentParent(
    studentId: string,
    input: AddStudentParentInput,
  ): Promise<StudentParent> {
    await this.getStudentById(studentId);
    const parent = await this.repo.findParentById(input.parentId);
    if (!parent) {
      throw new NotFoundError("Orang tua", input.parentId);
    }

    return this.repo.linkStudentParent({
      studentId,
      parentId: input.parentId,
      relationType: input.relationType,
      isGuardian: input.isGuardian ?? false,
    });
  }

  async createAndLinkParent(
    studentId: string,
    input: CreateAndLinkParentInput,
  ): Promise<StudentParentDetail> {
    await this.getStudentById(studentId);
    return await this.repo.createAndLinkParent(
      studentId,
      {
        nik: input.parent.nik ?? null,
        name: input.parent.name,
        birthPlace: input.parent.birthPlace ?? null,
        birthDate: input.parent.birthDate ?? null,
        gender: input.parent.gender ?? null,
        education: input.parent.education ?? null,
        occupation: input.parent.occupation ?? null,
        income: input.parent.income ?? null,
        phone: input.parent.phone ?? null,
        address: input.parent.address ?? null,
        emisData: input.parent.emisData ?? {},
      },
      {
        relationType: input.relationType,
        isGuardian: input.isGuardian ?? false,
      },
    );
  }

  async assignClassroom(
    input: AssignClassroomInput,
  ): Promise<{ classroomId: string; assignedCount: number }> {
    const classroom = await this.repo.findClassroomById(input.classroomId);
    if (!classroom) {
      throw new NotFoundError("Kelas", input.classroomId);
    }

    for (const studentId of input.studentIds) {
      await this.getStudentById(studentId);
    }

    const assignedCount = await this.repo.assignStudentsToClassroom(
      input.classroomId,
      input.studentIds,
    );

    return {
      classroomId: input.classroomId,
      assignedCount,
    };
  }
}

export const studentsService = new StudentsService();
