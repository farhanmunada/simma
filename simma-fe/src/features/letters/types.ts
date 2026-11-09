import type {
  LetterUrgency,
  LetterSecurityDegree,
  DispositionInstruction,
  DispositionStatus,
  LetterStatus,
  DeliveryMethod,
  CreateIncomingLetterInput,
  UpdateIncomingLetterStatusInput,
  CreateDispositionInput,
  UpdateDispositionStatusInput,
  CreateOutgoingLetterInput,
  UpdateOutgoingLetterStatusInput,
  GenerateStudentActiveLetterInput,
  GenerateTeacherDutyLetterInput,
  GenerateParentInvitationLetterInput,
  CreateExpeditionBookInput,
  CreateClassificationInput,
} from "@simma/shared";

export type {
  LetterUrgency,
  LetterSecurityDegree,
  DispositionInstruction,
  DispositionStatus,
  LetterStatus,
  DeliveryMethod,
  CreateIncomingLetterInput,
  UpdateIncomingLetterStatusInput,
  CreateDispositionInput,
  UpdateDispositionStatusInput,
  CreateOutgoingLetterInput,
  UpdateOutgoingLetterStatusInput,
  GenerateStudentActiveLetterInput,
  GenerateTeacherDutyLetterInput,
  GenerateParentInvitationLetterInput,
  CreateExpeditionBookInput,
  CreateClassificationInput,
};

export interface LetterClassification {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string | null;
  retentionYears: number;
  isActive: boolean;
  createdAt: string;
}

export interface IncomingLetter {
  id: string;
  agendaNumber: string;
  senderLetterNumber: string;
  senderName: string;
  letterDate: string;
  receivedDate: string;
  subject: string;
  summary?: string | null;
  classificationCode: string;
  attachmentPath?: string | null;
  status: LetterStatus;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Disposition {
  id: string;
  incomingLetterId: string;
  disposedBy: string;
  targetUserId: string;
  urgency: LetterUrgency;
  instruction: DispositionInstruction;
  notes?: string | null;
  deadline?: string | null;
  status: DispositionStatus;
  followUpNotes?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OutgoingLetter {
  id: string;
  letterNumber: string;
  sequenceNumber: number;
  degreeCode: string;
  satkerCode: string;
  classificationCode: string;
  month: string;
  year: number;
  recipientName: string;
  recipientAddress?: string | null;
  subject: string;
  contentData?: Record<string, unknown> | null;
  status: LetterStatus;
  verificationHash: string;
  signerName?: string | null;
  signedAt?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpeditionBook {
  id: string;
  outgoingLetterId: string;
  dispatchDate: string;
  courierName: string;
  recipientName: string;
  recipientProof?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LettersStats {
  totalIncoming: number;
  totalOutgoing: number;
  pendingDispositions: number;
  completedDispositions: number;
}

export interface LetterQueryParams {
  search?: string;
  status?: string;
  classificationCode?: string;
  year?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
