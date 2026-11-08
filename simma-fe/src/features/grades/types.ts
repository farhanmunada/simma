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

// Helpers & Dictionaries
export const ASSESSMENT_TYPE_OPTIONS: Array<{
  value: GradeAssessmentType;
  label: string;
}> = [
  { value: "harian", label: "Formatif / Penilaian Harian" },
  { value: "tugas", label: "Sumatif Lingkup Materi / Tugas" },
  { value: "uts", label: "Sumatif Tengah Semester (STS / UTS)" },
  { value: "uas", label: "Sumatif Akhir Semester (SAS / UAS)" },
];

export function normalizeAssessmentType(type: GradeAssessmentType | string): string {
  switch (type) {
    case "formatif":
      return "harian";
    case "sumatif_lingkup_materi":
      return "tugas";
    case "sumatif_tengah_semester":
      return "uts";
    case "sumatif_akhir_semester":
      return "uas";
    default:
      return type;
  }
}

export function formatAssessmentTypeLabel(type: GradeAssessmentType | string): string {
  switch (type) {
    case "formatif":
    case "harian":
      return "Formatif / Harian";
    case "sumatif_lingkup_materi":
    case "tugas":
      return "Sumatif Lingkup Materi";
    case "sumatif_tengah_semester":
    case "uts":
      return "Sumatif Tengah Semester (STS / UTS)";
    case "sumatif_akhir_semester":
    case "uas":
      return "Sumatif Akhir Semester (SAS / UAS)";
    default:
      return type;
  }
}

export function calculateLetterGrade(score: number): LetterGrade {
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
}

export function getLetterGradeBadgeClass(letter: LetterGrade): string {
  switch (letter) {
    case "A":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "B":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "C":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "D":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}
