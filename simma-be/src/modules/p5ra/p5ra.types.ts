import type {
  P5raProject,
  P5raProjectTarget,
  P5raAssessment,
  P5raStudentNote,
  Student,
  Classroom,
  AcademicYear,
  Semester,
  Institution,
} from "../../db/schema/index.js";
import type { P5raPredicate } from "@simma/shared";

export interface ProjectWithClassrooms extends P5raProject {
  classrooms: Classroom[];
  targetCount?: number;
  studentCount?: number;
}

export interface StudentAssessmentRow {
  student: Student;
  classroom: Classroom;
  assessments: Record<string, { predicate: P5raPredicate; notes?: string | null }>;
  processNotes?: string | null;
}

export interface TargetPredicateRecap {
  targetId: string;
  dimension: string;
  element: string;
  subElement: string;
  valuePra: string;
  counts: {
    MB: number;
    SB: number;
    BSH: number;
    SAB: number;
    total: number;
  };
}

export interface ProjectRecapData {
  project: P5raProject;
  totalStudents: number;
  targetRecap: TargetPredicateRecap[];
  overallCounts: {
    MB: number;
    SB: number;
    BSH: number;
    SAB: number;
    total: number;
  };
}

export interface StudentP5raReportData {
  institution: Institution;
  academicYear: AcademicYear;
  semester: Semester;
  student: Student;
  classroom: Classroom;
  project: P5raProject;
  targetsWithAssessment: Array<{
    target: P5raProjectTarget;
    assessment?: P5raAssessment | null;
  }>;
  processNotes?: P5raStudentNote | null;
  dateGenerated: string;
}
