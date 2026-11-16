import type {
  P5raTheme,
  P5raFase,
  P5raStatus,
  P5raDimension,
  P5raPredicate,
} from "@simma/shared";

export interface P5raProjectItem {
  id: string;
  academicYearId: string;
  semesterId: string;
  title: string;
  theme: P5raTheme;
  description: string;
  targetFase: P5raFase;
  coordinatorTeacherId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: P5raStatus;
  createdAt: string;
  updatedAt: string;
}

export interface P5raTargetItem {
  id: string;
  projectId: string;
  dimension: P5raDimension;
  element: string;
  subElement: string;
  targetDescription: string;
  valuePra?: string | null;
  subValuePra?: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt?: string;
}

export interface P5raClassroomRef {
  id: string;
  name: string;
  gradeLevel: number;
}

export interface P5raProjectDetail extends P5raProjectItem {
  classrooms: P5raClassroomRef[];
  targets: P5raTargetItem[];
}

export interface P5raStudentAssessmentItem {
  id?: string;
  targetId: string;
  studentId: string;
  predicate: P5raPredicate;
  notes?: string | null;
}

export interface P5raStudentNoteItem {
  id?: string;
  projectId: string;
  studentId: string;
  processNotes: string;
}

export interface StudentAssessmentRow {
  student: {
    id: string;
    nisn?: string | null;
    nis?: string | null;
    fullName: string;
    gender: string;
  };
  classroom?: {
    id: string;
    name: string;
  } | null;
  assessments: Array<{
    id: string;
    targetId: string;
    predicate: P5raPredicate;
    notes?: string | null;
  }>;
  processNotes?: P5raStudentNoteItem | null;
}

export interface P5raRecapResponse {
  totalStudents: number;
  targets: Array<{
    target: P5raTargetItem;
    counts: {
      MB: number;
      SB: number;
      BSH: number;
      SAB: number;
    };
  }>;
  overallCounts: {
    MB: number;
    SB: number;
    BSH: number;
    SAB: number;
    total: number;
  };
}

export interface P5raReportViewData {
  institution: {
    name: string;
    nsm: string;
    npsn: string;
    address: string;
  };
  academicYear: {
    name: string;
  };
  semester: {
    type: number;
  };
  student: {
    id: string;
    fullName: string;
    nis: string | null;
    nisn: string | null;
  };
  classroom: {
    name: string;
    gradeLevel: number;
  };
  project: P5raProjectItem;
  targetsWithAssessment: Array<{
    target: P5raTargetItem;
    assessment: {
      predicate: P5raPredicate;
      notes: string | null;
    } | null;
  }>;
  processNotes: P5raStudentNoteItem | null;
  dateGenerated: string;
}
