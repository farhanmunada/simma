import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../core/errors/index.js";
import { SchedulesRepository, schedulesRepository } from "./schedules.repository.js";
import { detectScheduleCollisions } from "./schedules.collision.js";
import { generateScheduleLandscapePdf } from "./schedules.pdf.js";
import {
  buildTimetableMatrix,
  buildPdfMatrixData,
} from "./schedules.matrix.js";
import type {
  ScheduleRoom,
  NewScheduleRoom,
  ScheduleTimeSlot,
  NewScheduleTimeSlot,
  Schedule,
  ScheduleWithDetails,
  CollisionCheckResult,
  TimetableMatrixView,
  SchedulePdfData,
} from "./schedules.types.js";
import type {
  CreateSchedulePlotInput,
  UpdateSchedulePlotInput,
  CheckScheduleCollisionInput,
  ScheduleQueryFilterInput,
  BatchSchedulePlotInput,
  DayOfWeek,
} from "@simma/shared";

export class SchedulesService {
  constructor(private readonly repo: SchedulesRepository = schedulesRepository) {}

  // --- Rooms ---
  async getRooms(): Promise<ScheduleRoom[]> {
    return this.repo.findAllRooms();
  }

  async createRoom(data: NewScheduleRoom): Promise<ScheduleRoom> {
    return this.repo.createRoom(data);
  }

  async updateRoom(
    id: string,
    data: Partial<NewScheduleRoom>,
  ): Promise<ScheduleRoom> {
    const updated = await this.repo.updateRoom(id, data);
    if (!updated) throw new NotFoundError("Ruangan tidak ditemukan");
    return updated;
  }

  async deleteRoom(id: string): Promise<void> {
    const ok = await this.repo.deleteRoom(id);
    if (!ok) throw new NotFoundError("Ruangan tidak ditemukan");
  }

  // --- Time Slots ---
  async getTimeSlots(dayOfWeek?: string): Promise<ScheduleTimeSlot[]> {
    return this.repo.findAllTimeSlots(dayOfWeek);
  }

  async createTimeSlot(data: NewScheduleTimeSlot): Promise<ScheduleTimeSlot> {
    return this.repo.createTimeSlot(data);
  }

  async createTimeSlotsBatch(
    data: NewScheduleTimeSlot[],
  ): Promise<ScheduleTimeSlot[]> {
    return this.repo.createTimeSlotsBatch(data);
  }

  async updateTimeSlot(
    id: string,
    data: Partial<NewScheduleTimeSlot>,
  ): Promise<ScheduleTimeSlot> {
    const updated = await this.repo.updateTimeSlot(id, data);
    if (!updated) throw new NotFoundError("Slot jam tidak ditemukan");
    return updated;
  }

  async deleteTimeSlot(id: string): Promise<void> {
    const ok = await this.repo.deleteTimeSlot(id);
    if (!ok) throw new NotFoundError("Slot jam tidak ditemukan");
  }

  // --- Schedules Plotting & Collisions ---
  async getSchedules(
    filter: ScheduleQueryFilterInput,
  ): Promise<ScheduleWithDetails[]> {
    return this.repo.findSchedulesWithDetails(filter);
  }

  async checkCollision(
    input: CheckScheduleCollisionInput,
  ): Promise<CollisionCheckResult> {
    const existing = await this.repo.findSchedulesWithDetails({
      semesterId: input.semesterId,
    });
    return detectScheduleCollisions(
      {
        id: input.excludeScheduleId,
        classroomId: input.classroomId,
        dayOfWeek: input.dayOfWeek,
        timeSlotId: input.timeSlotId,
        teacherId: input.teacherId,
        roomId: input.roomId,
      },
      existing,
    );
  }

  async createPlot(input: CreateSchedulePlotInput): Promise<Schedule> {
    const existing = await this.repo.findSchedulesWithDetails({
      semesterId: input.semesterId,
    });

    const collisionResult = detectScheduleCollisions(
      {
        classroomId: input.classroomId,
        dayOfWeek: input.dayOfWeek,
        timeSlotId: input.timeSlotId,
        teacherId: input.teacherId,
        roomId: input.roomId,
      },
      existing,
    );

    if (collisionResult.hasCollision) {
      throw new ConflictError(collisionResult.collisions[0].message);
    }

    return this.repo.createSchedule({
      academicYearId: input.academicYearId,
      semesterId: input.semesterId,
      classroomId: input.classroomId,
      subjectId: input.subjectId || null,
      teacherId: input.teacherId || null,
      roomId: input.roomId || null,
      roomName: input.roomName || null,
      dayOfWeek: input.dayOfWeek,
      timeSlotId: input.timeSlotId,
      status: input.status ?? "published",
      notes: input.notes || null,
    });
  }

