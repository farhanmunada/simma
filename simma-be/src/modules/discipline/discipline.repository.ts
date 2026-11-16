import { eq, and, desc, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { getDb } from "../../core/database/client.js";
import {
  disciplineRules,
  studentInfractions,
  counselingSessions,
  parentSummons,
  students,
  users,
  classrooms,
  classStudents,
  institutions,
} from "../../db/schema/index.js";
import type {
  DisciplineRule,
  NewDisciplineRule,
  StudentInfractionRecord,
  NewStudentInfractionRecord,
  CounselingSessionRecord,
  NewCounselingSessionRecord,
  ParentSummonRecord,
  NewParentSummonRecord,
} from "./discipline.types.js";
import type { QueryStudentInfractionsInput } from "@simma/shared";

export class DisciplineRepository {
  constructor(private readonly db: PostgresJsDatabase = getDb() as any) {}

  // --- Rules Catalog ---
  async findAllRules(type?: string, category?: string): Promise<DisciplineRule[]> {
    const conditions = [];
    if (type) conditions.push(eq(disciplineRules.type, type as any));
    if (category) conditions.push(eq(disciplineRules.category, category as any));

    return this.db
      .select()
      .from(disciplineRules)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(disciplineRules.points, disciplineRules.code);
  }

  async findRuleById(id: string): Promise<DisciplineRule | undefined> {
    const [rule] = await this.db
      .select()
      .from(disciplineRules)
      .where(eq(disciplineRules.id, id));
    return rule;
  }

  async createRule(data: NewDisciplineRule): Promise<DisciplineRule> {
    const [created] = await this.db.insert(disciplineRules).values(data).returning();
    return created;
  }

  async updateRule(id: string, data: Partial<NewDisciplineRule>): Promise<DisciplineRule | undefined> {
    const [updated] = await this.db
      .update(disciplineRules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(disciplineRules.id, id))
      .returning();
    return updated;
  }

  async deleteRule(id: string): Promise<boolean> {
    const res = await this.db.delete(disciplineRules).where(eq(disciplineRules.id, id)).returning();
    return res.length > 0;
  }

  // --- Infractions & Merits ---
  async findInfractions(filter: QueryStudentInfractionsInput) {
    const conditions = [];
    if (filter.studentId) conditions.push(eq(studentInfractions.studentId, filter.studentId));
    if (filter.type) conditions.push(eq(studentInfractions.type, filter.type));
    if (filter.category) conditions.push(eq(studentInfractions.category, filter.category));
    if (filter.status) conditions.push(eq(studentInfractions.status, filter.status));

    const rows = await this.db
      .select({
        infraction: studentInfractions,
        studentName: students.fullName,
        nisn: students.nisn,
        nis: students.nis,
        ruleCode: disciplineRules.code,
        ruleName: disciplineRules.name,
      })
      .from(studentInfractions)
      .innerJoin(students, eq(studentInfractions.studentId, students.id))
      .leftJoin(disciplineRules, eq(studentInfractions.ruleId, disciplineRules.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(studentInfractions.date), desc(studentInfractions.createdAt));

    return rows.map((r) => ({
      ...r.infraction,
      studentName: r.studentName,
      nisn: r.nisn,
      nis: r.nis,
      ruleCode: r.ruleCode,
      ruleName: r.ruleName,
    }));
  }

  async findInfractionById(id: string): Promise<StudentInfractionRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(studentInfractions)
      .where(eq(studentInfractions.id, id));
    return row;
  }

  async findStudentInfractionsRaw(studentId: string): Promise<StudentInfractionRecord[]> {
    return this.db
      .select()
      .from(studentInfractions)
      .where(eq(studentInfractions.studentId, studentId))
      .orderBy(desc(studentInfractions.date));
  }

  async createInfraction(data: NewStudentInfractionRecord): Promise<StudentInfractionRecord> {
    const [created] = await this.db.insert(studentInfractions).values(data).returning();
    return created;
  }

  async updateInfraction(
    id: string,
    data: Partial<NewStudentInfractionRecord>,
  ): Promise<StudentInfractionRecord | undefined> {
    const [updated] = await this.db
      .update(studentInfractions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(studentInfractions.id, id))
      .returning();
    return updated;
  }

  async deleteInfraction(id: string): Promise<boolean> {
    const res = await this.db
      .delete(studentInfractions)
      .where(eq(studentInfractions.id, id))
      .returning();
    return res.length > 0;
  }

  // --- Counseling Sessions ---
  async findCounselingSessions(studentId?: string, counselorId?: string, status?: string) {
    const conditions = [];
    if (studentId) conditions.push(eq(counselingSessions.studentId, studentId));
    if (counselorId) conditions.push(eq(counselingSessions.counselorId, counselorId));
    if (status) conditions.push(eq(counselingSessions.status, status as any));

    return this.db
      .select({
        counseling: counselingSessions,
        studentName: students.fullName,
        nisn: students.nisn,
        counselorUsername: users.username,
      })
      .from(counselingSessions)
      .innerJoin(students, eq(counselingSessions.studentId, students.id))
      .innerJoin(users, eq(counselingSessions.counselorId, users.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(counselingSessions.sessionDate));
  }

  async findCounselingById(id: string): Promise<CounselingSessionRecord | undefined> {
    const [row] = await this.db
      .select()
      .from(counselingSessions)
      .where(eq(counselingSessions.id, id));
    return row;
  }

  async createCounselingSession(data: NewCounselingSessionRecord): Promise<CounselingSessionRecord> {
    const [created] = await this.db.insert(counselingSessions).values(data).returning();
    return created;
  }

  async updateCounselingSession(
    id: string,
    data: Partial<NewCounselingSessionRecord>,
  ): Promise<CounselingSessionRecord | undefined> {
    const [updated] = await this.db
      .update(counselingSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(counselingSessions.id, id))
      .returning();
    return updated;
  }

  async deleteCounselingSession(id: string): Promise<boolean> {
    const res = await this.db
      .delete(counselingSessions)
      .where(eq(counselingSessions.id, id))
      .returning();
    return res.length > 0;
  }

  // --- Parent Summons ---
  async findParentSummons(studentId?: string, status?: string) {
    const conditions = [];
    if (studentId) conditions.push(eq(parentSummons.studentId, studentId));
    if (status) conditions.push(eq(parentSummons.status, status as any));

    return this.db
      .select({
        summon: parentSummons,
        studentName: students.fullName,
        nisn: students.nisn,
      })
      .from(parentSummons)
      .innerJoin(students, eq(parentSummons.studentId, students.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(parentSummons.summonDate));
  }

  async findParentSummonById(id: string): Promise<ParentSummonRecord | undefined> {
    const [row] = await this.db.select().from(parentSummons).where(eq(parentSummons.id, id));
    return row;
  }

  async countSummons(): Promise<number> {
    const [res] = await this.db.select({ count: sql<number>`count(*)` }).from(parentSummons);
    return Number(res?.count ?? 0);
  }

  async createParentSummon(data: NewParentSummonRecord): Promise<ParentSummonRecord> {
    const [created] = await this.db.insert(parentSummons).values(data).returning();
    return created;
  }

  async updateParentSummon(
    id: string,
    data: Partial<NewParentSummonRecord>,
  ): Promise<ParentSummonRecord | undefined> {
    const [updated] = await this.db
      .update(parentSummons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(parentSummons.id, id))
      .returning();
    return updated;
  }

  async deleteParentSummon(id: string): Promise<boolean> {
    const res = await this.db.delete(parentSummons).where(eq(parentSummons.id, id)).returning();
    return res.length > 0;
  }

  // --- Students with class and institution helpers ---
  async findActiveStudents(classroomId?: string) {
    const query = this.db
      .select({
        id: students.id,
        fullName: students.fullName,
        nisn: students.nisn,
        nis: students.nis,
        className: classrooms.name,
        classroomId: classrooms.id,
      })
      .from(students)
      .leftJoin(classStudents, eq(students.id, classStudents.studentId))
      .leftJoin(classrooms, eq(classStudents.classroomId, classrooms.id));

    if (classroomId) {
      return query.where(eq(classrooms.id, classroomId));
    }
    return query;
  }

  async findInstitution() {
    const [inst] = await this.db.select().from(institutions).limit(1);
    return inst;
  }

  async findStudentWithClass(studentId: string) {
    const [res] = await this.db
      .select({
        id: students.id,
        fullName: students.fullName,
        nisn: students.nisn,
        nis: students.nis,
        className: classrooms.name,
      })
      .from(students)
      .leftJoin(classStudents, eq(students.id, classStudents.studentId))
      .leftJoin(classrooms, eq(classStudents.classroomId, classrooms.id))
      .where(eq(students.id, studentId));
    return res;
  }
}
