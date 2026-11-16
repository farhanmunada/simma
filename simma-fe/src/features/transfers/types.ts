import type {
  TransferType,
  TransferStatus,
  ClearanceStatus,
  ClearanceDimension,
  GraduationStatus,
} from "@simma/shared";

export type {
  TransferType,
  TransferStatus,
  ClearanceStatus,
  ClearanceDimension,
  GraduationStatus,
};

export interface TransferClearanceItem {
  id: string;
  transferId: string;
  libraryCleared: boolean;
  libraryClearedAt?: string | null;
  libraryNotes?: string | null;
  financeCleared: boolean;
  financeClearedAt?: string | null;
  financeNotes?: string | null;
  disciplineCleared: boolean;
  disciplineClearedAt?: string | null;
  disciplineNotes?: string | null;
  overallStatus: ClearanceStatus;
  updatedAt: string;
}

export interface TransferItem {
  id: string;
  type: TransferType;
  studentId: string;
  studentName: string;
  studentNis?: string | null;
  studentNisn?: string | null;
  originSchool?: string | null;
  destinationSchool?: string | null;
  transferDate: string;
  reason?: string | null;
  referenceNumber: string;
  status: TransferStatus;
  academicYearId: string;
  previousClassroomId?: string | null;
  targetClassroomId?: string | null;
  currentClassroomName?: string | null;
  targetClassroomName?: string | null;
  verificationCode?: string | null;
  notes?: string | null;
  approvalNotes?: string | null;
  approvedAt?: string | null;
  creatorName?: string | null;
  approverName?: string | null;
  clearance?: TransferClearanceItem | null;
  createdAt: string;
  updatedAt: string;
}

export interface GraduationItem {
  id: string;
  studentId: string;
  studentName: string;
  studentNis?: string | null;
  studentNisn?: string | null;
  academicYearId: string;
  academicYearName?: string | null;
  classroomName?: string | null;
  graduationDate: string;
  status: GraduationStatus;
  certificateNumber?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface TransferStatsData {
  totalIn: number;
  totalOut: number;
  pendingClearance: number;
  pendingApproval: number;
  completedThisYear: number;
  graduatedThisYear: number;
}

export interface TransferFilterParams {
  type?: TransferType;
  status?: TransferStatus;
  academicYearId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GraduationFilterParams {
  academicYearId?: string;
  classroomId?: string;
  status?: GraduationStatus;
  search?: string;
  page?: number;
  limit?: number;
}
