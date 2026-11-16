export type GradeAssessmentType =
  | "formatif"
  | "sumatif_lingkup_materi"
  | "sumatif_tengah_semester"
  | "sumatif_akhir_semester"
  | "harian"
  | "tugas"
  | "uts"
  | "uas";

export type LetterGrade = "A" | "B" | "C" | "D";

export interface Assessment {
  id: string;
  subjectId: string;
  classroomId: string;
  teacherId?: string | null;
  academicYearId: string;
  semesterId: string;
  type: GradeAssessmentType;
  title: string;
  maxScore: number;
  weight: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAssessmentDto {
  subjectId: string;
  classroomId: string;
  teacherId?: string | null;
  academicYearId: string;
  semesterId: string;
  type: GradeAssessmentType;
  title: string;
  maxScore?: number;
  weight?: number;
}

export type UpdateAssessmentDto = Partial<CreateAssessmentDto>;

export interface AssessmentQueryParams {
  subjectId?: string;
  classroomId?: string;
  teacherId?: string;
  academicYearId?: string;
  semesterId?: string;
  type?: GradeAssessmentType;
  page?: number;
  limit?: number;
}

export interface StudentGrade {
  id: string;
  assessmentId: string;
  studentId: string;
  score: number;
  feedback?: string | null;
  createdAt?: string;
  updatedAt?: string;
  student?: {
    id: string;
    fullName: string;
    nisn?: string | null;
    nis?: string | null;
  };
}

export interface BatchStudentGradeItem {
  studentId: string;
  score: number;
  feedback?: string | null;
}

export interface BatchUpsertGradesDto {
  assessmentId: string;
  grades: BatchStudentGradeItem[];
}

export interface SemesterGrade {
  id: string;
  studentId: string;
  classroomId: string;
  subjectId: string;
  semesterId: string;
  finalScore: number;
  letterGrade: LetterGrade;
  createdAt?: string;
  updatedAt?: string;
  student?: {
    id: string;
    fullName: string;
    nisn?: string | null;
    nis?: string | null;
  };
}

export interface CreateSemesterGradeDto {
  studentId: string;
  classroomId: string;
  subjectId: string;
  semesterId: string;
  finalScore: number;
  letterGrade?: LetterGrade;
}

export type UpdateSemesterGradeDto = Partial<CreateSemesterGradeDto>;

export interface CalculateSemesterGradesDto {
  classroomId: string;
  subjectId: string;
  semesterId: string;
}

export interface SemesterGradeQueryParams {
  classroomId?: string;
  subjectId?: string;
  semesterId?: string;
  studentId?: string;
  page?: number;
  limit?: number;
}

export interface BatchCalculationResponse {
  calculatedCount: number;
  grades: SemesterGrade[];
}

export interface PaginatedResult<T> {
  data: T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