  async updatePlot(
    id: string,
    input: UpdateSchedulePlotInput,
  ): Promise<Schedule> {
    const schedule = await this.repo.findScheduleById(id);
    if (!schedule) throw new NotFoundError("Jadwal tidak ditemukan");

    const targetSemesterId = input.semesterId || schedule.semesterId;
    const targetClassroomId = input.classroomId || schedule.classroomId;
    const targetDay = input.dayOfWeek || schedule.dayOfWeek;
    const targetSlotId = input.timeSlotId || schedule.timeSlotId;
    const targetTeacherId =
      input.teacherId !== undefined ? input.teacherId : schedule.teacherId;
    const targetRoomId =
      input.roomId !== undefined ? input.roomId : schedule.roomId;

    const existing = await this.repo.findSchedulesWithDetails({
      semesterId: targetSemesterId,
    });

    const collisionResult = detectScheduleCollisions(
      {
        id,
        classroomId: targetClassroomId,
        dayOfWeek: targetDay,
        timeSlotId: targetSlotId,
        teacherId: targetTeacherId,
        roomId: targetRoomId,
      },
      existing,
    );

    if (collisionResult.hasCollision) {
      throw new ConflictError(collisionResult.collisions[0].message);
    }

    const updated = await this.repo.updateSchedule(id, input as any);
    if (!updated) throw new NotFoundError("Gagal memperbarui jadwal");
    return updated;
  }

  async deletePlot(id: string): Promise<void> {
    const ok = await this.repo.deleteSchedule(id);
    if (!ok) throw new NotFoundError("Jadwal tidak ditemukan");
  }

  async batchPlot(input: BatchSchedulePlotInput): Promise<Schedule[]> {
    const results: Schedule[] = [];
    for (const plot of input.plots) {
      const created = await this.createPlot(plot);
      results.push(created);
    }
    return results;
  }

  // --- Matrix Grid View ---
  async getTimetableMatrix(query: {
    semesterId?: string;
    classroomId?: string;
    teacherId?: string;
    roomId?: string;
  }): Promise<TimetableMatrixView> {
    const timeSlots = await this.repo.findAllTimeSlots();
    const schedulesList = await this.repo.findSchedulesWithDetails(query);
    return buildTimetableMatrix(timeSlots, schedulesList, query);
  }

  // --- PDF Export ---
  async generatePdf(query: {
    semesterId?: string;
    viewType: "classroom" | "teacher" | "room";
    targetId: string;
  }): Promise<Buffer> {
    const institution = await this.repo.findInstitution();
    const activeSem = await this.repo.findActiveSemester();
    const semId = query.semesterId || activeSem?.id;

    if (!semId) {
      throw new ValidationError("Semester aktif tidak ditemukan");
    }

    let targetName = "";
    const filter: ScheduleQueryFilterInput = { semesterId: semId };

    if (query.viewType === "classroom") {
      const cls = await this.repo.findClassroomById(query.targetId);
      if (!cls) throw new NotFoundError("Kelas tidak ditemukan");
      targetName = `Kelas ${cls.name}`;
      filter.classroomId = query.targetId;
    } else if (query.viewType === "teacher") {
      const t = await this.repo.findTeacherById(query.targetId);
      if (!t) throw new NotFoundError("Guru tidak ditemukan");
      targetName = `Guru: ${t.fullName}`;
      filter.teacherId = query.targetId;
    } else {
      const r = await this.repo.findRoomById(query.targetId);
      if (!r) throw new NotFoundError("Ruangan tidak ditemukan");
      targetName = `Ruangan: ${r.name}`;
      filter.roomId = query.targetId;
    }

    const schedulesList = await this.repo.findSchedulesWithDetails(filter);
    const slots = await this.repo.findAllTimeSlots();
    const days: DayOfWeek[] = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
    const { distinctSlots, matrix } = buildPdfMatrixData(
      slots,
      schedulesList,
      query.viewType,
      days,
    );

    const pdfData: SchedulePdfData = {
      institution,
      title: "JADWAL PELAJARAN MADRASAH & DINIYAH",
      subTitle: "Integrasi Kurikulum Formal & Diniyah Pesantren",
      academicYearName: activeSem?.academicYearName || "2024/2025",
      semesterType: activeSem?.type || 1,
      viewType: query.viewType,
      targetName,
      days,
      timeSlots: distinctSlots,
      matrix,
      signatoryTitle: "Waka Kurikulum Madrasah",
      signatoryName: "Ustadz H. Ahmad Dahlan, M.Pd.",
    };

    return generateScheduleLandscapePdf(pdfData);
  }
}

export const schedulesService = new SchedulesService();
