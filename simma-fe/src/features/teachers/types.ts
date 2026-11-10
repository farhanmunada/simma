import type {
  EmploymentType,
  GtkType,
  DutyStatus,
  AdditionalDutyType,
  SimpatikaStatus,
  GradeGroup,
  EducationLevel,
  TeacherDocumentType,
} from "@simma/shared";

export interface TeacherProfileDto {
  id?: string;
  teacherId?: string;
  nip?: string | null;
  pegId?: string | null;
  nrg?: string | null;
  noKk?: string | null;
  birthPlace?: string | null;
  birthDate?: string | null;
  gender?: "L" | "P" | null;
  religion?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  marriageStatus?: "menikah" | "belum_menikah" | "duda_janda" | null;
  tmtFirst?: string | null;
  tmtPns?: string | null;
  dutyStatus?: DutyStatus;
  gtkType?: GtkType;
  certificationField?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherEducationDto {
  id: string;
  teacherId: string;
  level: EducationLevel;
  institution: string;
  major: string;
  graduationYear: number;
  gpa?: string | null;
  certificateNumber?: string | null;
  isLinear: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherRankDto {
  id: string;
  teacherId: string;
  rank: string;
  gradeGroup: GradeGroup;
  skNumber: string;
  skDate: string;
  tmtRank: string;
  salary?: number | null;
  nextPromotionDate?: string | null;
  nextKgbDate?: string | null;
  isCurrent: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherDocumentDto {
  id: string;
  teacherId: string;
  documentType: TeacherDocumentType;
  title: string;
  documentNumber?: string | null;
  issueDate?: string | null;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
  verificationStatus: "pending" | "verified" | "rejected";
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherWorkloadDto {
  id: string;
  teacherId: string;
  academicYearId: string;
  semesterId: string;
  teachingJtm: number;
  additionalDutyType: AdditionalDutyType;
  additionalDutyJtm: number;
  totalJtm: number;
  isEligibleTpg: boolean;
  simpatikaStatus: SimpatikaStatus;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherListItem {
  id: string;
  userId: string | null;
  nik: string;
  nuptk: string | null;
  fullName: string;
  employmentType: EmploymentType;
  certification: string | null;
  emisData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  profile?: TeacherProfileDto | null;
  currentRank?: TeacherRankDto | null;
  currentWorkload?: TeacherWorkloadDto | null;
}

export interface TeacherFullDetailDto extends TeacherListItem {
  profile: TeacherProfileDto | null;
  educations: TeacherEducationDto[];
  ranks: TeacherRankDto[];
  documents: TeacherDocumentDto[];
  workloads: TeacherWorkloadDto[];
}

export interface WorkloadSummaryDto {
  teacherId: string;
  fullName: string;
  nik: string;
  nuptk: string | null;
  employmentType: EmploymentType;
  teachingJtm: number;
  additionalDutyType: AdditionalDutyType;
  additionalDutyJtm: number;
  totalJtm: number;
  isEligibleTpg: boolean;
  simpatikaStatus: SimpatikaStatus;
}

export interface GtkStatsDto {
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
