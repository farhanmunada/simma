import type { DayOfWeek, SessionType, ScheduleStatus, RoomType } from "@simma/shared";

export type ScheduleViewType = "classroom" | "teacher" | "room";

export interface ScheduleRoomItem {
  id: string;
  name: string;
  code: string;
  capacity?: number | null;
  location?: string | null;
  roomType: RoomType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleTimeSlotItem {
  id: string;
  name: string;
  sessionType: SessionType;
  dayOfWeek?: DayOfWeek | null;
  periodOrder: number;
  startTime: string;
  endTime: string;
  isTeachingTime: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  academicYearId: string;
  semesterId: string;
  classroomId: string;
  subjectId: string;
  teacherId: string;
  roomId?: string | null;
  timeSlotId: string;
  dayOfWeek: DayOfWeek;
  status: ScheduleStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  // Resolved details
  classroomName?: string;
  gradeLevel?: number;
  subjectName?: string;
  subjectCode?: string;
  teacherName?: string;
  roomNameResolved?: string | null;
  roomCode?: string | null;
  timeSlotName?: string;
  sessionType?: SessionType;
  timeSlotOrder?: number;
  startTime?: string;
  endTime?: string;
  isTeachingTime?: boolean;
}

export interface ScheduleMatrixCell {
  scheduleId?: string;
  subjectName?: string;
  subjectCode?: string;
  teacherName?: string;
  classroomName?: string;
  roomName?: string | null;
  sessionType?: SessionType;
  status?: ScheduleStatus;
  isTeachingTime?: boolean;
}

export interface ScheduleMatrixRow {
  timeSlot: ScheduleTimeSlotItem;
  cells: Partial<Record<DayOfWeek, ScheduleMatrixCell>>;
}

export interface ScheduleMatrixView {
  academicYearId: string;
  semesterId: string;
  viewType: ScheduleViewType;
  targetId: string;
  targetName: string;
  rows: ScheduleMatrixRow[];
}

export interface CollisionDetail {
  type: "teacher" | "room" | "classroom";
  scheduleId: string;
  message: string;
  existingSchedule?: {
    id: string;
    dayOfWeek: DayOfWeek;
    timeSlotName?: string;
    classroomName?: string;
    subjectName?: string;
    teacherName?: string;
    roomName?: string | null;
  };
}

export interface CollisionResult {
  hasCollision: boolean;
  collisions: CollisionDetail[];
  warnings: string[];
}

export interface ScheduleFormData {
  academicYearId?: string;
  semesterId?: string;
  classroomId: string;
  subjectId: string;
  teacherId: string;
  roomId?: string;
  timeSlotId: string;
  dayOfWeek: DayOfWeek;
  status?: ScheduleStatus;
  notes?: string;
}

export interface BatchScheduleFormData {
  academicYearId: string;
  semesterId: string;
  classroomId: string;
  dayOfWeek: DayOfWeek;
  entries: Array<{
    timeSlotId: string;
    subjectId: string;
    teacherId: string;
    roomId?: string;
    status?: ScheduleStatus;
  }>;
}
