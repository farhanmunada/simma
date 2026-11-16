export type TahfidzType = "Z" | "M"; // Z: Ziyadah (setoran baru), M: Muraja'ah (pengulangan)

export type TahfidzStatus = "lulus" | "perlu_perbaikan";

export type TasmiStatus = "lulus" | "tidak_lulus" | "perlu_perbaikan";

export interface TahfidzRecord {
  id: string;
  studentId: string;
  teacherId?: string | null;
  type: TahfidzType;
  juz: number;
  surah: number;
  ayahStart: number;
  ayahEnd: number;
  tajwidScore: number;
  makhrojScore: number;
  fluencyScore: number;
  status: TahfidzStatus;
  notes?: string | null;
  date: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTahfidzRecordDto {
  studentId: string;
  teacherId?: string | null;
  type: TahfidzType;
  juz: number;
  surah: number;
  ayahStart: number;
  ayahEnd: number;
  tajwidScore: number;
  makhrojScore: number;
  fluencyScore: number;
  status: TahfidzStatus;
  notes?: string | null;
  date: string;
}

export type UpdateTahfidzRecordDto = Partial<CreateTahfidzRecordDto>;

export interface TahfidzQueryParams {
  page?: number;
  limit?: number;
  studentId?: string;
  teacherId?: string;
  type?: TahfidzType;
  juz?: number;
  surah?: number;
  status?: TahfidzStatus;
  startDate?: string;
  endDate?: string;
}

export interface TasmiExam {
  id: string;
  studentId: string;
  examinerId?: string | null;
  juz: number;
  tajwidScore: number;
  makhrojScore: number;
  fluencyScore: number;
  finalScore: number;
  status: TasmiStatus;
  notes?: string | null;
  examDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTasmiExamDto {
  studentId: string;
  examinerId?: string | null;
  juz: number;
  tajwidScore: number;
  makhrojScore: number;
  fluencyScore: number;
  finalScore: number;
  status: TasmiStatus;
  notes?: string | null;
  examDate: string;
}

export type UpdateTasmiExamDto = Partial<CreateTasmiExamDto>;

export interface TasmiQueryParams {
  page?: number;
  limit?: number;
  studentId?: string;
  examinerId?: string;
  juz?: number;
  status?: TasmiStatus;
  startDate?: string;
  endDate?: string;
}

export interface JuzProgress {
  juz: number;
  ziyadahCount: number;
  murajaahCount: number;
  totalPassedAyahs: number;
  tasmiStatus: TasmiStatus | "none";
  isCompleted: boolean;
}

export interface TahfidzProgressSummary {
  totalZiyadah: number;
  totalMurajaah: number;
  totalTasmiPassed: number;
  completedJuzCount: number;
  lastMemorized: {
    juz: number;
    surah: number;
    ayahEnd: number;
    date: string;
  } | null;
}

export interface StudentTahfidzProgress {
  studentId: string;
  juzMap: JuzProgress[];
  summary: TahfidzProgressSummary;
}

export interface StudentTahfidzHistory {
  studentId: string;
  records: TahfidzRecord[];
  tasmiExams: TasmiExam[];
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

export interface SurahMeta {
  number: number;
  name: string;
  totalAyahs: number;
}

