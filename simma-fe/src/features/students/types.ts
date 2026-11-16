export type StudentStatus =
  | "aktif"
  | "tidak_aktif"
  | "aktif_tanpa_rombel"
  | "lulus"
  | "mutasi_keluar"
  | "do";

export type Gender = "L" | "P";

export type ParentRelationType = "ayah" | "ibu" | "wali";

export interface StudentClassroom {
  id: string;
  name: string;
  gradeLevel: number;
}

export interface Student {
  id: string;
  nik: string;
  nisn: string | null;
  nis: string | null;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  gender: Gender;
  motherName: string;
  status: StudentStatus;
  photoPath: string | null;
  emisData?: Record<string, unknown>;
  classroom?: StudentClassroom | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentDto {
  nik: string;
  nisn?: string | null;
  nis?: string | null;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  gender: Gender;
  motherName: string;
  status?: StudentStatus;
  photoPath?: string | null;
  emisData?: Record<string, unknown>;
}

export type UpdateStudentDto = Partial<CreateStudentDto>;

export interface Parent {
  id: string;
  nik?: string | null;
  name: string;
  birthPlace?: string | null;
  birthDate?: string | null;
  gender?: Gender | null;
  education?: string | null;
  occupation?: string | null;
  income?: string | null;
  phone?: string | null;
  address?: string | null;
  emisData?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentParentDetail extends Parent {
  relationType: ParentRelationType;
  isGuardian: boolean;
}

export interface CreateParentDto {
  nik?: string | null;
  name: string;
  birthPlace?: string | null;
  birthDate?: string | null;
  gender?: Gender | null;
  education?: string | null;
  occupation?: string | null;
  income?: string | null;
  phone?: string | null;
  address?: string | null;
  emisData?: Record<string, unknown>;
}

export interface CreateAndLinkParentDto {
  relationType: ParentRelationType;
  isGuardian?: boolean;
  parent: CreateParentDto;
}

export interface AddStudentParentDto {
  parentId: string;
  relationType: ParentRelationType;
  isGuardian?: boolean;
}

export interface AssignClassroomDto {
  classroomId: string;
  studentIds: string[];
}

export interface StudentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: StudentStatus;
  gender?: Gender;
  classroomId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedStudentsResponse {
  data: Student[];
  meta: PaginationMeta;
}
