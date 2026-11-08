import { NotFoundError, ConflictError } from "../../core/errors/index.js";
import { SetupRepository, setupRepository } from "./setup.repository.js";
import type {
  CreateInstitutionInput,
  UpdateInstitutionInput,
  CreateAcademicYearInput,
  UpdateAcademicYearInput,
  CreateSemesterInput,
  UpdateSemesterInput,
  CreateClassroomInput,
  UpdateClassroomInput,
  CreateSubjectInput,
  UpdateSubjectInput,
  CreateTeacherInput,
  UpdateTeacherInput,
  SetupQueryParams,
} from "./setup.schema.js";
import type {
  Institution,
  AcademicYear,
  Semester,
  Classroom,
  Subject,
  Teacher,
} from "./setup.types.js";
import type { PaginatedResponse } from "@simma/shared";

export class SetupService {
  constructor(private readonly repo: SetupRepository = setupRepository) {}

  // --- Institutions ---
  async getInstitution(): Promise<Institution> {
    const institution = await this.repo.findFirstInstitution();
    if (!institution) {
      throw new NotFoundError("Data profil madrasah");
    }
    return institution;
  }

  async getInstitutionById(id: string): Promise<Institution> {
    const institution = await this.repo.findInstitutionById(id);
    if (!institution) {
      throw new NotFoundError("Madrasah", id);
    }
    return institution;
  }

  async createInstitution(data: CreateInstitutionInput): Promise<Institution> {
    return this.repo.createInstitution({
      nsm: data.nsm,
      npsn: data.npsn,
      name: data.name,
      status: data.status,
      address: data.address,
      logoPath: data.logoPath ?? null,
      emisData: data.emisData ?? {},
    });
  }

  async updateInstitution(
    id: string,
    data: UpdateInstitutionInput,
  ): Promise<Institution> {
    await this.getInstitutionById(id);
    const updated = await this.repo.updateInstitution(id, data);
    if (!updated) {
      throw new NotFoundError("Madrasah", id);
    }
    return updated;
  }

