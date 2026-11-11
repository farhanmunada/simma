import type {
  Extracurricular,
  CreateExtracurricularInput,
  UpdateExtracurricularInput,
  ExtracurricularMember,
  CreateExtracurricularMemberInput,
  UpdateExtracurricularMemberInput,
  ExtracurricularGrade,
  UpsertExtracurricularGradeInput,
  BatchUpsertExtracurricularGradesInput,
  ExtracurricularCategory,
  ExtracurricularRole,
  ExtracurricularMemberStatus,
  ExtracurricularGradeScore,
} from "@simma/shared";
import type {
  ExtracurricularRow,
  NewExtracurricularRow,
  ExtracurricularMemberRow,
  NewExtracurricularMemberRow,
  ExtracurricularGradeRow,
  NewExtracurricularGradeRow,
} from "../../db/schema/index.js";

export type {
  Extracurricular,
  CreateExtracurricularInput,
  UpdateExtracurricularInput,
  ExtracurricularMember,
  CreateExtracurricularMemberInput,
  UpdateExtracurricularMemberInput,
  ExtracurricularGrade,
  UpsertExtracurricularGradeInput,
  BatchUpsertExtracurricularGradesInput,
  ExtracurricularCategory,
  ExtracurricularRole,
  ExtracurricularMemberStatus,
  ExtracurricularGradeScore,
  ExtracurricularRow,
  NewExtracurricularRow,
  ExtracurricularMemberRow,
  NewExtracurricularMemberRow,
  ExtracurricularGradeRow,
  NewExtracurricularGradeRow,
};

export interface ExtracurricularEnriched extends ExtracurricularRow {
  coachName?: string | null;
  coachNuptk?: string | null;
  activeMemberCount?: number;
}

export interface ExtracurricularMemberEnriched extends ExtracurricularMemberRow {
  studentName?: string;
  studentNis?: string | null;
  studentNisn?: string | null;
  extracurricularName?: string;
  extracurricularCategory?: string;
  academicYearName?: string;
  gradeScore?: string | null;
  gradeNotes?: string | null;
}

export interface ExtracurricularGradeEnriched extends ExtracurricularGradeRow {
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

export interface RdmReportExtracurricularItem {
  name: string;
  score: string;
  description: string;
}
