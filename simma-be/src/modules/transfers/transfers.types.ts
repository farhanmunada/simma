import type {
  TransferType,
  TransferStatus,
  ClearanceStatus,
  ClearanceDimension,
  GraduationStatus,
} from "@simma/shared";
import type {
  StudentTransferRow,
  NewStudentTransferRow,
  TransferClearanceRow,
  NewTransferClearanceRow,
  StudentGraduationRow,
  NewStudentGraduationRow,
} from "../../db/schema/transfers.js";

export type {
  TransferType,
  TransferStatus,
  ClearanceStatus,
  ClearanceDimension,
  GraduationStatus,
  StudentTransferRow,
  NewStudentTransferRow,
  TransferClearanceRow,
  NewTransferClearanceRow,
  StudentGraduationRow,
  NewStudentGraduationRow,
};

export interface TransferWithDetails extends StudentTransferRow {
  studentName: string;
  studentNis?: string | null;
  studentNisn?: string | null;
  currentClassroomName?: string | null;
  targetClassroomName?: string | null;
  clearance?: TransferClearanceRow | null;
  creatorName?: string | null;
  approverName?: string | null;
}

export interface GraduationWithDetails extends StudentGraduationRow {
  studentName: string;
  studentNis?: string | null;
  studentNisn?: string | null;
  classroomName?: string | null;
  academicYearName?: string | null;
}

export interface ClearanceVerificationResult {
  allCleared: boolean;
  libraryCleared: boolean;
  financeCleared: boolean;
  disciplineCleared: boolean;
  status: ClearanceStatus;
  clearedCount: number;
  pendingDimensions: ClearanceDimension[];
}

export interface TransferStats {
  totalIn: number;
  totalOut: number;
  pendingClearance: number;
  pendingApproval: number;
  completedThisYear: number;
  totalGraduated: number;
}
