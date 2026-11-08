import type {
  Assessment,
  NewAssessment,
  StudentGrade,
  NewStudentGrade,
  SemesterGrade,
  NewSemesterGrade,
} from "../../db/schema/grades.js";

export type {
  Assessment,
  NewAssessment,
  StudentGrade,
  NewStudentGrade,
  SemesterGrade,
  NewSemesterGrade,
};

export interface AssessmentWithGrades extends Assessment {
  grades?: StudentGrade[];
}

export interface StudentGradeWithStudent extends StudentGrade {
  student?: {
    id: string;
    fullName: string;
    nisn?: string | null;
    nis?: string | null;
  };
}

export interface SemesterGradeCalculationResult {
  studentId: string;
  classroomId: string;
  subjectId: string;
  semesterId: string;
  finalScore: number;
  letterGrade: "A" | "B" | "C" | "D";
}

export interface BatchCalculationResponse {
  calculatedCount: number;
  grades: SemesterGrade[];
}
