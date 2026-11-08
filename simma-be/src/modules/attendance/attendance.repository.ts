import { eq, and, desc, gte, lte, count, sql } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import {
  attendanceStudents,
  attendanceTeachers,
} from "../../db/schema/attendance.js";
import type {
  AttendanceStudent,
  NewAttendanceStudent,
  AttendanceTeacher,
  NewAttendanceTeacher,
} from "./attendance.types.js";
import type {
  StudentAttendanceQueryParams,
  TeacherAttendanceQueryParams,
} from "./attendance.schema.js";

export class AttendanceRepository {
  // --- Student Attendance ---

  async findStudentAttendanceById(id: string): Promise<AttendanceStudent | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(attendanceStudents)
      .where(eq(attendanceStudents.id, id))
      .limit(1);
    return row ?? null;
  }

  async upsertStudentAttendance(
    data: NewAttendanceStudent,
  ): Promise<AttendanceStudent> {
    const db = getDb();
    const [row] = await db
      .insert(attendanceStudents)
      .values(data)
      .onConflictDoUpdate({
        target: [
          attendanceStudents.studentId,
          attendanceStudents.classroomId,
          attendanceStudents.date,
        ],
        set: {
          status: data.status,
          note: data.note,
          teacherId: data.teacherId,
          updatedAt: new Date(),
        },
      })
      .returning();
    return row;
  }

  async bulkUpsertStudentAttendance(
    records: NewAttendanceStudent[],
  ): Promise<AttendanceStudent[]> {
    if (records.length === 0) return [];
    const db = getDb();
    const rows = await db
      .insert(attendanceStudents)
      .values(records)
      .onConflictDoUpdate({
        target: [
          attendanceStudents.studentId,
          attendanceStudents.classroomId,
          attendanceStudents.date,
        ],
        set: {
          status: sql`excluded.status`,
          note: sql`excluded.note`,
          teacherId: sql`excluded.teacher_id`,
          updatedAt: new Date(),
        },
      })
      .returning();
    return rows;
  }

  async updateStudentAttendance(
    id: string,
    data: Partial<NewAttendanceStudent>,
  ): Promise<AttendanceStudent | null> {
    const db = getDb();
    const [row] = await db
      .update(attendanceStudents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(attendanceStudents.id, id))
      .returning();
    return row ?? null;
  }

  async deleteStudentAttendance(id: string): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .delete(attendanceStudents)
      .where(eq(attendanceStudents.id, id))
      .returning();
    return rows.length > 0;
  }

  async findStudentAttendances(
    params: StudentAttendanceQueryParams,
  ): Promise<{ data: AttendanceStudent[]; total: number }> {
    const db = getDb();
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.studentId) {
      conditions.push(eq(attendanceStudents.studentId, params.studentId));
    }
    if (params.classroomId) {
      conditions.push(eq(attendanceStudents.classroomId, params.classroomId));
    }
    if (params.teacherId) {
      conditions.push(eq(attendanceStudents.teacherId, params.teacherId));
    }
    if (params.status) {
      conditions.push(eq(attendanceStudents.status, params.status));
    }
    if (params.date) {
      conditions.push(eq(attendanceStudents.date, params.date));
    }
    if (params.startDate) {
      conditions.push(gte(attendanceStudents.date, params.startDate));
    }
    if (params.endDate) {
      conditions.push(lte(attendanceStudents.date, params.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(attendanceStudents)
      .where(whereClause);

    const data = await db
      .select()
      .from(attendanceStudents)
      .where(whereClause)
      .orderBy(desc(attendanceStudents.date), desc(attendanceStudents.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data,
      total: totalResult?.count ?? 0,
    };
  }

  async findClassroomAttendanceByDate(
    classroomId: string,
    date: string,
  ): Promise<AttendanceStudent[]> {
    const db = getDb();
    return db
      .select()
      .from(attendanceStudents)
      .where(
        and(
          eq(attendanceStudents.classroomId, classroomId),
          eq(attendanceStudents.date, date),
        ),
      )
      .orderBy(attendanceStudents.createdAt);
  }

  async findStudentAttendanceHistory(
    studentId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AttendanceStudent[]> {
    const db = getDb();
    const conditions = [eq(attendanceStudents.studentId, studentId)];
    if (startDate) {
      conditions.push(gte(attendanceStudents.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(attendanceStudents.date, endDate));
    }
    return db
      .select()
      .from(attendanceStudents)
      .where(and(...conditions))
      .orderBy(desc(attendanceStudents.date));
  }

  // --- Teacher Attendance ---

  async findTeacherAttendanceById(id: string): Promise<AttendanceTeacher | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(attendanceTeachers)
      .where(eq(attendanceTeachers.id, id))
      .limit(1);
    return row ?? null;
  }

  async upsertTeacherAttendance(
    data: NewAttendanceTeacher,
  ): Promise<AttendanceTeacher> {
    const db = getDb();
    const [row] = await db
      .insert(attendanceTeachers)
      .values(data)
      .onConflictDoUpdate({
        target: [attendanceTeachers.teacherId, attendanceTeachers.date],
        set: {
          status: data.status,
          note: data.note,
          updatedAt: new Date(),
        },
      })
      .returning();
    return row;
  }

  async bulkUpsertTeacherAttendance(
    records: NewAttendanceTeacher[],
  ): Promise<AttendanceTeacher[]> {
    if (records.length === 0) return [];
    const db = getDb();
    const rows = await db
      .insert(attendanceTeachers)
      .values(records)
      .onConflictDoUpdate({
        target: [attendanceTeachers.teacherId, attendanceTeachers.date],
        set: {
          status: sql`excluded.status`,
          note: sql`excluded.note`,
          updatedAt: new Date(),
        },
      })
      .returning();
    return rows;
  }

  async updateTeacherAttendance(
    id: string,
    data: Partial<NewAttendanceTeacher>,
  ): Promise<AttendanceTeacher | null> {
    const db = getDb();
    const [row] = await db
      .update(attendanceTeachers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(attendanceTeachers.id, id))
      .returning();
    return row ?? null;
  }

  async deleteTeacherAttendance(id: string): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .delete(attendanceTeachers)
      .where(eq(attendanceTeachers.id, id))
      .returning();
    return rows.length > 0;
  }

  async findTeacherAttendances(
    params: TeacherAttendanceQueryParams,
  ): Promise<{ data: AttendanceTeacher[]; total: number }> {
    const db = getDb();
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.teacherId) {
      conditions.push(eq(attendanceTeachers.teacherId, params.teacherId));
    }
    if (params.status) {
      conditions.push(eq(attendanceTeachers.status, params.status));
    }
    if (params.date) {
      conditions.push(eq(attendanceTeachers.date, params.date));
    }
    if (params.startDate) {
      conditions.push(gte(attendanceTeachers.date, params.startDate));
    }
    if (params.endDate) {
      conditions.push(lte(attendanceTeachers.date, params.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(attendanceTeachers)
      .where(whereClause);

    const data = await db
      .select()
      .from(attendanceTeachers)
      .where(whereClause)
      .orderBy(desc(attendanceTeachers.date), desc(attendanceTeachers.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data,
      total: totalResult?.count ?? 0,
    };
  }

  async findTeacherAttendanceHistory(
    teacherId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AttendanceTeacher[]> {
    const db = getDb();
    const conditions = [eq(attendanceTeachers.teacherId, teacherId)];
    if (startDate) {
      conditions.push(gte(attendanceTeachers.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(attendanceTeachers.date, endDate));
    }
    return db
      .select()
      .from(attendanceTeachers)
      .where(and(...conditions))
      .orderBy(desc(attendanceTeachers.date));
  }
}

export const attendanceRepository = new AttendanceRepository();
