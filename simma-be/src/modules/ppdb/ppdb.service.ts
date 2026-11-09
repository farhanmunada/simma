import { eq } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import { ppdbDocuments } from "../../db/schema/ppdb.js";
import { PpdbRepository } from "./ppdb.repository.js";
import { PpdbPortalService } from "./ppdb-portal.service.js";
import { PpdbDocumentService } from "./ppdb-document.service.js";
import { PpdbEnrollmentService } from "./ppdb-enrollment.service.js";
import { generatePpdbCardPdf } from "./ppdb.pdf.js";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../../core/errors/index.js";
import type {
  RegisterApplicantInput,
  UpdateApplicantStatusInput,
  ApplicantQueryParams,
  CheckStatusQueryParams,
  PpdbRegisterAccountInput,
  PpdbLoginInput,
  UpdateApplicantFormInput,
  VerifyDocumentInput,
} from "@simma/shared";
import type {
  PpdbApplicant,
  PpdbDocument,
  ApplicantWithAcademicYear,
} from "./ppdb.types.js";

export class PpdbService {
  private readonly portalService: PpdbPortalService;
  private readonly documentService: PpdbDocumentService;
  private readonly enrollmentService: PpdbEnrollmentService;

  constructor(private readonly ppdbRepo = new PpdbRepository()) {
    this.portalService = new PpdbPortalService(this.ppdbRepo);
    this.documentService = new PpdbDocumentService(this.ppdbRepo);
    this.enrollmentService = new PpdbEnrollmentService(this.ppdbRepo);
  }

  // 1. Calon Siswa Authentication & Account Registration
  async registerAccount(input: PpdbRegisterAccountInput) {
    return this.portalService.registerAccount(input);
  }

  async loginCalonSiswa(input: PpdbLoginInput) {
    return this.portalService.loginCalonSiswa(input);
  }

  // 2. Candidate Portal Management (Self-service)
  async getMyApplication(applicantId: string): Promise<ApplicantWithAcademicYear> {
    return this.portalService.getMyApplication(applicantId);
  }

  async updateMyApplication(
    applicantId: string,
    input: UpdateApplicantFormInput
  ): Promise<PpdbApplicant> {
    return this.portalService.updateMyApplication(applicantId, input);
  }

  async finalizeMyApplication(applicantId: string): Promise<PpdbApplicant> {
    return this.portalService.finalizeMyApplication(applicantId);
  }

  // 3. Document Storage & Secure Streaming
  async uploadDocument(
    applicantId: string,
    fileData: {
      buffer: Buffer;
      originalName: string;
      mimeType: string;
      documentType: string;
    }
  ): Promise<PpdbDocument> {
    return this.documentService.uploadDocument(applicantId, fileData);
  }

  async getDocumentForStream(
    documentId: string,
    user: { id: string; role: string }
  ) {
    return this.documentService.getDocumentForStream(documentId, user);
  }

  async deleteDocument(applicantId: string, documentId: string): Promise<void> {
    return this.documentService.deleteDocument(applicantId, documentId);
  }

  async verifyDocument(
    documentId: string,
    input: VerifyDocumentInput,
    verifiedBy: string
  ): Promise<PpdbDocument> {
    return this.documentService.verifyDocument(documentId, input, verifiedBy);
  }

  // 4. Registration & Status Management
  async registerApplicant(input: RegisterApplicantInput): Promise<PpdbApplicant> {
    const existing = await this.ppdbRepo.findByNik(input.nik);
    if (existing) {
      throw new ConflictError(
        `Calon siswa dengan NIK ${input.nik} sudah terdaftar dengan No. Pendaftaran: ${existing.registrationNumber}`
      );
    }

    const activeYear = await this.ppdbRepo.getActiveAcademicYear();
    const currentYear = new Date().getFullYear();
    const prefix = `PPDB-${currentYear}-`;
    const latestReg = await this.ppdbRepo.getLatestRegistrationNumber(prefix);
    let nextSeq = 1;
    if (latestReg) {
      const parts = latestReg.split("-");
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) {
        nextSeq = lastNum + 1;
      }
    }
    const registrationNumber = `${prefix}${String(nextSeq).padStart(4, "0")}`;

