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

export const QURAN_SURAHS: SurahMeta[] = [
  { number: 1, name: "Al-Fatihah", totalAyahs: 7 },
  { number: 2, name: "Al-Baqarah", totalAyahs: 286 },
  { number: 3, name: "Ali 'Imran", totalAyahs: 200 },
  { number: 4, name: "An-Nisa'", totalAyahs: 176 },
  { number: 5, name: "Al-Ma'idah", totalAyahs: 120 },
  { number: 6, name: "Al-An'am", totalAyahs: 165 },
  { number: 7, name: "Al-A'raf", totalAyahs: 206 },
  { number: 8, name: "Al-Anfal", totalAyahs: 75 },
  { number: 9, name: "At-Taubah", totalAyahs: 129 },
  { number: 10, name: "Yunus", totalAyahs: 109 },
  { number: 11, name: "Hud", totalAyahs: 123 },
  { number: 12, name: "Yusuf", totalAyahs: 111 },
  { number: 13, name: "Ar-Ra'd", totalAyahs: 43 },
  { number: 14, name: "Ibrahim", totalAyahs: 52 },
  { number: 15, name: "Al-Hijr", totalAyahs: 99 },
  { number: 16, name: "An-Nahl", totalAyahs: 128 },
  { number: 17, name: "Al-Isra'", totalAyahs: 111 },
  { number: 18, name: "Al-Kahf", totalAyahs: 110 },
  { number: 19, name: "Maryam", totalAyahs: 98 },
  { number: 20, name: "Ta-Ha", totalAyahs: 135 },
  { number: 21, name: "Al-Anbiya'", totalAyahs: 112 },
  { number: 22, name: "Al-Hajj", totalAyahs: 78 },
  { number: 23, name: "Al-Mu'minun", totalAyahs: 118 },
  { number: 24, name: "An-Nur", totalAyahs: 64 },
  { number: 25, name: "Al-Furqan", totalAyahs: 77 },
  { number: 26, name: "Asy-Syu'ara'", totalAyahs: 227 },
  { number: 27, name: "An-Naml", totalAyahs: 93 },
  { number: 28, name: "Al-Qashas", totalAyahs: 88 },
  { number: 29, name: "Al-'Ankabut", totalAyahs: 69 },
  { number: 30, name: "Ar-Rum", totalAyahs: 60 },
  { number: 31, name: "Luqman", totalAyahs: 34 },
  { number: 32, name: "As-Sajdah", totalAyahs: 30 },
  { number: 33, name: "Al-Ahzab", totalAyahs: 73 },
  { number: 34, name: "Saba'", totalAyahs: 54 },
  { number: 35, name: "Fathir", totalAyahs: 45 },
  { number: 36, name: "Ya-Sin", totalAyahs: 83 },
  { number: 37, name: "Ash-Shaffat", totalAyahs: 182 },
  { number: 38, name: "Shad", totalAyahs: 88 },
  { number: 39, name: "Az-Zumar", totalAyahs: 75 },
  { number: 40, name: "Ghafir", totalAyahs: 85 },
  { number: 41, name: "Fushshilat", totalAyahs: 54 },
  { number: 42, name: "Asy-Syura", totalAyahs: 53 },
  { number: 43, name: "Az-Zukhruf", totalAyahs: 89 },
  { number: 44, name: "Ad-Dukhan", totalAyahs: 59 },
  { number: 45, name: "Al-Jasiyah", totalAyahs: 37 },
  { number: 46, name: "Al-Ahqaf", totalAyahs: 35 },
  { number: 47, name: "Muhammad", totalAyahs: 38 },
  { number: 48, name: "Al-Fath", totalAyahs: 29 },
  { number: 49, name: "Al-Hujurat", totalAyahs: 18 },
  { number: 50, name: "Qaf", totalAyahs: 45 },
  { number: 51, name: "Az-Zariyat", totalAyahs: 60 },
  { number: 52, name: "Ath-Thur", totalAyahs: 49 },
  { number: 53, name: "An-Najm", totalAyahs: 62 },
  { number: 54, name: "Al-Qamar", totalAyahs: 55 },
  { number: 55, name: "Ar-Rahman", totalAyahs: 78 },
  { number: 56, name: "Al-Waqi'ah", totalAyahs: 96 },
  { number: 57, name: "Al-Hadid", totalAyahs: 29 },
  { number: 58, name: "Al-Mujadilah", totalAyahs: 22 },
  { number: 59, name: "Al-Hasyr", totalAyahs: 24 },
  { number: 60, name: "Al-Mumtahanah", totalAyahs: 13 },
  { number: 61, name: "Ash-Shaff", totalAyahs: 14 },
  { number: 62, name: "Al-Jumu'ah", totalAyahs: 11 },
  { number: 63, name: "Al-Munafiqun", totalAyahs: 11 },
  { number: 64, name: "At-Taghabun", totalAyahs: 18 },
  { number: 65, name: "Ath-Thalaq", totalAyahs: 12 },
  { number: 66, name: "At-Tahrim", totalAyahs: 12 },
  { number: 67, name: "Al-Mulk", totalAyahs: 30 },
  { number: 68, name: "Al-Qalam", totalAyahs: 52 },
  { number: 69, name: "Al-Haqqah", totalAyahs: 52 },
  { number: 70, name: "Al-Ma'arij", totalAyahs: 44 },
  { number: 71, name: "Nuh", totalAyahs: 28 },
  { number: 72, name: "Al-Jinn", totalAyahs: 28 },
  { number: 73, name: "Al-Muzzammil", totalAyahs: 20 },
  { number: 74, name: "Al-Muddassir", totalAyahs: 56 },
  { number: 75, name: "Al-Qiyamah", totalAyahs: 40 },
  { number: 76, name: "Al-Insan", totalAyahs: 31 },
  { number: 77, name: "Al-Mursalat", totalAyahs: 50 },
  { number: 78, name: "An-Naba'", totalAyahs: 40 },
  { number: 79, name: "An-Nazi'at", totalAyahs: 46 },
  { number: 80, name: "'Abasa", totalAyahs: 42 },
  { number: 81, name: "At-Takwir", totalAyahs: 29 },
  { number: 82, name: "Al-Infithar", totalAyahs: 19 },
  { number: 83, name: "Al-Muthaffifin", totalAyahs: 36 },
  { number: 84, name: "Al-Insyiqaq", totalAyahs: 25 },
  { number: 85, name: "Al-Buruj", totalAyahs: 22 },
  { number: 86, name: "Ath-Thariq", totalAyahs: 17 },
  { number: 87, name: "Al-A'la", totalAyahs: 19 },
  { number: 88, name: "Al-Ghasyiyah", totalAyahs: 26 },
  { number: 89, name: "Al-Fajr", totalAyahs: 30 },
  { number: 90, name: "Al-Balad", totalAyahs: 20 },
  { number: 91, name: "Asy-Syams", totalAyahs: 15 },
  { number: 92, name: "Al-Lail", totalAyahs: 21 },
  { number: 93, name: "Adh-Dhuha", totalAyahs: 11 },
  { number: 94, name: "Asy-Syarh", totalAyahs: 8 },
  { number: 95, name: "At-Tin", totalAyahs: 8 },
  { number: 96, name: "Al-'Alaq", totalAyahs: 19 },
  { number: 97, name: "Al-Qadr", totalAyahs: 5 },
  { number: 98, name: "Al-Bayyinah", totalAyahs: 8 },
  { number: 99, name: "Az-Zalzalah", totalAyahs: 8 },
  { number: 100, name: "Al-'Adiyat", totalAyahs: 11 },
  { number: 101, name: "Al-Qari'ah", totalAyahs: 11 },
  { number: 102, name: "At-Takatsur", totalAyahs: 8 },
  { number: 103, name: "Al-'Ashr", totalAyahs: 3 },
  { number: 104, name: "Al-Humazah", totalAyahs: 9 },
  { number: 105, name: "Al-Fil", totalAyahs: 5 },
  { number: 106, name: "Quraisy", totalAyahs: 4 },
  { number: 107, name: "Al-Ma'un", totalAyahs: 7 },
  { number: 108, name: "Al-Kautsar", totalAyahs: 3 },
  { number: 109, name: "Al-Kafirun", totalAyahs: 6 },
  { number: 110, name: "An-Nashr", totalAyahs: 3 },
  { number: 111, name: "Al-Lahab", totalAyahs: 5 },
  { number: 112, name: "Al-Ikhlash", totalAyahs: 4 },
  { number: 113, name: "Al-Falaq", totalAyahs: 5 },
  { number: 114, name: "An-Nas", totalAyahs: 6 },
];

export function getSurahName(surahNumber: number): string {
  const found = QURAN_SURAHS.find((s) => s.number === surahNumber);
  return found ? found.name : `Surah ${surahNumber}`;
}
