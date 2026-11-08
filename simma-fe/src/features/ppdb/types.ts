import type {
  PpdbStatus,
  PpdbSchoolType,
  PpdbMajor,
  RegisterApplicantInput,
  UpdateApplicantStatusInput,
  CheckStatusQueryParams,
} from "@simma/shared";

export type {
  PpdbStatus,
  PpdbSchoolType,
  PpdbMajor,
  RegisterApplicantInput,
  UpdateApplicantStatusInput,
  CheckStatusQueryParams,
};

export interface PpdbApplicant {
  id: string;
  registrationNumber: string;
  academicYearId: string;
  fullName: string;
  nik: string;
  nisn: string | null;
  birthPlace: string;
  birthDate: string;
  gender: "L" | "P";
  religion: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  previousSchoolType: PpdbSchoolType;
  previousSchoolName: string;
  npsnOrigin: string | null;
  fatherName: string | null;
  fatherPhone: string | null;
  motherName: string;
  motherPhone: string | null;
  guardianName: string | null;
  chosenMajor: PpdbMajor;
  status: PpdbStatus;
  notes: string | null;
  documents: Record<string, unknown>;
  studentId: string | null;
  enrolledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PpdbApplicantsResponse {
  data: PpdbApplicant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PpdbStats {
  total: number;
  submitted: number;
  verified: number;
  accepted: number;
  rejected: number;
  enrolled: number;
}

export interface PpdbPublicInfo {
  academicYear: {
    id: string;
    name: string;
  } | null;
  majors: {
    code: string;
    label: string;
    description: string;
  }[];
  registrationSteps: {
    step: number;
    title: string;
    description: string;
  }[];
}
