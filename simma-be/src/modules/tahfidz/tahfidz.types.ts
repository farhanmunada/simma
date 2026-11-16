import type {
  TahfidzRecord,
  NewTahfidzRecord,
  TasmiExam,
  NewTasmiExam,
} from "../../db/schema/tahfidz.js";
import type { TasmiStatus } from "@simma/shared";

export type { TahfidzRecord, NewTahfidzRecord, TasmiExam, NewTasmiExam };

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

export interface TahfidzProgressResponse {
  studentId: string;
  juzMap: JuzProgress[];
  summary: TahfidzProgressSummary;
}

export interface StudentTahfidzHistory {
  studentId: string;
  records: TahfidzRecord[];
  tasmiExams: TasmiExam[];
}
