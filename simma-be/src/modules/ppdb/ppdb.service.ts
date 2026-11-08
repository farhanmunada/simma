import { getDb } from "../../core/database/client.js";
import { students, parents, studentParents } from "../../db/schema/students.js";
import { PpdbRepository } from "./ppdb.repository.js";
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
} from "@simma/shared";
import type { PpdbApplicant } from "./ppdb.types.js";

export class PpdbService {
  constructor(private readonly ppdbRepo = new PpdbRepository()) {}

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

    // 1. Insert into students table (Buku Induk)
    // Sesuai PRD F-SIS-04 & F-SIS-13: Status awal siswa baru adalah 'aktif_tanpa_rombel'
    const [newStudent] = await db
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
    const [mother] = await db
      .insert(parents)
      .values({
        name: applicant.motherName,
        phone: applicant.motherPhone || null,
        address: applicant.address || null,
        gender: "P",
      })
      .returning();

    await db.insert(studentParents).values({
      studentId: newStudent.id,
      parentId: mother.id,
      relationType: "ibu",
      isGuardian: !applicant.fatherName,
    });

    // 3. Insert father if provided
    if (applicant.fatherName) {
      const [father] = await db
        .insert(parents)
        .values({
          name: applicant.fatherName,
          phone: applicant.fatherPhone || null,
          address: applicant.address || null,
          gender: "L",
        })
        .returning();

      await db.insert(studentParents).values({
        studentId: newStudent.id,
        parentId: father.id,
        relationType: "ayah",
        isGuardian: true,
      });
    }

    // 4. Update applicant status to enrolled and link studentId
    const updatedApplicant = await this.ppdbRepo.setEnrolled(
      id,
      newStudent.id
    );

    return {
      student: newStudent,
      applicant: updatedApplicant,
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
      majors: ["MIPA", "IPS", "Keagamaan"],
      isOpen: true,
      totalApplicants: stats.total,
    };
  }

  async getStats() {
    return this.ppdbRepo.getStats();
  }
}
