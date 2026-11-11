import {
  transfersRepository,
  TransfersRepository,
} from "./transfers.repository.js";
import {
  graduationsRepository,
  GraduationsRepository,
} from "./graduations.repository.js";
import {
  generateTransferReference,
  generateVerificationCode,
} from "./transfers.clearance.js";
import { generateTransferOutLetterPdf } from "./transfers.pdf.js";
import type {
  CreateTransferInInput,
  CreateTransferOutInput,
  FilterTransferInput,
  FilterGraduationInput,
  ClearanceDimension,
  BatchGraduationInput,
} from "./transfers.schema.js";

export class TransfersService {
  constructor(
    private readonly transferRepo: TransfersRepository = transfersRepository,
    private readonly gradRepo: GraduationsRepository = graduationsRepository
  ) {}

  async listTransfers(filter: FilterTransferInput) {
    return await this.transferRepo.findTransfers(filter);
  }

  async getTransfer(id: string) {
    const item = await this.transferRepo.findTransferById(id);
    if (!item) throw new Error("Data mutasi tidak ditemukan");
    return item;
  }

  async verifyTransferByCode(code: string) {
    const item = await this.transferRepo.findTransferByVerificationCode(code);
    if (!item) throw new Error("Surat mutasi tidak valid atau tidak ditemukan");
    return item;
  }

  async createTransferIn(input: CreateTransferInInput, userId: string) {
    const referenceNumber = generateTransferReference("masuk");
    return await this.transferRepo.createTransferIn(input, referenceNumber, userId);
  }

  async createTransferOut(input: CreateTransferOutInput, userId: string) {
    const referenceNumber = generateTransferReference("keluar");
    return await this.transferRepo.createTransferOut(input, referenceNumber, userId);
  }

  async updateClearance(
    transferId: string,
    dimension: ClearanceDimension,
    cleared: boolean,
    userId: string,
    notes?: string | null
  ) {
    const transfer = await this.transferRepo.findTransferById(transferId);
    if (!transfer) throw new Error("Mutasi tidak ditemukan");
    if (transfer.status !== "pending_clearance") {
      throw new Error("Clearance hanya dapat diperbarui pada status pending_clearance");
    }

    return await this.transferRepo.updateClearance(transferId, dimension, cleared, userId, notes);
  }

  async approveTransfer(
    transferId: string,
    approved: boolean,
    approverId: string,
    notes?: string | null
  ) {
    const transfer = await this.transferRepo.findTransferById(transferId);
    if (!transfer) throw new Error("Mutasi tidak ditemukan");
    if (transfer.status !== "pending_approval") {
      throw new Error("Persetujuan hanya dapat dilakukan setelah seluruh clearance selesai");
    }

    const verificationCode = approved ? generateVerificationCode() : undefined;
    return await this.transferRepo.finalizeTransferApproval(
      transferId,
      approved,
      approverId,
      notes,
      verificationCode
    );
  }

  async generatePdf(transferId: string): Promise<Buffer> {
    const transfer = await this.transferRepo.findTransferById(transferId);
    if (!transfer) throw new Error("Mutasi tidak ditemukan");
    if (transfer.type !== "keluar" || transfer.status !== "completed") {
      throw new Error("PDF surat keterangan hanya tersedia untuk mutasi keluar yang telah disetujui");
    }

    const inst = await this.transferRepo.getInstitutionInfo();
    return generateTransferOutLetterPdf({
      institutionName: inst.name,
      institutionAddress: inst.address ?? "",
      nsm: inst.nsm ?? "-",
      npsn: inst.npsn ?? "-",
      referenceNumber: transfer.referenceNumber,
      studentName: transfer.studentName,
      nisn: transfer.studentNisn ?? "-",
      nis: transfer.studentNis ?? "-",
      gender: "Laki-laki / Perempuan",
      birthInfo: "-",
      currentClass: transfer.targetClassroomName ?? "Kelas Terakhir",
      destinationSchool: transfer.destinationSchool ?? "-",
      reason: transfer.reason ?? "-",
      transferDate: transfer.transferDate,
      verificationCode: transfer.verificationCode ?? "VERIFIED",
      headmasterName: "Kepala Madrasah",
    });
  }

  async getStatistics() {
    return await this.transferRepo.getStats();
  }

  async listGraduations(filter: FilterGraduationInput) {
    return await this.gradRepo.findGraduations(filter);
  }

  async processBatchGraduation(input: BatchGraduationInput, userId: string) {
    return await this.gradRepo.processGraduationBatch(
      input.academicYearId,
      input.classroomId,
      input.graduationDate,
      input.students,
      userId
    );
  }
}

export const transfersService = new TransfersService();
