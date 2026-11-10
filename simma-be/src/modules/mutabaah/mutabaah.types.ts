import type {
  MutabaahActivity,
  NewMutabaahActivity,
  MutabaahDailyEntry,
  NewMutabaahDailyEntry,
  MutabaahUzurRecord,
  NewMutabaahUzurRecord,
} from "../../db/schema/mutabaah.js";
import type {
  MutabaahActivityCategory,
  MutabaahEntryStatus,
  MutabaahUzurType,
  MutabaahComplianceStatus,
  StudentComplianceSummary,
  EarlyWarningAlert,
} from "@simma/shared";

export type {
  MutabaahActivity,
  NewMutabaahActivity,
  MutabaahDailyEntry,
  NewMutabaahDailyEntry,
  MutabaahUzurRecord,
  NewMutabaahUzurRecord,
  MutabaahActivityCategory,
  MutabaahEntryStatus,
  MutabaahUzurType,
  MutabaahComplianceStatus,
  StudentComplianceSummary,
  EarlyWarningAlert,
};

export interface StudentChecklistEntry {
  activityId: string;
  activityName: string;
  category: MutabaahActivityCategory;
  weight: number;
  status: MutabaahEntryStatus;
  score: number;
  volume: number;
  notes?: string | null;
}

export interface StudentDailyChecklistRow {
  studentId: string;
  studentName: string;
  nisn?: string | null;
  gender: string;
  classroomId?: string | null;
  className?: string | null;
  isUzur: boolean;
  uzurNotes?: string | null;
  entries: StudentChecklistEntry[];
}

export interface ClassroomDailyChecklistResponse {
  date: string;
  classroomId?: string | null;
  className?: string | null;
  totalStudents: number;
  activities: MutabaahActivity[];
  students: StudentDailyChecklistRow[];
}

export interface StudentMonthlyReportData {
  student: {
    id: string;
    fullName: string;
    nisn?: string | null;
    nis?: string | null;
    gender: string;
  };
  classroom: {
    id: string;
    name: string;
  };
  institution: {
    name: string;
    nsm?: string | null;
    npsn?: string | null;
    address?: string | null;
  };
  period: {
    month: number;
    year: number;
    startDate: string;
    endDate: string;
  };
  summary: StudentComplianceSummary;
  activityStats: Array<{
    activityId: string;
    activityName: string;
    category: MutabaahActivityCategory;
    targetCount: number;
    completedCount: number;
    masbukCount: number;
    uzurCount: number;
    missedCount: number;
    percentage: number;
  }>;
}
