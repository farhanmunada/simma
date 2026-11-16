import type {
  PpdbStatus,
  PpdbSchoolType,
  PpdbMajor,
  PpdbTrack,
  PpdbDocumentType,
  RegisterApplicantInput,
  UpdateApplicantStatusInput,
  CheckStatusQueryParams,
  PpdbRegisterAccountInput,
  PpdbLoginInput,
  UpdateApplicantFormInput,
  VerifyDocumentInput,
} from "@simma/shared";

export type {
  PpdbStatus,
  PpdbSchoolType,
  PpdbMajor,
  PpdbTrack,
  PpdbDocumentType,
  RegisterApplicantInput,
  UpdateApplicantStatusInput,
  CheckStatusQueryParams,
  PpdbRegisterAccountInput,
  PpdbLoginInput,
  UpdateApplicantFormInput,
  VerifyDocumentInput,
};

export interface PpdbDocument {
  id: string;
  applicantId: string;
  documentType: PpdbDocumentType;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  verificationStatus: "pending" | "valid" | "invalid";
  verificationNotes: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PpdbApplicant {
  id: string;
  registrationNumber: string;
  academicYearId: string | null;
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
  track: PpdbTrack;
  previousSchoolType: PpdbSchoolType;
  previousSchoolName: string;
  npsnOrigin: string | null;
  fatherName: string | null;
  fatherPhone: string | null;
  fatherJob: string | null;
  motherName: string;
  motherPhone: string | null;
  motherJob: string | null;
  guardianName: string | null;
  chosenMajor: PpdbMajor;
  tahfidzJuzCount: number | null;
  achievementNotes: string | null;
  status: PpdbStatus;
  isFinalized: boolean;
  finalizedAt: string | null;
  notes: string | null;
  documents: Record<string, unknown>;
  documentsList?: PpdbDocument[];
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
  academicYear: string;
  academicYearId: string | null;
  tracks: {
    id: string;
    name: string;
  }[];
  majors: string[];
  isOpen: boolean;
  totalApplicants: number;
}
