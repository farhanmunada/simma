import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "../../core/errors/index.js";
import type { VerifyDocumentInput } from "@simma/shared";
import type { PpdbRepository } from "./ppdb.repository.js";
import type { PpdbDocument } from "./ppdb.types.js";

const UPLOAD_BASE_DIR = path.resolve(process.cwd(), "storage", "uploads", "ppdb");

export class PpdbDocumentService {
  constructor(private readonly ppdbRepo: PpdbRepository) {}

  async uploadDocument(
    applicantId: string,
    fileData: {
      buffer: Buffer;
      originalName: string;
      mimeType: string;
      documentType: string;
    }
  ): Promise<PpdbDocument> {
    const applicant = await this.ppdbRepo.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError("Data calon siswa tidak ditemukan");
    }

    if (applicant.isFinalized) {
      throw new ValidationError(
        "Pendaftaran sudah difinalisasi. Berkas tidak dapat diunggah ulang."
      );
    }

    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedMimes.includes(fileData.mimeType)) {
      throw new ValidationError(
        `Format berkas '${fileData.mimeType}' tidak didukung. Harap unggah format PDF, JPG, atau PNG.`
      );
    }

    const applicantDir = path.join(UPLOAD_BASE_DIR, applicantId);
    await fs.mkdir(applicantDir, { recursive: true });

    const ext = path.extname(fileData.originalName).toLowerCase() || ".bin";
    const fileUUID = crypto.randomUUID();
    const storedFileName = `${fileData.documentType}_${fileUUID}${ext}`;
    const absoluteFilePath = path.join(applicantDir, storedFileName);

    await fs.writeFile(absoluteFilePath, fileData.buffer);

    const doc = await this.ppdbRepo.createDocument({
      applicantId,
      documentType: fileData.documentType,
      fileName: storedFileName,
      originalName: fileData.originalName,
      filePath: absoluteFilePath,
      fileSize: fileData.buffer.length,
      mimeType: fileData.mimeType,
      verificationStatus: "pending",
      verificationNotes: null,
    });

    return doc;
  }

  async getDocumentForStream(
    documentId: string,
    user: { id: string; role: string }
  ): Promise<{
    filePath: string;
    mimeType: string;
    originalName: string;
  }> {
    const doc = await this.ppdbRepo.findDocumentById(documentId);
    if (!doc) {
      throw new NotFoundError("Dokumen berkas tidak ditemukan");
    }

    if (user.role === "calon_siswa" && doc.applicantId !== user.id) {
      throw new ForbiddenError("Anda tidak memiliki hak akses melihat berkas ini.");
    }

    try {
      await fs.access(doc.filePath);
    } catch {
      throw new NotFoundError("File fisik tidak ditemukan pada sistem penyimpanan server.");
    }

    return {
      filePath: doc.filePath,
      mimeType: doc.mimeType,
      originalName: doc.originalName,
    };
  }

  async deleteDocument(applicantId: string, documentId: string): Promise<void> {
    const doc = await this.ppdbRepo.findDocumentById(documentId);
    if (!doc) {
      throw new NotFoundError("Dokumen tidak ditemukan");
    }

    if (doc.applicantId !== applicantId) {
      throw new ForbiddenError("Anda tidak memiliki izin menghapus berkas ini");
    }

    const applicant = await this.ppdbRepo.findById(applicantId);
    if (applicant?.isFinalized) {
      throw new ValidationError(
        "Pendaftaran sudah dikunci/difinalisasi. Berkas tidak dapat dihapus."
      );
    }

    try {
      await fs.unlink(doc.filePath);
    } catch {
      // Ignore disk unlink error
    }

    await this.ppdbRepo.deleteDocument(documentId);
  }

  async verifyDocument(
    documentId: string,
    input: VerifyDocumentInput,
    verifiedBy: string
  ): Promise<PpdbDocument> {
    const updated = await this.ppdbRepo.updateDocumentVerification(
      documentId,
      input.verificationStatus,
      input.notes,
      verifiedBy
    );

    if (!updated) {
      throw new NotFoundError("Dokumen berkas tidak ditemukan");
    }

    return updated;
  }
}
