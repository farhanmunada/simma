import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import { students, parents, studentParents } from "../../db/schema/students.js";
import { ppdbApplicants } from "../../db/schema/ppdb.js";
import { PpdbRepository } from "./ppdb.repository.js";
import { generatePpdbCardPdf } from "./ppdb.pdf.js";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
} from "../../core/errors/index.js";
import { signAccessToken } from "../../core/auth/jwt.js";
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

const UPLOAD_BASE_DIR = path.resolve(process.cwd(), "storage", "uploads", "ppdb");

export class PpdbService {
  constructor(private readonly ppdbRepo = new PpdbRepository()) {}

  // 1. Calon Siswa Authentication & Account Registration
  async registerAccount(input: PpdbRegisterAccountInput): Promise<{
    applicant: PpdbApplicant;
    token: string;
  }> {
    const existingNik = await this.ppdbRepo.findByNik(input.nik);
    if (existingNik) {
      throw new ConflictError(
        `Calon siswa dengan NIK ${input.nik} sudah terdaftar dengan No. Pendaftaran: ${existingNik.registrationNumber}`
      );
    }

    if (input.email) {
      const existingEmail = await this.ppdbRepo.findByEmail(input.email);
      if (existingEmail) {
        throw new ConflictError(
          `Email ${input.email} sudah terdaftar pada sistem PPDB`
        );
      }
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

    const passwordHash = await bcrypt.hash(input.password, 10);

    const applicant = await this.ppdbRepo.create({
      registrationNumber,
      academicYearId: activeYear?.id || null,
      passwordHash,
      fullName: input.fullName,
      nik: input.nik,
      nisn: input.nisn || null,
      birthPlace: input.birthPlace,
      birthDate: input.birthDate,
      gender: input.gender,
      religion: "Islam",
      phone: input.phone || null,
      email: input.email || null,
      address: null,
      track: input.track || "reguler",
      previousSchoolType: input.previousSchoolType || "MTs",
      previousSchoolName: input.previousSchoolName,
      npsnOrigin: null,
      fatherName: null,
      fatherPhone: null,
      fatherJob: null,
      motherName: input.motherName,
      motherPhone: input.phone || null,
      motherJob: null,
      guardianName: null,
      chosenMajor: input.chosenMajor || "MIPA",
      tahfidzJuzCount: null,
      achievementNotes: null,
      status: "draft",
      isFinalized: false,
      documents: {},
    });

    const token = await signAccessToken({
      sub: applicant.id,
      username: applicant.registrationNumber,
      role: "calon_siswa",
    });

    return { applicant, token };
  }

  async loginCalonSiswa(input: PpdbLoginInput): Promise<{
    applicant: PpdbApplicant;
    token: string;
  }> {
    const applicant = await this.ppdbRepo.findByIdentifier(input.identifier.trim());
    if (!applicant) {
      throw new UnauthorizedError("NIK, NISN, atau No. Pendaftaran tidak ditemukan");
    }

    if (!applicant.passwordHash) {
      throw new UnauthorizedError(
        "Akun belum memiliki kata sandi. Silakan mendaftar terlebih dahulu."
      );
    }

    const isMatch = await bcrypt.compare(input.password, applicant.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Kata sandi yang Anda masukkan salah");
    }

    const token = await signAccessToken({
      sub: applicant.id,
      username: applicant.registrationNumber,
      role: "calon_siswa",
    });

    return { applicant, token };
  }

  // 2. Candidate Portal Management (Self-service)
  async getMyApplication(applicantId: string): Promise<ApplicantWithAcademicYear> {
    const applicant = await this.ppdbRepo.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError("Data pendaftaran tidak ditemukan");
    }

    const documentsList = await this.ppdbRepo.findDocumentsByApplicantId(applicantId);
    return {
      ...applicant,
      documentsList,
    };
  }

