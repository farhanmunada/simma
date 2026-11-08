export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAcademicYearDto {
  name: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface Semester {
  id: string;
  academicYearId: string;
  type: 1 | 2; // 1: Ganjil, 2: Genap
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSemesterDto {
  academicYearId: string;
  type: 1 | 2;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface Classroom {
  id: string;
  semesterId: string;
  name: string;
  gradeLevel: number;
  homeroomTeacherId?: string | null;
  capacity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateClassroomDto {
  semesterId: string;
  name: string;
  gradeLevel: number;
  homeroomTeacherId?: string | null;
  capacity?: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  group: string;
  jpPerWeek: number;
  isRequired: boolean;
  phase: "E" | "F";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubjectDto {
  code: string;
  name: string;
  group: string;
  jpPerWeek: number;
  isRequired?: boolean;
  phase: "E" | "F";
}

export interface Teacher {
  id: string;
  userId?: string | null;
  nik: string;
  nuptk?: string | null;
  fullName: string;
  employmentType: "PNS" | "PPPK" | "GTY" | "GTT";
  certification?: string | null;
  emisData?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeacherDto {
  nik: string;
  nuptk?: string | null;
  fullName: string;
  employmentType: "PNS" | "PPPK" | "GTY" | "GTT";
  certification?: string | null;
}

export interface QueryFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  semesterId?: string;
  academicYearId?: string;
  gradeLevel?: number;
  phase?: "E" | "F";
  employmentType?: "PNS" | "PPPK" | "GTY" | "GTT";
}
