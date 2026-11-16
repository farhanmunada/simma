import type {
  DayOfWeek,
  SessionType,
  ScheduleStatus,
  RoomType,
} from "@simma/shared";
import type {
  ScheduleRoom,
  NewScheduleRoom,
  ScheduleTimeSlot,
  NewScheduleTimeSlot,
  Schedule,
  NewSchedule,
} from "../../db/schema/schedules.js";

export type {
  ScheduleRoom,
  NewScheduleRoom,
  ScheduleTimeSlot,
  NewScheduleTimeSlot,
  Schedule,
  NewSchedule,
};

export interface ScheduleWithDetails extends Schedule {
  classroomName: string;
  gradeLevel: number;
  subjectCode?: string | null;
  subjectName?: string | null;
  subjectGroup?: string | null;
  teacherName?: string | null;
  nuptk?: string | null;
  roomNameResolved?: string | null;
  roomCode?: string | null;
  timeSlotName: string;
  timeSlotOrder: number;
  startTime: string;
  endTime: string;
  sessionType: SessionType;
  isTeachingTime: boolean;
}

export interface ScheduleCollisionDetail {
  type: "teacher" | "room" | "classroom" | "consecutive_workload";
  message: string;
  conflictingScheduleId?: string;
  conflictDetails?: {
    dayOfWeek: DayOfWeek;
    timeSlotName?: string;
    teacherName?: string;
    classroomName?: string;
    roomName?: string;
    consecutiveCount?: number;
  };
}

export interface CollisionCheckResult {
  hasCollision: boolean;
  collisions: ScheduleCollisionDetail[];
  warnings: string[];
}

export interface TimetableCell {
  scheduleId?: string;
  subjectId?: string;
  subjectCode?: string;
  subjectName?: string;
  teacherId?: string;
  teacherName?: string;
  roomId?: string;
  roomName?: string;
  status?: ScheduleStatus;
  notes?: string;
}

export interface TimetableRow {
  timeSlotId: string;
  periodOrder: number;
  name: string;
  sessionType: SessionType;
  isTeachingTime: boolean;
  startTime: string;
  endTime: string;
  cells: Partial<Record<DayOfWeek, TimetableCell>>;
}

export interface TimetableMatrixView {
  title: string;
  academicYearId?: string;
  semesterId?: string;
  classroomId?: string;
  teacherId?: string;
  roomId?: string;
  timeSlots: ScheduleTimeSlot[];
  rows: TimetableRow[];
}

export interface SchedulePdfData {
  institution: {
    name: string;
    nsm?: string | null;
    npsn?: string | null;
    address?: string | null;
  };
  title: string;
  subTitle: string;
  academicYearName: string;
  semesterType: number;
  viewType: "classroom" | "teacher" | "room" | "master";
  targetName: string;
  days: DayOfWeek[];
  timeSlots: Array<{
    id: string;
    name: string;
    periodOrder: number;
    startTime: string;
    endTime: string;
    sessionType: SessionType;
    isTeachingTime: boolean;
  }>;
  matrix: Record<string, Record<DayOfWeek, { title: string; subtitle: string; room?: string }>>;
  signatoryTitle: string;
  signatoryName: string;
}
