import type {
  AttendanceStudent,
  NewAttendanceStudent,
  AttendanceTeacher,
  NewAttendanceTeacher,
} from "../../db/schema/attendance.js";

export type {
  AttendanceStudent,
  NewAttendanceStudent,
  AttendanceTeacher,
  NewAttendanceTeacher,
};

export interface AttendanceSummaryCounts {
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  total: number;
  attendancePercentage: number;
}

export interface StudentAttendanceSummary extends AttendanceSummaryCounts {
  studentId: string;
}

export interface TeacherAttendanceSummary {
  teacherId: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  dinasLuar: number;
  total: number;
  attendancePercentage: number;
}

export interface ClassroomDailyAttendance {
  classroomId: string;
  date: string;
  attendances: AttendanceStudent[];
  summary: AttendanceSummaryCounts;
}
