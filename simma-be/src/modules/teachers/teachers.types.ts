import type {
  Teacher,
  Position,
  TeacherProfile,
  TeacherEducation,
  TeacherRankRecord,
  TeacherDocument,
  TeacherWorkload,
} from "../../db/schema/index.js";
import type {
  EmploymentType,
  GtkType,
  DutyStatus,
  AdditionalDutyType,
  SimpatikaStatus,
  GradeGroup,
} from "@simma/shared";

export interface TeacherWithDetails extends Teacher {
  position?: Position | null;
  profile?: TeacherProfile | null;
  currentRank?: TeacherRankRecord | null;
  currentWorkload?: TeacherWorkload | null;
  educationCount?: number;
  documentCount?: number;
}

export interface TeacherFullDetail extends Teacher {
  position?: Position | null;
  profile: TeacherProfile | null;
  educations: TeacherEducation[];
  ranks: TeacherRankRecord[];
  documents: TeacherDocument[];
  workloads: TeacherWorkload[];
}

export interface WorkloadSummary {
  teacherId: string;
  fullName: string;
  nik: string;
  nuptk: string | null;
  employmentType: string;
  teachingJtm: number;
  additionalDutyType: AdditionalDutyType;
  additionalDutyJtm: number;
  totalJtm: number;
  isEligibleTpg: boolean;
  simpatikaStatus: SimpatikaStatus;
}

export interface GtkStats {
  totalGtk: number;
  totalPendidik: number;
  totalTenagaKependidikan: number;
  pnsCount: number;
  pppkCount: number;
  gtyCount: number;
  gttCount: number;
  pttCount: number;
  certifiedCount: number;
  eligibleTpgCount: number;
  averageJtm: number;
}

export interface EmisGtkRecord {
  nik: string;
  nuptk: string;
  pegId: string;
  nip: string;
  nrg: string;
  fullName: string;
  gender: string;
  birthPlace: string;
  birthDate: string;
  employmentType: string;
  gtkType: string;
  dutyStatus: string;
  tmtFirst: string;
  highestEducation: string;
  major: string;
  isCertified: boolean;
  certificationField: string;
  totalJtm: number;
  isEligibleTpg: boolean;
}
