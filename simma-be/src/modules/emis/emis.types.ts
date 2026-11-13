import type {
  EmisEntityType,
  EmisExportFormat,
  EmisExportType,
  EmisBapStatus,
} from "@simma/shared";

export type EmisSeverity = "critical" | "warning";

export interface EmisAnomalyItem {
  id: string;
  entityType: "student" | "teacher" | "classroom" | "institution";
  recordId: string;
  identifier: string; // NISN / NIK / Code / Name
  name: string;
  fieldName: string;
  issueReason: string;
  severity: EmisSeverity;
  resolutionHint: string;
}

export interface EmisEntityReadiness {
  total: number;
  ready: number;
  valid?: number;
  invalid: number;
  percentage: number;
}

export interface EmisReadinessSummary {
  overallPercentage: number;
  isReadyForExport: boolean;
  students: EmisEntityReadiness;
  teachers: EmisEntityReadiness;
  classrooms: EmisEntityReadiness;
  institution: EmisEntityReadiness;
  totalAnomalies: number;
  criticalAnomalies: number;
  warningAnomalies: number;
}

export interface EmisStudentExportRow {
  no: number;
  nik: string;
  nisn: string;
  nis: string;
  fullName: string;
  gender: string;
  birthPlace: string;
  birthDate: string;
  motherName: string;
  motherNik: string;
  fatherName: string;
  fatherNik: string;
  classroomName: string;
  gradeLevel: string;
  status: string;
}

export interface EmisTeacherExportRow {
  no: number;
  nik: string;
  nuptk: string;
  pegId: string;
  nip: string;
  fullName: string;
  gender: string;
  birthPlace: string;
  birthDate: string;
  employmentType: string;
  gtkType: string;
  dutyStatus: string;
  highestEducation: string;
  major: string;
  isCertified: string;
  certificationField: string;
  totalJtm: number;
}

export interface EmisClassroomExportRow {
  no: number;
  classroomName: string;
  gradeLevel: number;
  homeroomTeacherName: string;
  homeroomTeacherNuptk: string;
  studentCount: number;
  capacity: number;
}

export interface EmisInstitutionExportRow {
  nsm: string;
  npsn: string;
  name: string;
  status: string;
  address: string;
  academicYear: string;
  semester: string;
  headmasterName: string;
}

export interface EmisBapRecord {
  id: string;
  bapNumber: string;
  academicYear: string;
  semester: string;
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  totalTeachers: number;
  pnsTeachers: number;
  nonPnsTeachers: number;
  totalClassrooms: number;
  readinessPercentage: number;
  status: EmisBapStatus;
  headmasterName: string;
  operatorName: string;
  signedAt?: string;
  notes?: string;
  createdAt: string;
}