  // --- Academic Years ---
  async getAcademicYears(
    query: SetupQueryParams = {},
  ): Promise<PaginatedResponse<AcademicYear>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { data, total } = await this.repo.findAcademicYears({
      page,
      limit,
      search: query.search,
      isActive: query.isActive,
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

  async getAcademicYearById(id: string): Promise<AcademicYear> {
    const item = await this.repo.findAcademicYearById(id);
    if (!item) {
      throw new NotFoundError("Tahun Ajaran", id);
    }
    return item;
  }

  async createAcademicYear(
    data: CreateAcademicYearInput,
  ): Promise<AcademicYear> {
    return this.repo.createAcademicYear({
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive ?? false,
    });
  }

  async updateAcademicYear(
    id: string,
    data: UpdateAcademicYearInput,
  ): Promise<AcademicYear> {
    await this.getAcademicYearById(id);
    const updated = await this.repo.updateAcademicYear(id, data);
    if (!updated) {
      throw new NotFoundError("Tahun Ajaran", id);
    }
    return updated;
  }

  async deleteAcademicYear(id: string): Promise<void> {
    await this.getAcademicYearById(id);
    const deleted = await this.repo.deleteAcademicYear(id);
    if (!deleted) {
      throw new NotFoundError("Tahun Ajaran", id);
    }
  }

  async setActiveAcademicYear(id: string): Promise<AcademicYear> {
    await this.getAcademicYearById(id);
    const updated = await this.repo.setActiveAcademicYear(id);
    if (!updated) {
      throw new NotFoundError("Tahun Ajaran", id);
    }
    return updated;
  }

  // --- Semesters ---
  async getSemesters(
    query: SetupQueryParams = {},
  ): Promise<PaginatedResponse<Semester>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { data, total } = await this.repo.findSemesters({
      page,
      limit,
      academicYearId: query.academicYearId,
      isActive: query.isActive,
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

  async getSemesterById(id: string): Promise<Semester> {
    const item = await this.repo.findSemesterById(id);
    if (!item) {
      throw new NotFoundError("Semester", id);
    }
    return item;
  }

  async createSemester(data: CreateSemesterInput): Promise<Semester> {
    // Verify academic year exists
    await this.getAcademicYearById(data.academicYearId);
    return this.repo.createSemester({
      academicYearId: data.academicYearId,
      type: data.type,
      isActive: data.isActive ?? false,
      startDate: data.startDate,
      endDate: data.endDate,
    });
  }

  async updateSemester(
    id: string,
    data: UpdateSemesterInput,
  ): Promise<Semester> {
    await this.getSemesterById(id);
    if (data.academicYearId) {
      await this.getAcademicYearById(data.academicYearId);
    }
    const updated = await this.repo.updateSemester(id, data);
    if (!updated) {
      throw new NotFoundError("Semester", id);
    }
    return updated;
  }

  async deleteSemester(id: string): Promise<void> {
    await this.getSemesterById(id);
    const deleted = await this.repo.deleteSemester(id);
    if (!deleted) {
      throw new NotFoundError("Semester", id);
    }
  }

  async setActiveSemester(id: string): Promise<Semester> {
    await this.getSemesterById(id);
    const updated = await this.repo.setActiveSemester(id);
    if (!updated) {
      throw new NotFoundError("Semester", id);
    }
    return updated;
  }

  // --- Classrooms ---
  async getClassrooms(
    query: SetupQueryParams = {},
  ): Promise<PaginatedResponse<Classroom>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { data, total } = await this.repo.findClassrooms({
      page,
      limit,
      semesterId: query.semesterId,
      gradeLevel: query.gradeLevel,
      search: query.search,
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

  async getClassroomById(id: string): Promise<Classroom> {
    const item = await this.repo.findClassroomById(id);
    if (!item) {
      throw new NotFoundError("Kelas", id);
    }
    return item;
  }

  async createClassroom(data: CreateClassroomInput): Promise<Classroom> {
    // Verify semester exists
    await this.getSemesterById(data.semesterId);
    if (data.homeroomTeacherId) {
      await this.getTeacherById(data.homeroomTeacherId);
    }

    return this.repo.createClassroom({
      semesterId: data.semesterId,
      name: data.name,
      gradeLevel: data.gradeLevel,
      homeroomTeacherId: data.homeroomTeacherId ?? null,
      capacity: data.capacity ?? 36,
    });
  }

  async updateClassroom(
    id: string,
    data: UpdateClassroomInput,
  ): Promise<Classroom> {
    await this.getClassroomById(id);
    if (data.semesterId) {
      await this.getSemesterById(data.semesterId);
    }
    if (data.homeroomTeacherId) {
      await this.getTeacherById(data.homeroomTeacherId);
    }

    const updated = await this.repo.updateClassroom(id, data);
    if (!updated) {
      throw new NotFoundError("Kelas", id);
    }
    return updated;
  }

  async deleteClassroom(id: string): Promise<void> {
    await this.getClassroomById(id);
    const deleted = await this.repo.deleteClassroom(id);
    if (!deleted) {
      throw new NotFoundError("Kelas", id);
    }
  }

  // --- Subjects ---
  async getSubjects(
    query: SetupQueryParams = {},
  ): Promise<PaginatedResponse<Subject>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { data, total } = await this.repo.findSubjects({
      page,
      limit,
      phase: query.phase,
      group: undefined,
      search: query.search,
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

  async getSubjectById(id: string): Promise<Subject> {
    const item = await this.repo.findSubjectById(id);
    if (!item) {
      throw new NotFoundError("Mata Pelajaran", id);
    }
    return item;
  }

  async createSubject(data: CreateSubjectInput): Promise<Subject> {
    const existing = await this.repo.findSubjectByCode(data.code);
    if (existing) {
      throw new ConflictError(`Mata pelajaran dengan kode '${data.code}' sudah terdaftar`);
    }

    return this.repo.createSubject({
      code: data.code,
      name: data.name,
      group: data.group,
      jpPerWeek: data.jpPerWeek,
      isRequired: data.isRequired ?? true,
      phase: data.phase,
    });
  }

  async updateSubject(
    id: string,
    data: UpdateSubjectInput,
  ): Promise<Subject> {
    const current = await this.getSubjectById(id);
    if (data.code && data.code !== current.code) {
      const existing = await this.repo.findSubjectByCode(data.code);
      if (existing) {
        throw new ConflictError(`Mata pelajaran dengan kode '${data.code}' sudah terdaftar`);
      }
    }

    const updated = await this.repo.updateSubject(id, data);
    if (!updated) {
      throw new NotFoundError("Mata Pelajaran", id);
    }
    return updated;
  }

  async deleteSubject(id: string): Promise<void> {
    await this.getSubjectById(id);
    const deleted = await this.repo.deleteSubject(id);
    if (!deleted) {
      throw new NotFoundError("Mata Pelajaran", id);
    }
  }

  // --- Teachers ---
  async getTeachers(
    query: SetupQueryParams = {},
  ): Promise<PaginatedResponse<Teacher>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { data, total } = await this.repo.findTeachers({
      page,
      limit,
      search: query.search,
      employmentType: query.employmentType,
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

  async getTeacherById(id: string): Promise<Teacher> {
    const item = await this.repo.findTeacherById(id);
    if (!item) {
      throw new NotFoundError("Guru", id);
    }
    return item;
  }

  async createTeacher(data: CreateTeacherInput): Promise<Teacher> {
    const existing = await this.repo.findTeacherByNik(data.nik);
    if (existing && !existing.deletedAt) {
      throw new ConflictError(`Guru dengan NIK '${data.nik}' sudah terdaftar`);
    }

    return this.repo.createTeacher({
      userId: data.userId ?? null,
      nik: data.nik,
      nuptk: data.nuptk ?? null,
      fullName: data.fullName,
      employmentType: data.employmentType,
      certification: data.certification ?? null,
      emisData: data.emisData ?? {},
    });
  }

  async updateTeacher(
    id: string,
    data: UpdateTeacherInput,
  ): Promise<Teacher> {
    const current = await this.getTeacherById(id);
    if (data.nik && data.nik !== current.nik) {
      const existing = await this.repo.findTeacherByNik(data.nik);
      if (existing && existing.id !== id && !existing.deletedAt) {
        throw new ConflictError(`Guru dengan NIK '${data.nik}' sudah terdaftar`);
      }
    }

    const updated = await this.repo.updateTeacher(id, data);
    if (!updated) {
      throw new NotFoundError("Guru", id);
    }
    return updated;
  }

  async deleteTeacher(id: string): Promise<void> {
    await this.getTeacherById(id);
    const deleted = await this.repo.softDeleteTeacher(id);
    if (!deleted) {
      throw new NotFoundError("Guru", id);
    }
  }
}

export const setupService = new SetupService();
