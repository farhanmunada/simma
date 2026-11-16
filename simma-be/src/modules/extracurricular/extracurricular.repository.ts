import { eq, and, sql, ilike, desc, inArray } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { getDb } from "../../core/database/client.js";
import {
  extracurriculars,
  extracurricularMembers,
  extracurricularGrades,
  teachers,
  students,
  academicYears,
} from "../../db/schema/index.js";
import type {
  ExtracurricularEnriched,
  ExtracurricularMemberEnriched,
  ExtracurricularGradeEnriched,
  ExtracurricularStats,
  NewExtracurricularRow,
  NewExtracurricularMemberRow,
  NewExtracurricularGradeRow,
} from "./extracurricular.types.js";
import type {
  ExtracurricularQueryInput,
  ExtracurricularMemberQueryInput,
  ExtracurricularGradeQueryInput,
} from "./extracurricular.schema.js";

import {
  extracurricularMemberRepository,
  ExtracurricularMemberRepository,
} from "./extracurricular-member.repository.js";

export class ExtracurricularRepository {
  constructor(
    private readonly db: PostgresJsDatabase = getDb() as any,
    private readonly memberRepo: ExtracurricularMemberRepository = extracurricularMemberRepository
  ) {}

  async findExtracurriculars(filter?: ExtracurricularQueryInput): Promise<ExtracurricularEnriched[]> {
    const conditions = [];
    if (filter?.category) conditions.push(eq(extracurriculars.category, filter.category));
    if (filter?.isActive !== undefined) conditions.push(eq(extracurriculars.isActive, filter.isActive));
    if (filter?.search) conditions.push(ilike(extracurriculars.name, `%${filter.search}%`));

    const rows = await this.db
      .select({
        id: extracurriculars.id,
        code: extracurriculars.code,
        name: extracurriculars.name,
        category: extracurriculars.category,
        coachId: extracurriculars.coachId,
        scheduleDay: extracurriculars.scheduleDay,
        scheduleTime: extracurriculars.scheduleTime,
        venue: extracurriculars.venue,
        maxCapacity: extracurriculars.maxCapacity,
        isActive: extracurriculars.isActive,
        createdAt: extracurriculars.createdAt,
        updatedAt: extracurriculars.updatedAt,
        coachName: teachers.fullName,
        coachNuptk: teachers.nuptk,
      })
      .from(extracurriculars)
      .leftJoin(teachers, eq(extracurriculars.coachId, teachers.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(extracurriculars.name);

    return rows;
  }

  async findExtracurricularById(id: string): Promise<ExtracurricularEnriched | undefined> {
    const [row] = await this.db
      .select({
        id: extracurriculars.id,
        code: extracurriculars.code,
        name: extracurriculars.name,
        category: extracurriculars.category,
        coachId: extracurriculars.coachId,
        scheduleDay: extracurriculars.scheduleDay,
        scheduleTime: extracurriculars.scheduleTime,
        venue: extracurriculars.venue,
        maxCapacity: extracurriculars.maxCapacity,
        isActive: extracurriculars.isActive,
        createdAt: extracurriculars.createdAt,
        updatedAt: extracurriculars.updatedAt,
        coachName: teachers.fullName,
        coachNuptk: teachers.nuptk,
      })
      .from(extracurriculars)
      .leftJoin(teachers, eq(extracurriculars.coachId, teachers.id))
      .where(eq(extracurriculars.id, id));

    return row;
  }

  async findExtracurricularByCode(code: string) {
    const [row] = await this.db
      .select()
      .from(extracurriculars)
      .where(eq(extracurriculars.code, code));
    return row;
  }

  async createExtracurricular(data: NewExtracurricularRow) {
    const [created] = await this.db.insert(extracurriculars).values(data).returning();
    return created;
  }

  async updateExtracurricular(id: string, data: Partial<NewExtracurricularRow>) {
    const [updated] = await this.db
      .update(extracurriculars)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(extracurriculars.id, id))
      .returning();
    return updated;
  }

  async deleteExtracurricular(id: string): Promise<boolean> {
    const result = await this.db.delete(extracurriculars).where(eq(extracurriculars.id, id));
    return Boolean(result);
  }

  // Delegated member methods
  findMembers(filter?: ExtracurricularMemberQueryInput) {
    return this.memberRepo.findMembers(filter);
  }

  findMemberById(id: string) {
    return this.memberRepo.findMemberById(id);
  }

  findMemberByStudentAndPeriod(studentId: string, extracurricularId: string, academicYearId: string, semester: string) {
    return this.memberRepo.findMemberByStudentAndPeriod(studentId, extracurricularId, academicYearId, semester);
  }

  countStudentActiveEkskul(studentId: string, academicYearId: string, semester: string) {
    return this.memberRepo.countStudentActiveEkskul(studentId, academicYearId, semester);
  }

  countMembers(extracurricularId: string, academicYearId: string, semester: string) {
    return this.memberRepo.countMembers(extracurricularId, academicYearId, semester);
  }

  createMember(data: NewExtracurricularMemberRow) {
    return this.memberRepo.createMember(data);
  }

  updateMember(id: string, data: Partial<NewExtracurricularMemberRow>) {
    return this.memberRepo.updateMember(id, data);
  }

  deleteMember(id: string) {
    return this.memberRepo.deleteMember(id);
  }

  // Delegated grade methods
  findGrades(filter?: ExtracurricularGradeQueryInput) {
    return this.memberRepo.findGrades(filter);
  }

  findStudentGradesForRdm(studentId: string, academicYearId?: string, semester?: string) {
    return this.memberRepo.findStudentGradesForRdm(studentId, academicYearId, semester);
  }

  upsertGrade(data: NewExtracurricularGradeRow) {
    return this.memberRepo.upsertGrade(data);
  }

  batchUpsertGrades(items: NewExtracurricularGradeRow[]) {
    return this.memberRepo.batchUpsertGrades(items);
  }

  async getStats(): Promise<ExtracurricularStats> {
    const [ekskulCount] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(extracurriculars);
    const [memberCount] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(extracurricularMembers)
      .where(eq(extracurricularMembers.status, "ACTIVE"));
    const [gradeCount] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(extracurricularGrades);

    const catRows = await this.db
      .select({
        category: extracurriculars.category,
        count: sql<number>`count(*)::int`,
      })
      .from(extracurriculars)
      .groupBy(extracurriculars.category);

    const categoryDistribution: Record<string, number> = {};
    for (const r of catRows) {
      categoryDistribution[r.category] = Number(r.count);
    }

    return {
      totalExtracurriculars: Number(ekskulCount?.count ?? 0),
      totalMembers: Number(memberCount?.count ?? 0),
      totalGrades: Number(gradeCount?.count ?? 0),
      categoryDistribution,
    };
  }
}

export const extracurricularRepository = new ExtracurricularRepository();
export * from "./extracurricular-member.repository.js";