  async updateMyApplication(
    applicantId: string,
    input: UpdateApplicantFormInput
  ): Promise<PpdbApplicant> {
    const applicant = await this.ppdbRepo.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError("Data pendaftaran tidak ditemukan");
    }

    if (applicant.isFinalized) {
      throw new ValidationError(
        "Data pendaftaran sudah difinalisasi dan dikunci. Tidak dapat diubah kembali."
      );
    }

    if (applicant.status === "enrolled") {
      throw new ValidationError(
        "Calon siswa sudah terdaftar di Buku Induk Siswa. Data tidak dapat diubah."
      );
    }

    const updated = await this.ppdbRepo.update(applicantId, {
      fullName: input.fullName ?? undefined,
      birthPlace: input.birthPlace ?? undefined,
      birthDate: input.birthDate ?? undefined,
      gender: input.gender ?? undefined,
      religion: input.religion ?? undefined,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
      track: input.track,
      previousSchoolType: input.previousSchoolType,
      previousSchoolName: input.previousSchoolName ?? undefined,
      npsnOrigin: input.npsnOrigin || null,
      fatherName: input.fatherName || null,
      fatherPhone: input.fatherPhone || null,
      fatherJob: input.fatherJob || null,
      motherName: input.motherName ?? undefined,
      motherPhone: input.motherPhone || null,
      motherJob: input.motherJob || null,
      guardianName: input.guardianName || null,
      chosenMajor: input.chosenMajor,
      tahfidzJuzCount: input.tahfidzJuzCount ?? null,
      achievementNotes: input.achievementNotes || null,
    });

    if (!updated) {
      throw new NotFoundError("Gagal memperbarui formulir pendaftaran");
    }

