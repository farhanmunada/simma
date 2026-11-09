import type {
  LetterClassification,
  NewLetterClassification,
  IncomingLetter,
  NewIncomingLetter,
  Disposition,
  NewDisposition,
  LetterSequence,
  NewLetterSequence,
  OutgoingLetter,
  NewOutgoingLetter,
  ExpeditionBook,
  NewExpeditionBook,
} from "../../db/schema/letters.js";

export type {
  LetterClassification,
  NewLetterClassification,
  IncomingLetter,
  NewIncomingLetter,
  Disposition,
  NewDisposition,
  LetterSequence,
  NewLetterSequence,
  OutgoingLetter,
  NewOutgoingLetter,
  ExpeditionBook,
  NewExpeditionBook,
};

export interface LetterStats {
  totalIncoming: number;
  waitingDisposition: number;
  totalOutgoing: number;
  pendingDispositions: number;
}

export interface VerifyLetterResult {
  verified: boolean;
  letterNumber: string;
  subject: string;
  letterDate: string;
  recipient: string;
  signerName: string;
  signerRole: string;
  templateType: string;
  institutionName: string;
  createdAt: string;
}

export interface GenerateNumberParams {
  securityDegree?: "B" | "R" | "SR";
  classificationCode: string;
  satkerCode?: string;
  date?: string;
}
