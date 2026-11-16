import { eq, and, sql, asc } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { getDb } from "../../core/database/client.js";
import {
  scheduleRooms,
  scheduleTimeSlots,
  schedules,
  classrooms,
  subjects,
  teachers,
  semesters,
  academicYears,
  institutions,
} from "../../db/schema/index.js";
import type {
  ScheduleRoom,
  NewScheduleRoom,
  ScheduleTimeSlot,
  NewScheduleTimeSlot,
  Schedule,
  NewSchedule,
  ScheduleWithDetails,
} from "./schedules.types.js";
import type { ScheduleQueryFilterInput } from "@simma/shared";

export class SchedulesRepository {
  constructor(private readonly db: PostgresJsDatabase = getDb() as any) {}

  // --- Rooms ---
  async findAllRooms(): Promise<ScheduleRoom[]> {
    return this.db.select().from(scheduleRooms).orderBy(asc(scheduleRooms.name));
  }

  async findRoomById(id: string): Promise<ScheduleRoom | undefined> {
    const [room] = await this.db
      .select()
      .from(scheduleRooms)
      .where(eq(scheduleRooms.id, id));
    return room;
  }

  async createRoom(data: NewScheduleRoom): Promise<ScheduleRoom> {
    const [created] = await this.db.insert(scheduleRooms).values(data).returning();
    return created;
  }

