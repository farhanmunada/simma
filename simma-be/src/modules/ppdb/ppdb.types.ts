import type {
  PpdbApplicant,
  NewPpdbApplicant,
  PpdbDocument,
  NewPpdbDocument,
} from "../../db/schema/ppdb.js";

export type { PpdbApplicant, NewPpdbApplicant, PpdbDocument, NewPpdbDocument };

export interface ApplicantWithAcademicYear extends PpdbApplicant {
  academicYearName?: string | null;
  documentsList?: PpdbDocument[];
}