    return this.ppdbRepo.create({
      registrationNumber,
      academicYearId: activeYear?.id || null,
      fullName: input.fullName,
      nik: input.nik,
      nisn: input.nisn || null,
      birthPlace: input.birthPlace,
      birthDate: input.birthDate,
      gender: input.gender,
      religion: input.religion || "Islam",
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
      previousSchoolType: input.previousSchoolType,
      previousSchoolName: input.previousSchoolName,
      npsnOrigin: input.npsnOrigin || null,
      fatherName: input.fatherName || null,
      fatherPhone: input.fatherPhone || null,
      motherName: input.motherName,
      motherPhone: input.motherPhone || null,
      chosenMajor: input.chosenMajor,
      documents: input.documents || {},
      status: "submitted",
    });
  }

  async checkStatus(params: CheckStatusQueryParams): Promise<PpdbApplicant> {
    const applicant = await this.ppdbRepo.findByRegistrationNumber(
      params.registrationNumber.trim()
    );

    if (!applicant) {
      throw new NotFoundError(
        `Nomor Pendaftaran '${params.registrationNumber}' tidak ditemukan`
      );
    }

    const key = params.nikOrNisn.trim();
    const matchNik = applicant.nik === key;
    const matchNisn = applicant.nisn && applicant.nisn === key;

    if (!matchNik && !matchNisn) {
      throw new ValidationError(
        "Verifikasi gagal. NIK atau NISN tidak cocok dengan data pendaftaran."
      );
    }

    return applicant;
  }

  async listApplicants(params: ApplicantQueryParams) {
    return this.ppdbRepo.findApplicants(params);
  }

  async getApplicantById(id: string): Promise<ApplicantWithAcademicYear> {
    const applicant = await this.ppdbRepo.findById(id);
    if (!applicant) {
      throw new NotFoundError("Data calon siswa tidak ditemukan");
    }
    const documentsList = await this.ppdbRepo.findDocumentsByApplicantId(id);
    return {
      ...applicant,
      documentsList,
    };
  }

  async updateStatus(
    id: string,
    input: UpdateApplicantStatusInput
  ): Promise<PpdbApplicant> {
    const applicant = await this.ppdbRepo.findById(id);
    if (!applicant) {
      throw new NotFoundError("Data calon siswa tidak ditemukan");
    }
    if (applicant.status === "enrolled") {
      throw new ValidationError(
        "Tidak dapat mengubah status calon siswa yang sudah terdaftar di Buku Induk Siswa."
      );
    }
    const updated = await this.ppdbRepo.updateStatus(id, input.status, input.notes);
    if (!updated) {
      throw new NotFoundError("Data calon siswa tidak ditemukan");
    }
    return updated;
  }

  async enrollToBukuInduk(id: string) {
    return this.enrollmentService.enrollToBukuInduk(id);
  }

  async getApplicantCardPdf(id: string): Promise<{ buffer: Buffer; fileName: string }> {
    const applicant = await this.ppdbRepo.findById(id);
    if (!applicant) {
      throw new NotFoundError("Data calon siswa tidak ditemukan");
    }
    const buffer = generatePpdbCardPdf(applicant);
    const fileName = `KARTU-PPDB-${applicant.registrationNumber}.pdf`;
    return { buffer, fileName };
  }

  async deleteApplicant(id: string): Promise<boolean> {
    const applicant = await this.ppdbRepo.findById(id);
    if (!applicant) {
      throw new NotFoundError("Data calon siswa tidak ditemukan");
    }

    if (applicant.status === "enrolled") {
      throw new ValidationError(
        "Tidak dapat menghapus data calon siswa yang sudah terdaftar di Buku Induk Siswa."
      );
    }

    const db = getDb();
    return db.transaction(async (tx) => {
      await tx.delete(ppdbDocuments).where(eq(ppdbDocuments.applicantId, id));
      return this.ppdbRepo.delete(id);
    });
  }

  async getPublicInfo(): Promise<{
    activeAcademicYear: { id: string; name: string } | null;
    openTracks: string[];
    allowedMajors: string[];
  }> {
    const activeYear = await this.ppdbRepo.getActiveAcademicYear();
    return {
      activeAcademicYear: activeYear,
      openTracks: ["reguler", "prestasi", "afirmasi"],
      allowedMajors: ["MIPA", "IPS", "Keagamaan", "Bahasa", "Vokasi"],
    };
  }

  async getStats() {
    return this.ppdbRepo.getStats();
  }
}