  async updateRoom(
    id: string,
    data: Partial<NewScheduleRoom>,
  ): Promise<ScheduleRoom | undefined> {
    const [updated] = await this.db
      .update(scheduleRooms)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(scheduleRooms.id, id))
      .returning();
    return updated;
  }

  async deleteRoom(id: string): Promise<boolean> {
    const result = await this.db
      .delete(scheduleRooms)
      .where(eq(scheduleRooms.id, id))
      .returning();
    return result.length > 0;
  }

  // --- Time Slots ---
  async findAllTimeSlots(dayOfWeek?: string): Promise<ScheduleTimeSlot[]> {
    const query = this.db.select().from(scheduleTimeSlots);
    if (dayOfWeek) {
      query.where(eq(scheduleTimeSlots.dayOfWeek, dayOfWeek as any));
    }
    return query.orderBy(
      asc(scheduleTimeSlots.dayOfWeek),
      asc(scheduleTimeSlots.periodOrder),
    );
  }

  async findTimeSlotById(id: string): Promise<ScheduleTimeSlot | undefined> {
    const [slot] = await this.db
      .select()
      .from(scheduleTimeSlots)
      .where(eq(scheduleTimeSlots.id, id));
    return slot;
  }

  async createTimeSlot(data: NewScheduleTimeSlot): Promise<ScheduleTimeSlot> {
    const [created] = await this.db
      .insert(scheduleTimeSlots)
      .values(data)
      .returning();
    return created;
  }

  async createTimeSlotsBatch(
    data: NewScheduleTimeSlot[],
  ): Promise<ScheduleTimeSlot[]> {
    if (data.length === 0) return [];
    return this.db.insert(scheduleTimeSlots).values(data).returning();
  }

  async updateTimeSlot(
    id: string,
    data: Partial<NewScheduleTimeSlot>,
  ): Promise<ScheduleTimeSlot | undefined> {
    const [updated] = await this.db
      .update(scheduleTimeSlots)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(scheduleTimeSlots.id, id))
      .returning();
    return updated;
  }

  async deleteTimeSlot(id: string): Promise<boolean> {
    const result = await this.db
      .delete(scheduleTimeSlots)
      .where(eq(scheduleTimeSlots.id, id))
      .returning();
    return result.length > 0;
  }

  // --- Schedules Plotting ---
  async findSchedulesWithDetails(
    filter: ScheduleQueryFilterInput,
  ): Promise<ScheduleWithDetails[]> {
    const conditions = [];

    if (filter.academicYearId) {
      conditions.push(eq(schedules.academicYearId, filter.academicYearId));
    }
    if (filter.semesterId) {
      conditions.push(eq(schedules.semesterId, filter.semesterId));
    }
    if (filter.classroomId) {
      conditions.push(eq(schedules.classroomId, filter.classroomId));
    }
    if (filter.teacherId) {
      conditions.push(eq(schedules.teacherId, filter.teacherId));
    }
    if (filter.roomId) {
      conditions.push(eq(schedules.roomId, filter.roomId));
    }
    if (filter.dayOfWeek) {
      conditions.push(eq(schedules.dayOfWeek, filter.dayOfWeek));
    }
    if (filter.status) {
      conditions.push(eq(schedules.status, filter.status));
    }

    const rows = await this.db
      .select({
        id: schedules.id,
        academicYearId: schedules.academicYearId,
        semesterId: schedules.semesterId,
        classroomId: schedules.classroomId,
        subjectId: schedules.subjectId,
        teacherId: schedules.teacherId,
        roomId: schedules.roomId,
        roomName: schedules.roomName,
        dayOfWeek: schedules.dayOfWeek,
        timeSlotId: schedules.timeSlotId,
        status: schedules.status,
        notes: schedules.notes,
        createdAt: schedules.createdAt,
        updatedAt: schedules.updatedAt,
        // Joined fields
        classroomName: classrooms.name,
        gradeLevel: classrooms.gradeLevel,
        subjectCode: subjects.code,
        subjectName: subjects.name,
        subjectGroup: subjects.group,
        teacherName: teachers.fullName,
        nuptk: teachers.nuptk,
        roomNameResolved: scheduleRooms.name,
        roomCode: scheduleRooms.code,
        timeSlotName: scheduleTimeSlots.name,
        timeSlotOrder: scheduleTimeSlots.periodOrder,
        startTime: scheduleTimeSlots.startTime,
        endTime: scheduleTimeSlots.endTime,
        sessionType: scheduleTimeSlots.sessionType,
        isTeachingTime: scheduleTimeSlots.isTeachingTime,
      })
      .from(schedules)
      .innerJoin(classrooms, eq(schedules.classroomId, classrooms.id))
      .innerJoin(scheduleTimeSlots, eq(schedules.timeSlotId, scheduleTimeSlots.id))
      .leftJoin(subjects, eq(schedules.subjectId, subjects.id))
      .leftJoin(teachers, eq(schedules.teacherId, teachers.id))
      .leftJoin(scheduleRooms, eq(schedules.roomId, scheduleRooms.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        asc(scheduleTimeSlots.dayOfWeek),
        asc(scheduleTimeSlots.periodOrder),
      );

    return rows as ScheduleWithDetails[];
  }

  async findScheduleById(id: string): Promise<ScheduleWithDetails | undefined> {
    const list = await this.findSchedulesWithDetails({} as any);
    return list.find((s) => s.id === id);
  }

  async createSchedule(data: NewSchedule): Promise<Schedule> {
    const [created] = await this.db.insert(schedules).values(data).returning();
    return created;
  }

  async updateSchedule(
    id: string,
    data: Partial<NewSchedule>,
  ): Promise<Schedule | undefined> {
    const [updated] = await this.db
      .update(schedules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schedules.id, id))
      .returning();
    return updated;
  }

  async deleteSchedule(id: string): Promise<boolean> {
    const result = await this.db
      .delete(schedules)
      .where(eq(schedules.id, id))
      .returning();
    return result.length > 0;
  }

  async clearClassroomSchedules(
    semesterId: string,
    classroomId: string,
  ): Promise<number> {
    const result = await this.db
      .delete(schedules)
      .where(
        and(
          eq(schedules.semesterId, semesterId),
          eq(schedules.classroomId, classroomId),
        ),
      )
      .returning();
    return result.length;
  }

  // --- Reference Helpers ---
  async findActiveSemester() {
    const [active] = await this.db
      .select({
        id: semesters.id,
        type: semesters.type,
        academicYearId: semesters.academicYearId,
        academicYearName: academicYears.name,
      })
      .from(semesters)
      .innerJoin(academicYears, eq(semesters.academicYearId, academicYears.id))
      .where(eq(semesters.isActive, true));
    return active;
  }

  async findInstitution() {
    const [inst] = await this.db.select().from(institutions).limit(1);
    return inst || {
      name: "Madrasah Aliyah SIMMA",
      nsm: "131232010001",
      npsn: "20100001",
      address: "Jl. Pendidikan Pesantren No. 1",
    };
  }

  async findClassroomById(id: string) {
    const [c] = await this.db.select().from(classrooms).where(eq(classrooms.id, id));
    return c;
  }

  async findTeacherById(id: string) {
    const [t] = await this.db.select().from(teachers).where(eq(teachers.id, id));
    return t;
  }
}

export const schedulesRepository = new SchedulesRepository();
