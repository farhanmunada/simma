import { eq, and, or, inArray, isNull, desc, asc, sql, gte, lte } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import {
  mutabaahActivities,
  mutabaahDailyEntries,
  mutabaahUzurRecords,
  type MutabaahActivity,
  type NewMutabaahActivity,
  type MutabaahDailyEntry,
  type NewMutabaahDailyEntry,
  type MutabaahUzurRecord,
  type NewMutabaahUzurRecord,
} from "../../db/schema/mutabaah.js";
import { students, classStudents } from "../../db/schema/students.js";
import { classrooms, institutions } from "../../db/schema/setup.js";

export class MutabaahRepository {
  async findActivities(params?: {
    category?: string;
    isActive?: boolean;
  }): Promise<MutabaahActivity[]> {
    const db = getDb();
    const conditions = [];
    if (params?.category) {
      conditions.push(eq(mutabaahActivities.category, params.category as any));
    }
    if (params?.isActive !== undefined) {
      conditions.push(eq(mutabaahActivities.isActive, params.isActive));
    }
    return db
      .select()
      .from(mutabaahActivities)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(mutabaahActivities.orderIndex), asc(mutabaahActivities.name));
  }

  async findActivityById(id: string): Promise<MutabaahActivity | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(mutabaahActivities)
      .where(eq(mutabaahActivities.id, id))
      .limit(1);
    return row ?? null;
  }

  async createActivity(data: NewMutabaahActivity): Promise<MutabaahActivity> {
    const db = getDb();
    const [row] = await db.insert(mutabaahActivities).values(data).returning();
    return row;
  }

  async updateActivity(
    id: string,
    data: Partial<NewMutabaahActivity>,
  ): Promise<MutabaahActivity | null> {
    const db = getDb();
    const [row] = await db
      .update(mutabaahActivities)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(mutabaahActivities.id, id))
      .returning();
    return row ?? null;
  }

  async deleteActivity(id: string): Promise<boolean> {
    const db = getDb();
    const res = await db
      .delete(mutabaahActivities)
      .where(eq(mutabaahActivities.id, id))
      .returning();
    return res.length > 0;
  }

  async countActivities(): Promise<number> {
    const db = getDb();
    const [row] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(mutabaahActivities);
    return row?.count ?? 0;
  }

  async insertDefaultActivities(
    items: NewMutabaahActivity[],
  ): Promise<MutabaahActivity[]> {
    const db = getDb();
    return db.insert(mutabaahActivities).values(items).returning();
  }

  async findStudentsForChecklist(classroomId?: string) {
    const db = getDb();
    const conditions = [
      isNull(students.deletedAt),
      eq(students.status, "aktif"),
    ];

    if (classroomId) {
      const studentIdsInClass = db
        .select({ studentId: classStudents.studentId })
        .from(classStudents)
        .where(eq(classStudents.classroomId, classroomId));
      conditions.push(inArray(students.id, studentIdsInClass));
    }

    return db
      .select({
        id: students.id,
        fullName: students.fullName,
        nisn: students.nisn,
        gender: students.gender,
        classroomId: classStudents.classroomId,
        className: classrooms.name,
      })
      .from(students)
      .leftJoin(classStudents, eq(students.id, classStudents.studentId))
      .leftJoin(classrooms, eq(classStudents.classroomId, classrooms.id))
      .where(and(...conditions))
      .orderBy(asc(students.fullName));
  }

  async findDailyEntries(params: {
    date: string;
    studentIds?: string[];
  }): Promise<MutabaahDailyEntry[]> {
    const db = getDb();
    const conditions = [eq(mutabaahDailyEntries.date, params.date)];
    if (params.studentIds && params.studentIds.length > 0) {
      conditions.push(inArray(mutabaahDailyEntries.studentId, params.studentIds));
    }
    return db
      .select()
      .from(mutabaahDailyEntries)
      .where(and(...conditions));
  }

  async batchUpsertDailyEntries(
    entries: NewMutabaahDailyEntry[],
  ): Promise<MutabaahDailyEntry[]> {
    if (entries.length === 0) return [];
    const db = getDb();
    return await db.transaction(async (tx) => {
      return await tx
        .insert(mutabaahDailyEntries)
        .values(entries)
        .onConflictDoUpdate({
          target: [
            mutabaahDailyEntries.studentId,
            mutabaahDailyEntries.activityId,
            mutabaahDailyEntries.date,
          ],
          set: {
            status: sql`excluded.status`,
            volume: sql`excluded.volume`,
            score: sql`excluded.score`,
            notes: sql`excluded.notes`,
            recordedBy: sql`excluded.recorded_by`,
            updatedAt: new Date(),
          },
        })
        .returning();
    });
  }

  async findUzurRecords(params: {
    date?: string;
    studentIds?: string[];
    studentId?: string;
  }): Promise<MutabaahUzurRecord[]> {
    const db = getDb();
    const conditions = [];

    if (params.studentId) {
      conditions.push(eq(mutabaahUzurRecords.studentId, params.studentId));
    } else if (params.studentIds && params.studentIds.length > 0) {
      conditions.push(inArray(mutabaahUzurRecords.studentId, params.studentIds));
    }

    if (params.date) {
      conditions.push(
        and(
          lte(mutabaahUzurRecords.startDate, params.date),
          or(
            isNull(mutabaahUzurRecords.endDate),
            gte(mutabaahUzurRecords.endDate, params.date),
          ),
        ),
      );
    }

    return db
      .select()
      .from(mutabaahUzurRecords)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(mutabaahUzurRecords.startDate));
  }

  async createUzurRecord(
    data: NewMutabaahUzurRecord,
  ): Promise<MutabaahUzurRecord> {
    const db = getDb();
    const [row] = await db.insert(mutabaahUzurRecords).values(data).returning();
    return row;
  }

  async deleteUzurRecord(id: string): Promise<boolean> {
    const db = getDb();
    const res = await db
      .delete(mutabaahUzurRecords)
      .where(eq(mutabaahUzurRecords.id, id))
      .returning();
    return res.length > 0;
  }

  async findEntriesInRange(params: {
    startDate: string;
    endDate: string;
    studentIds?: string[];
  }): Promise<MutabaahDailyEntry[]> {
    const db = getDb();
    const conditions = [
      gte(mutabaahDailyEntries.date, params.startDate),
      lte(mutabaahDailyEntries.date, params.endDate),
    ];
    if (params.studentIds && params.studentIds.length > 0) {
      conditions.push(inArray(mutabaahDailyEntries.studentId, params.studentIds));
    }
    return db
      .select()
      .from(mutabaahDailyEntries)
      .where(and(...conditions))
      .orderBy(asc(mutabaahDailyEntries.date));
  }

  async findStudentById(studentId: string) {
    const db = getDb();
    const [row] = await db
      .select({
        id: students.id,
        fullName: students.fullName,
        nisn: students.nisn,
        nis: students.nis,
        gender: students.gender,
        classroomId: classStudents.classroomId,
        className: classrooms.name,
      })
      .from(students)
      .leftJoin(classStudents, eq(students.id, classStudents.studentId))
      .leftJoin(classrooms, eq(classStudents.classroomId, classrooms.id))
      .where(eq(students.id, studentId))
      .limit(1);
    return row ?? null;
  }

  async findInstitution() {
    const db = getDb();
    const [row] = await db.select().from(institutions).limit(1);
    return row ?? null;
  }
}

export const mutabaahRepository = new MutabaahRepository();
