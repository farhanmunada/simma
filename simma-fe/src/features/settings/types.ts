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

export type UpdateAcademicYearDto = Partial<CreateAcademicYearDto>;

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

export type UpdateSemesterDto = Partial<CreateSemesterDto>;

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

export type UpdateClassroomDto = Partial<CreateClassroomDto>;

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

export type UpdateSubjectDto = Partial<CreateSubjectDto>;

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

export type UpdateTeacherDto = Partial<CreateTeacherDto>;

export interface Institution {
  id?: string;
  nsm: string;
  npsn: string;
  name: string;
  level?: "MA";
  status: "negeri" | "swasta" | "NEGERI" | "SWASTA";
  address?: string | null;
  logoPath?: string | null;
  emisData?: Record<string, any>;
  village?: string | null;
  district?: string | null;
  city?: string | null;
  province?: string | null;
  headmasterName?: string | null;
  headmasterNip?: string | null;
  accreditation?: "A" | "B" | "C" | "BELUM" | null;
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateInstitutionDto = Partial<{
  nsm: string;
  npsn: string;
  name: string;
  status: "negeri" | "swasta" | "NEGERI" | "SWASTA";
  address: string;
  logoPath?: string | null;
  emisData?: Record<string, any>;
}>;

export interface SetupWizardData {
  institution: {
    nsm: string;
    npsn: string;
    name: string;
    status: "NEGERI" | "SWASTA";
    level: "MA";
    address: string;
    headmasterName: string;
    headmasterNip?: string;
    accreditation: "A" | "B" | "C" | "BELUM";
  };
  academicYear: {
    name: string;
    startDate: string;
    endDate: string;
  };
  semester: {
    type: 1 | 2;
    startDate: string;
    endDate: string;
  };
  classrooms: Array<{
    name: string;
    gradeLevel: number;
    capacity: number;
  }>;
  adminUser: {
    name: string;
    email: string;
    role: string;
  };
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