    return updated;
  }

  async finalizeMyApplication(applicantId: string): Promise<PpdbApplicant> {
    const applicant = await this.ppdbRepo.findById(applicantId);
    if (!applicant) {
      throw new NotFoundError("Data pendaftaran tidak ditemukan");
    }

    if (applicant.isFinalized) {
      return applicant;
    }

    if (
      !applicant.fullName ||
      !applicant.nik ||
      !applicant.birthPlace ||
      !applicant.birthDate ||
      !applicant.motherName ||
      !applicant.previousSchoolName
    ) {
      throw new ValidationError(
        "Formulir belum lengkap. Harap lengkapi seluruh data identitas, orang tua, dan asal sekolah sebelum finalisasi."
      );
    }

    const docs = await this.ppdbRepo.findDocumentsByApplicantId(applicantId);
    const uploadedTypes = new Set(docs.map((d) => d.documentType));

    if (!uploadedTypes.has("pas_foto")) {
      throw new ValidationError("Pas Foto resmi (3x4/4x6) wajib diunggah sebelum finalisasi pendaftaran.");
    }
    if (!uploadedTypes.has("kartu_keluarga")) {
      throw new ValidationError("Scan Kartu Keluarga (KK) wajib diunggah sebelum finalisasi pendaftaran.");
    }
    if (applicant.track === "prestasi" && !uploadedTypes.has("prestasi_tahfidz")) {
      throw new ValidationError("Jalur Prestasi/Tahfidz wajib mengunggah Piagam Juara atau Syahadah Tahfidz.");
    }
    if (applicant.track === "afirmasi" && !uploadedTypes.has("kip_pkh")) {
      throw new ValidationError("Jalur Afirmasi wajib mengunggah bukti kepemilikan KIP / PKH / Kartu Bansos.");
    }

    const updated = await this.ppdbRepo.update(applicantId, {
      isFinalized: true,
      finalizedAt: new Date(),
      status: "submitted",
    });

    if (!updated) {
      throw new NotFoundError("Gagal memfinalisasi pendaftaran");
    }

    return updated;
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

  // 4. Panitia TU Verification
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

  async registerApplicant(input: RegisterApplicantInput): Promise<PpdbApplicant> {
    // 1. Check duplicate NIK in PPDB
    const existing = await this.ppdbRepo.findByNik(input.nik);
    if (existing) {
      throw new ConflictError(
        `Calon siswa dengan NIK ${input.nik} sudah terdaftar dengan No. Pendaftaran: ${existing.registrationNumber}`
      );
    }

    // 2. Determine active academic year
    const activeYear = await this.ppdbRepo.getActiveAcademicYear();
    const currentYear = new Date().getFullYear();

    // 3. Generate sequential registration number: PPDB-YYYY-XXXX
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

    // 4. Save applicant
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
      guardianName: input.guardianName || null,
      chosenMajor: input.chosenMajor,
      status: "submitted",
      documents: input.documents || {},
    });
  }

  async checkStatus(params: CheckStatusQueryParams) {
    const applicant = await this.ppdbRepo.findByRegistrationNumber(
      params.registrationNumber.trim()
    );

    if (!applicant) {
      throw new NotFoundError(
        `Nomor Pendaftaran ${params.registrationNumber} tidak ditemukan`
      );
    }

    // Check verification key (NIK or NISN match)
    const key = params.nikOrNisn.trim();
    const nikMatch = applicant.nik === key;
    const nisnMatch = applicant.nisn && applicant.nisn === key;

    if (!nikMatch && !nisnMatch) {
      throw new ValidationError(
        "Kombinasi Nomor Pendaftaran dan NIK/NISN tidak cocok"
      );
    }

    return {
      registrationNumber: applicant.registrationNumber,
      fullName: applicant.fullName,
      chosenMajor: applicant.chosenMajor,
      previousSchoolName: applicant.previousSchoolName,
      status: applicant.status,
      notes: applicant.notes,
      createdAt: applicant.createdAt,
    };
  }

  async listApplicants(params: ApplicantQueryParams) {
    return this.ppdbRepo.findApplicants({
      page: params.page || 1,
      limit: params.limit || 20,
      search: params.search,
      status: params.status,
      major: params.major,
    });
  }

  async getApplicantById(id: string): Promise<PpdbApplicant> {
    const applicant = await this.ppdbRepo.findById(id);
    if (!applicant) {
      throw new NotFoundError(`Calon siswa dengan ID ${id} tidak ditemukan`);
    }
    return applicant;
  }

  async updateStatus(id: string, input: UpdateApplicantStatusInput) {
    const applicant = await this.getApplicantById(id);

    if (applicant.status === "enrolled" && input.status !== "enrolled") {
      throw new ValidationError(
        "Calon siswa sudah terdaftar di Buku Induk Siswa. Status pendaftaran tidak dapat diubah kembali."
      );
    }

    const updated = await this.ppdbRepo.updateStatus(id, input.status, input.notes);
    if (!updated) {
      throw new NotFoundError(`Gagal memperbarui status calon siswa`);
    }
    return updated;
  }

  async enrollToBukuInduk(id: string) {
    const applicant = await this.getApplicantById(id);

    if (applicant.status === "enrolled") {
      throw new ConflictError(
        `Calon siswa ${applicant.fullName} (${applicant.registrationNumber}) sudah pernah didaftarkan ke Buku Induk Siswa.`
      );
    }

    if (applicant.status !== "accepted") {
      throw new ValidationError(
        `Calon siswa belum berstatus 'accepted' (Diterima). Status saat ini: ${applicant.status}. Hanya calon siswa yang diterima yang dapat dimasukkan ke Buku Induk.`
      );
    }

    const db = getDb();

    // Sesuai PRD F-PDB-10 & Aturan 7.4: Eksekusi atomik dalam transaksi database terisolasi
    const result = await db.transaction(async (tx) => {
      // 1. Insert into students table (Buku Induk)
      // Sesuai PRD F-SIS-04 & F-SIS-13: Status awal siswa baru adalah 'aktif_tanpa_rombel'
      const [newStudent] = await tx
        .insert(students)
        .values({
          nik: applicant.nik,
          nisn: applicant.nisn,
          nis: applicant.registrationNumber,
          fullName: applicant.fullName,
          birthPlace: applicant.birthPlace,
          birthDate: applicant.birthDate,
          gender: applicant.gender,
          motherName: applicant.motherName,
          status: "aktif_tanpa_rombel",
          emisData: {
            previousSchoolType: applicant.previousSchoolType,
            previousSchoolName: applicant.previousSchoolName,
            chosenMajor: applicant.chosenMajor,
            religion: applicant.religion,
            phone: applicant.phone,
            email: applicant.email,
            address: applicant.address,
            registrationNumber: applicant.registrationNumber,
          },
        })
        .returning();

      // 2. Insert mother into parents table
      const [mother] = await tx
        .insert(parents)
        .values({
          name: applicant.motherName,
          phone: applicant.motherPhone || null,
          address: applicant.address || null,
          gender: "P",
        })
        .returning();

      await tx.insert(studentParents).values({
        studentId: newStudent.id,
        parentId: mother.id,
        relationType: "ibu",
        isGuardian: !applicant.fatherName,
      });

      // 3. Insert father if provided
      if (applicant.fatherName) {
        const [father] = await tx
          .insert(parents)
          .values({
            name: applicant.fatherName,
            phone: applicant.fatherPhone || null,
            address: applicant.address || null,
            gender: "L",
          })
          .returning();

        await tx.insert(studentParents).values({
          studentId: newStudent.id,
          parentId: father.id,
          relationType: "ayah",
          isGuardian: true,
        });
      }

      // 4. Update applicant status to enrolled and link studentId
      const [updatedApplicant] = await tx
        .update(ppdbApplicants)
        .set({
          status: "enrolled",
          studentId: newStudent.id,
          enrolledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(ppdbApplicants.id, id))
        .returning();

      return {
        student: newStudent,
        applicant: updatedApplicant,
      };
    });

    return result;
  }

  // 5. Generator Kartu Tanda Peserta PPDB Resmi (PDF) - PRD F-PDB-06
  async getApplicantCardPdf(id: string): Promise<{
    buffer: Buffer;
    fileName: string;
    applicant: PpdbApplicant;
  }> {
    const applicant = await this.getApplicantById(id);
    const activeYear = await this.ppdbRepo.getActiveAcademicYear();
    const pdfBuffer = generatePpdbCardPdf(
      applicant,
      activeYear?.name || "2025/2026"
    );

    return {
      buffer: pdfBuffer,
      fileName: `kartu-peserta-${applicant.registrationNumber}.pdf`,
      applicant,
    };
  }

  async deleteApplicant(id: string): Promise<void> {
    const applicant = await this.getApplicantById(id);
    if (applicant.status === "enrolled") {
      throw new ValidationError(
        "Tidak dapat menghapus calon siswa yang sudah terdaftar di Buku Induk Siswa."
      );
    }
    await this.ppdbRepo.delete(id);
  }

  async getPublicInfo() {
    const activeYear = await this.ppdbRepo.getActiveAcademicYear();
    const stats = await this.ppdbRepo.getStats();
    return {
      academicYear: activeYear?.name || "Tahun Ajaran Aktif",
      academicYearId: activeYear?.id || null,
      tracks: [
        { id: "reguler", name: "Jalur Reguler (Tes Potensi & Nilai Rapor MTs/SMP)" },
        { id: "prestasi", name: "Jalur Prestasi (Olimpiade/Sains, Seni, & Tahfidz Al-Qur'an)" },
        { id: "afirmasi", name: "Jalur Afirmasi (Pemegang KIP, PKH, atau Terdaftar DTKS)" },
        { id: "perpindahan_ortu", name: "Jalur Perpindahan Tugas Orang Tua & Anak GTK" },
      ],
      majors: ["MIPA", "IPS", "Keagamaan"],
      isOpen: true,
      totalApplicants: stats.total,
    };
  }

  async getStats() {
    return this.ppdbRepo.getStats();
  }
}
