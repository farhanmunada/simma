import type {
  MutabaahActivityCategory,
  MutabaahEntryStatus,
  MutabaahUzurType,
  MutabaahComplianceStatus,
  StudentComplianceSummary,
  EarlyWarningAlert,
} from "@simma/shared";

export type {
  MutabaahActivityCategory,
  MutabaahEntryStatus,
  MutabaahUzurType,
  MutabaahComplianceStatus,
  StudentComplianceSummary,
  EarlyWarningAlert,
};

export interface MutabaahActivityDto {
  id: string;
  name: string;
  category: MutabaahActivityCategory;
  targetCount: number;
  unit: string;
  weight: number;
  isMandatory: boolean;
  genderSpecific: "all" | "L" | "P";
  orderIndex: number;
  isActive: boolean;
}

export interface StudentChecklistEntryDto {
  activityId: string;
  activityName: string;
  category: MutabaahActivityCategory;
  weight: number;
  status: MutabaahEntryStatus;
  score: number;
  volume: number;
  notes?: string | null;
}

export interface StudentDailyChecklistRowDto {
  studentId: string;
  studentName: string;
  nisn?: string | null;
  gender: string;
  classroomId?: string | null;
  className?: string | null;
  isUzur: boolean;
  uzurNotes?: string | null;
  entries: StudentChecklistEntryDto[];
}

export interface ClassroomDailyChecklistResponseDto {
  date: string;
  classroomId?: string | null;
  className?: string | null;
  totalStudents: number;
  activities: MutabaahActivityDto[];
  students: StudentDailyChecklistRowDto[];
}

export interface MutabaahUzurRecordDto {
  id: string;
  studentId: string;
  uzurType: MutabaahUzurType;
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
  recordedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}
