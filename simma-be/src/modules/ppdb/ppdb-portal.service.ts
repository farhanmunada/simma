import bcrypt from "bcrypt";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  UnauthorizedError,
} from "../../core/errors/index.js";
import { signAccessToken } from "../../core/auth/jwt.js";
import type {
  PpdbRegisterAccountInput,
  PpdbLoginInput,
  UpdateApplicantFormInput,
} from "@simma/shared";
import type { PpdbRepository } from "./ppdb.repository.js";
import type {
  PpdbApplicant,
  ApplicantWithAcademicYear,
} from "./ppdb.types.js";

export class PpdbPortalService {
  constructor(private readonly ppdbRepo: PpdbRepository) {}

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
}
