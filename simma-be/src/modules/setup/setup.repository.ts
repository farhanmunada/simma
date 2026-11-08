import { eq, and, or, ilike, count, desc, isNull } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import {
  institutions,
  academicYears,
  semesters,
  classrooms,
  subjects,
  teachers,
} from "../../db/schema/setup";
import type {
  Institution,
  NewInstitution,
  AcademicYear,
  NewAcademicYear,
  Semester,
  NewSemester,
  Classroom,
  NewClassroom,
  Subject,
  NewSubject,
  Teacher,
  NewTeacher,
} from "./setup.types.js";

export class SetupRepository {
  // --- Institutions ---
  async findFirstInstitution(): Promise<Institution | null> {
    const db = getDb();
    const [row] = await db.select().from(institutions).limit(1);
    return row ?? null;
  }

  async findInstitutionById(id: string): Promise<Institution | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(institutions)
      .where(eq(institutions.id, id))
      .limit(1);
    return row ?? null;
  }

  async createInstitution(data: NewInstitution): Promise<Institution> {
    const db = getDb();
    const [row] = await db.insert(institutions).values(data).returning();
    return row;
  }

  async updateInstitution(
    id: string,
    data: Partial<NewInstitution>,
  ): Promise<Institution | null> {
    const db = getDb();
    const [row] = await db
      .update(institutions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(institutions.id, id))
      .returning();
    return row ?? null;
  }

  // --- Academic Years ---
  async findAcademicYears(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ data: AcademicYear[]; total: number }> {
    const db = getDb();
    const conditions = [];

    if (params.search) {
      conditions.push(ilike(academicYears.name, `%${params.search}%`));
    }
    if (params.isActive !== undefined) {
      conditions.push(eq(academicYears.isActive, params.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (params.page - 1) * params.limit;

    const [totalRow] = await db
      .select({ count: count() })
      .from(academicYears)
      .where(whereClause);
    const total = totalRow ? Number(totalRow.count) : 0;

    const rows = await db
      .select()
      .from(academicYears)
      .where(whereClause)
      .orderBy(desc(academicYears.createdAt))
      .limit(params.limit)
      .offset(offset);

    return { data: rows, total };
  }

  async findAcademicYearById(id: string): Promise<AcademicYear | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(academicYears)
      .where(eq(academicYears.id, id))
      .limit(1);
    return row ?? null;
  }

  async createAcademicYear(data: NewAcademicYear): Promise<AcademicYear> {
    const db = getDb();
    const [row] = await db.insert(academicYears).values(data).returning();
    return row;
  }

  async updateAcademicYear(
    id: string,
    data: Partial<NewAcademicYear>,
  ): Promise<AcademicYear | null> {
    const db = getDb();
    const [row] = await db
      .update(academicYears)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(academicYears.id, id))
      .returning();
    return row ?? null;
  }

  async deleteAcademicYear(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(academicYears)
      .where(eq(academicYears.id, id))
      .returning();
    return result.length > 0;
  }

  async setActiveAcademicYear(id: string): Promise<AcademicYear | null> {
    const db = getDb();
    await db
      .update(academicYears)
      .set({ isActive: false, updatedAt: new Date() });
    const [row] = await db
      .update(academicYears)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(academicYears.id, id))
      .returning();
    return row ?? null;
  }

  // --- Semesters ---
  async findSemesters(params: {
    page: number;
    limit: number;
    academicYearId?: string;
    isActive?: boolean;
  }): Promise<{ data: Semester[]; total: number }> {
    const db = getDb();
    const conditions = [];

    if (params.academicYearId) {
      conditions.push(eq(semesters.academicYearId, params.academicYearId));
    }
    if (params.isActive !== undefined) {
      conditions.push(eq(semesters.isActive, params.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (params.page - 1) * params.limit;

    const [totalRow] = await db
      .select({ count: count() })
      .from(semesters)
      .where(whereClause);
    const total = totalRow ? Number(totalRow.count) : 0;

    const rows = await db
      .select()
      .from(semesters)
      .where(whereClause)
      .orderBy(desc(semesters.createdAt))
      .limit(params.limit)
      .offset(offset);

    return { data: rows, total };
  }

  async findSemesterById(id: string): Promise<Semester | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(semesters)
      .where(eq(semesters.id, id))
      .limit(1);
    return row ?? null;
  }

  async createSemester(data: NewSemester): Promise<Semester> {
    const db = getDb();
    const [row] = await db.insert(semesters).values(data).returning();
    return row;
  }

  async updateSemester(
    id: string,
    data: Partial<NewSemester>,
  ): Promise<Semester | null> {
    const db = getDb();
    const [row] = await db
      .update(semesters)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(semesters.id, id))
      .returning();
    return row ?? null;
  }

  async deleteSemester(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(semesters)
      .where(eq(semesters.id, id))
      .returning();
    return result.length > 0;
  }

  async setActiveSemester(id: string): Promise<Semester | null> {
    const db = getDb();
    await db.update(semesters).set({ isActive: false, updatedAt: new Date() });
    const [row] = await db
      .update(semesters)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(semesters.id, id))
      .returning();
    return row ?? null;
  }

  // --- Classrooms ---
  async findClassrooms(params: {
    page: number;
    limit: number;
    semesterId?: string;
    gradeLevel?: number;
    search?: string;
  }): Promise<{ data: Classroom[]; total: number }> {
    const db = getDb();
    const conditions = [];

    if (params.semesterId) {
      conditions.push(eq(classrooms.semesterId, params.semesterId));
    }
    if (params.gradeLevel) {
      conditions.push(eq(classrooms.gradeLevel, params.gradeLevel));
    }
    if (params.search) {
      conditions.push(ilike(classrooms.name, `%${params.search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (params.page - 1) * params.limit;

    const [totalRow] = await db
      .select({ count: count() })
      .from(classrooms)
      .where(whereClause);
    const total = totalRow ? Number(totalRow.count) : 0;

    const rows = await db
      .select()
      .from(classrooms)
      .where(whereClause)
      .orderBy(desc(classrooms.createdAt))
      .limit(params.limit)
      .offset(offset);

    return { data: rows, total };
  }

  async findClassroomById(id: string): Promise<Classroom | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(classrooms)
      .where(eq(classrooms.id, id))
      .limit(1);
    return row ?? null;
  }

  async createClassroom(data: NewClassroom): Promise<Classroom> {
    const db = getDb();
    const [row] = await db.insert(classrooms).values(data).returning();
    return row;
  }

  async updateClassroom(
    id: string,
    data: Partial<NewClassroom>,
  ): Promise<Classroom | null> {
    const db = getDb();
    const [row] = await db
      .update(classrooms)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(classrooms.id, id))
      .returning();
    return row ?? null;
  }

  async deleteClassroom(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(classrooms)
      .where(eq(classrooms.id, id))
      .returning();
    return result.length > 0;
  }

  // --- Subjects ---
  async findSubjects(params: {
    page: number;
    limit: number;
    phase?: string;
    group?: string;
    search?: string;
  }): Promise<{ data: Subject[]; total: number }> {
    const db = getDb();
    const conditions = [];

    if (params.phase) {
      conditions.push(eq(subjects.phase, params.phase));
    }
    if (params.group) {
      conditions.push(eq(subjects.group, params.group));
    }
    if (params.search) {
      conditions.push(
        or(
          ilike(subjects.name, `%${params.search}%`),
          ilike(subjects.code, `%${params.search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (params.page - 1) * params.limit;

    const [totalRow] = await db
      .select({ count: count() })
      .from(subjects)
      .where(whereClause);
    const total = totalRow ? Number(totalRow.count) : 0;

    const rows = await db
      .select()
      .from(subjects)
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(params.limit)
      .offset(offset);

    return { data: rows, total };
  }

  async findSubjectById(id: string): Promise<Subject | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.id, id))
      .limit(1);
    return row ?? null;
  }

  async findSubjectByCode(code: string): Promise<Subject | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(subjects)
      .where(eq(subjects.code, code))
      .limit(1);
    return row ?? null;
  }

  async createSubject(data: NewSubject): Promise<Subject> {
    const db = getDb();
    const [row] = await db.insert(subjects).values(data).returning();
    return row;
  }

  async updateSubject(
    id: string,
    data: Partial<NewSubject>,
  ): Promise<Subject | null> {
    const db = getDb();
    const [row] = await db
      .update(subjects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subjects.id, id))
      .returning();
    return row ?? null;
  }

  async deleteSubject(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(subjects)
      .where(eq(subjects.id, id))
      .returning();
    return result.length > 0;
  }

  // --- Teachers ---
  async findTeachers(params: {
    page: number;
    limit: number;
    search?: string;
    employmentType?: string;
    includeDeleted?: boolean;
  }): Promise<{ data: Teacher[]; total: number }> {
    const db = getDb();
    const conditions = [];

    if (!params.includeDeleted) {
      conditions.push(isNull(teachers.deletedAt));
    }
    if (params.employmentType) {
      conditions.push(eq(teachers.employmentType, params.employmentType));
    }
    if (params.search) {
      conditions.push(
        or(
          ilike(teachers.fullName, `%${params.search}%`),
          ilike(teachers.nik, `%${params.search}%`),
        ),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (params.page - 1) * params.limit;

    const [totalRow] = await db
      .select({ count: count() })
      .from(teachers)
      .where(whereClause);
    const total = totalRow ? Number(totalRow.count) : 0;

    const rows = await db
      .select()
      .from(teachers)
      .where(whereClause)
      .orderBy(desc(teachers.createdAt))
      .limit(params.limit)
      .offset(offset);

    return { data: rows, total };
  }

  async findTeacherById(
    id: string,
    includeDeleted = false,
  ): Promise<Teacher | null> {
    const db = getDb();
    const conditions = [eq(teachers.id, id)];
    if (!includeDeleted) {
      conditions.push(isNull(teachers.deletedAt));
    }
    const [row] = await db
      .select()
      .from(teachers)
      .where(and(...conditions))
      .limit(1);
    return row ?? null;
  }

  async findTeacherByNik(nik: string): Promise<Teacher | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(teachers)
      .where(eq(teachers.nik, nik))
      .limit(1);
    return row ?? null;
  }

  async createTeacher(data: NewTeacher): Promise<Teacher> {
    const db = getDb();
    const [row] = await db.insert(teachers).values(data).returning();
    return row;
  }

  async updateTeacher(
    id: string,
    data: Partial<NewTeacher>,
  ): Promise<Teacher | null> {
    const db = getDb();
    const [row] = await db
      .update(teachers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teachers.id, id))
      .returning();
    return row ?? null;
  }

  async softDeleteTeacher(id: string): Promise<boolean> {
    const db = getDb();
    const [row] = await db
      .update(teachers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(teachers.id, id))
      .returning();
    return Boolean(row);
  }
}

export const setupRepository = new SetupRepository();
