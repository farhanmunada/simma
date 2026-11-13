export interface StudentReportGrade {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  group: string;
  finalScore: number;
  letterGrade: string;
  description: string;
}

export interface ReportAttendanceSummary {
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  total: number;
  percentage: number;
}

export interface ReportTahfidzSummary {
  totalJuz: number;
  recordsCount: number;
  lastSurah: string | null;
  passedExamsCount: number;
}

export interface ExtracurricularItem {
  name: string;
  score?: string;
  description?: string;
}

export interface AchievementItem {
  description: string;
  type?: string;
}

export interface StudentReportNotes {
  teacherNotes: string;
  spiritualAttitude: string;
  socialAttitude: string;
  extracurriculars: ExtracurricularItem[];
  achievements: AchievementItem[];
  updatedAt?: string;
}

export interface StudentReportCard {
  student: {
    id: string;
    fullName: string;
    nisn: string | null;
    nis: string | null;
    gender: string;
    birthPlace: string;
    birthDate: string;
  };
  institution: {
    name: string;
    nsm: string;
    npsn: string;
    address: string;
  };
  academicYear: {
    id: string;
    name: string;
  };
  semester: {
    id: string;
    type: number;
  };
  classroom: {
    id: string;
    name: string;
    gradeLevel: number;
    homeroomTeacher: {
      id: string;
      fullName: string;
      nuptk?: string | null;
    } | null;
  };
  grades: StudentReportGrade[];
  attendance: ReportAttendanceSummary;
  tahfidz: ReportTahfidzSummary;
  notes: StudentReportNotes;
  summary: {
    totalScore: number;
    averageScore: number;
    rankInClass: number | null;
    totalStudentsInClass: number;
  };
}

export interface LeggerStudentGrade {
  subjectId: string;
  subjectCode: string;
  score: number;
  letterGrade: string;
}

export interface LeggerStudentEntry {
  studentId: string;
  fullName: string;
  nisn: string | null;
  nis: string | null;
  gender: string;
  grades: LeggerStudentGrade[];
  totalScore: number;
  averageScore: number;
  rank: number;
  attendance: {
    hadir: number;
    izin: number;
    sakit: number;
    alpa: number;
  };
}

export interface ClassroomLegger {
  classroom: {
    id: string;
    name: string;
    gradeLevel: number;
    homeroomTeacher: {
      id: string;
      fullName: string;
      nuptk?: string | null;
    } | null;
  };
  academicYear: {
    id: string;
    name: string;
  };
  semester: {
    id: string;
    type: number;
  };
  subjects: Array<{
    id: string;
    code: string;
    name: string;
    group: string;
  }>;
  students: LeggerStudentEntry[];
  classStatistics: {
    totalStudents: number;
    classAverage: number;
    highestScore: number;
    lowestScore: number;
  };
}

export interface ReportCardQueryParams {
  includeTahfidz?: boolean;
  includeAttendance?: boolean;
}

export interface LeggerQueryParams {
  sortBy?: "rank" | "name" | "nisn" | "totalScore";
  order?: "asc" | "desc";
}

export interface ReportNotesBodyInput {
  semesterId: string;
  classroomId?: string;
  teacherNotes: string;
  spiritualAttitude?: string;
  socialAttitude?: string;
  extracurriculars?: ExtracurricularItem[];
  achievements?: AchievementItem[];
}

