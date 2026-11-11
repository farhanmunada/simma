import type {
  ExtracurricularCategory,
  ExtracurricularRole,
  ExtracurricularMemberStatus,
  ExtracurricularGradeScore,
  Extracurricular,
  CreateExtracurricularInput,
  UpdateExtracurricularInput,
  ExtracurricularMember,
  CreateExtracurricularMemberInput,
  UpdateExtracurricularMemberInput,
  ExtracurricularGrade,
  UpsertExtracurricularGradeInput,
  BatchUpsertExtracurricularGradesInput,
} from "@simma/shared";

export type {
  ExtracurricularCategory,
  ExtracurricularRole,
  ExtracurricularMemberStatus,
  ExtracurricularGradeScore,
  Extracurricular,
  CreateExtracurricularInput,
  UpdateExtracurricularInput,
  ExtracurricularMember,
  CreateExtracurricularMemberInput,
  UpdateExtracurricularMemberInput,
  ExtracurricularGrade,
  UpsertExtracurricularGradeInput,
  BatchUpsertExtracurricularGradesInput,
};

export interface ExtracurricularItem {
  id: string;
  code: string;
  name: string;
  category: ExtracurricularCategory;
  coachId?: string | null;
  coachName?: string | null;
  coachNuptk?: string | null;
  scheduleDay?: string | null;
  scheduleTime?: string | null;
  venue?: string | null;
  maxCapacity?: number | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExtracurricularMemberItem {
  id: string;
  extracurricularId: string;
  studentId: string;
  academicYearId: string;
  semester: "ganjil" | "genap";
  role: ExtracurricularRole;
  joinedDate: string;
  status: ExtracurricularMemberStatus;
  createdAt?: string;
  updatedAt?: string;
  studentName?: string;
  studentNis?: string | null;
  studentNisn?: string | null;
  extracurricularName?: string;
  extracurricularCategory?: string;
  academicYearName?: string;
  gradeScore?: string | null;
  gradeNotes?: string | null;
}

export interface ExtracurricularGradeItem {
  id: string;
  extracurricularMemberId: string;
  academicYearId: string;
  semester: "ganjil" | "genap";
  score: ExtracurricularGradeScore;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
  studentId?: string;
  studentName?: string;
  studentNis?: string | null;
  studentNisn?: string | null;
  extracurricularId?: string;
  extracurricularName?: string;
  memberRole?: string;
}

export interface ExtracurricularStats {
  totalExtracurriculars: number;
  totalMembers: number;
  totalGrades: number;
  categoryDistribution: Record<string, number>;
}

export type ExtracurricularTab = "master" | "members" | "grades";
