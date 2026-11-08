export type StudentAttendanceStatus = "hadir" | "izin" | "sakit" | "alpa";

export type TeacherAttendanceStatus =
  | "hadir"
  | "izin"
  | "sakit"
  | "alpa"
  | "dinas_luar";

export const STUDENT_ATTENDANCE_STATUSES: StudentAttendanceStatus[] = [
  "hadir",
  "izin",
  "sakit",
  "alpa",
];

export const TEACHER_ATTENDANCE_STATUSES: TeacherAttendanceStatus[] = [
  "hadir",
  "izin",
  "sakit",
  "alpa",
  "dinas_luar",
];

export interface AttendanceStudent {
  id: string;
  studentId: string;
  classroomId: string;
  date: string;
  status: StudentAttendanceStatus;
  note?: string | null;
  teacherId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceTeacher {
  id: string;
  teacherId: string;
  date: string;
  status: TeacherAttendanceStatus;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

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

export interface TeacherAttendanceSummary extends AttendanceSummaryCounts {
  teacherId: string;
  dinasLuar: number;
}

export interface ClassroomDailyAttendance {
  classroomId: string;
  date: string;
  attendances: AttendanceStudent[];
  summary: AttendanceSummaryCounts;
}

// Student DTOs
export interface RecordStudentAttendanceDto {
  studentId: string;
  classroomId: string;
  date: string;
  status: StudentAttendanceStatus;
  note?: string | null;
  teacherId?: string | null;
}

export interface UpdateStudentAttendanceDto {
  status?: StudentAttendanceStatus;
  note?: string | null;
  teacherId?: string | null;
}

export interface BulkStudentAttendanceItem {
  studentId: string;
  status: StudentAttendanceStatus;
  note?: string | null;
}

export interface BulkStudentAttendanceDto {
  classroomId: string;
  date: string;
  teacherId?: string | null;
  attendances: BulkStudentAttendanceItem[];
}

export interface StudentAttendanceQueryParams {
  page?: number;
  limit?: number;
  studentId?: string;
  classroomId?: string;
  teacherId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: StudentAttendanceStatus;
}

export interface PaginatedStudentAttendancesResponse {
  data: AttendanceStudent[];
  total: number;
  page: number;
  limit: number;
}

// Teacher DTOs
export interface RecordTeacherAttendanceDto {
  teacherId: string;
  date: string;
  status: TeacherAttendanceStatus;
  note?: string | null;
}

export interface UpdateTeacherAttendanceDto {
  status?: TeacherAttendanceStatus;
  note?: string | null;
}

export interface BulkTeacherAttendanceItem {
  teacherId: string;
  status: TeacherAttendanceStatus;
  note?: string | null;
}

export interface BulkTeacherAttendanceDto {
  date: string;
  attendances: BulkTeacherAttendanceItem[];
}

export interface TeacherAttendanceQueryParams {
  page?: number;
  limit?: number;
  teacherId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: TeacherAttendanceStatus;
}

export interface PaginatedTeacherAttendancesResponse {
  data: AttendanceTeacher[];
  total: number;
  page: number;
  limit: number;
}

// UI Configuration
export interface StatusDisplayConfig {
  label: string;
  short: string;
  badgeVariant: "success" | "info" | "warning" | "danger" | "neutral";
  colorClass: {
    bg: string;
    text: string;
    border: string;
    activeBg: string;
    activeText: string;
    activeBorder: string;
  };
}

export const STUDENT_STATUS_CONFIG: Record<StudentAttendanceStatus, StatusDisplayConfig> = {
  hadir: {
    label: "Hadir",
    short: "H",
    badgeVariant: "success",
    colorClass: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-300",
      activeBg: "bg-emerald-600",
      activeText: "text-white",
      activeBorder: "border-emerald-700",
    },
  },
  izin: {
    label: "Izin",
    short: "I",
    badgeVariant: "info",
    colorClass: {
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-300",
      activeBg: "bg-sky-600",
      activeText: "text-white",
      activeBorder: "border-sky-700",
    },
  },
  sakit: {
    label: "Sakit",
    short: "S",
    badgeVariant: "warning",
    colorClass: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-300",
      activeBg: "bg-amber-600",
      activeText: "text-white",
      activeBorder: "border-amber-700",
    },
  },
  alpa: {
    label: "Alpa",
    short: "A",
    badgeVariant: "danger",
    colorClass: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-300",
      activeBg: "bg-rose-600",
      activeText: "text-white",
      activeBorder: "border-rose-700",
    },
  },
};

export const TEACHER_STATUS_CONFIG: Record<TeacherAttendanceStatus, StatusDisplayConfig> = {
  hadir: {
    label: "Hadir",
    short: "H",
    badgeVariant: "success",
    colorClass: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-300",
      activeBg: "bg-emerald-600",
      activeText: "text-white",
      activeBorder: "border-emerald-700",
    },
  },
  izin: {
    label: "Izin",
    short: "I",
    badgeVariant: "info",
    colorClass: {
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-300",
      activeBg: "bg-sky-600",
      activeText: "text-white",
      activeBorder: "border-sky-700",
    },
  },
  sakit: {
    label: "Sakit",
    short: "S",
    badgeVariant: "warning",
    colorClass: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-300",
      activeBg: "bg-amber-600",
      activeText: "text-white",
      activeBorder: "border-amber-700",
    },
  },
  alpa: {
    label: "Alpa",
    short: "A",
    badgeVariant: "danger",
    colorClass: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-300",
      activeBg: "bg-rose-600",
      activeText: "text-white",
      activeBorder: "border-rose-700",
    },
  },
  dinas_luar: {
    label: "Dinas Luar",
    short: "DL",
    badgeVariant: "neutral",
    colorClass: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-300",
      activeBg: "bg-purple-600",
      activeText: "text-white",
      activeBorder: "border-purple-700",
    },
  },
};
