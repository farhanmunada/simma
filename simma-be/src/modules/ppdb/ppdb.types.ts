import type { PpdbApplicant, NewPpdbApplicant } from "../../db/schema/ppdb.js";

export type { PpdbApplicant, NewPpdbApplicant };

export interface ApplicantWithAcademicYear extends PpdbApplicant {
  academicYearName?: string | null;
}
