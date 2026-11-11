import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../core/errors/index.js";
import {
  ExtracurricularRepository,
  extracurricularRepository,
} from "./extracurricular.repository.js";
import type {
  CreateExtracurricularInput,
  UpdateExtracurricularInput,
  CreateExtracurricularMemberInput,
  UpdateExtracurricularMemberInput,
  UpsertExtracurricularGradeInput,
  BatchUpsertExtracurricularGradesInput,
  ExtracurricularQueryInput,
  ExtracurricularMemberQueryInput,
  ExtracurricularGradeQueryInput,
} from "./extracurricular.schema.js";
import type {
  ExtracurricularEnriched,
  ExtracurricularMemberEnriched,
  ExtracurricularGradeEnriched,
  ExtracurricularStats,
  RdmReportExtracurricularItem,
} from "./extracurricular.types.js";
import { EXTRACURRICULAR_PREDICATE_LABELS } from "@simma/shared";

export class ExtracurricularService {
  constructor(
    private readonly repo: ExtracurricularRepository = extracurricularRepository
  ) {}

  // --- Master Extracurricular ---

  async listExtracurriculars(filter?: ExtracurricularQueryInput): Promise<ExtracurricularEnriched[]> {
    return await this.repo.findExtracurriculars(filter);
  }

  async getExtracurricularById(id: string): Promise<ExtracurricularEnriched> {
    const item = await this.repo.findExtracurricularById(id);
    if (!item) {
      throw new NotFoundError("Kegiatan ekstrakurikuler tidak ditemukan");
    }
    return item;
  }

  async createExtracurricular(input: CreateExtracurricularInput) {
    const existing = await this.repo.findExtracurricularByCode(input.code);
    if (existing) {
      throw new ConflictError(`Kode ekstrakurikuler '${input.code}' sudah digunakan`);
    }
    return await this.repo.createExtracurricular(input as any);
  }

  async updateExtracurricular(id: string, input: UpdateExtracurricularInput) {
    await this.getExtracurricularById(id);

    if (input.code) {
      const existing = await this.repo.findExtracurricularByCode(input.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Kode ekstrakurikuler '${input.code}' sudah digunakan`);
      }
    }
    return await this.repo.updateExtracurricular(id, input as any);
  }

  async deleteExtracurricular(id: string): Promise<boolean> {
    await this.getExtracurricularById(id);
    return await this.repo.deleteExtracurricular(id);
  }

  // --- Extracurricular Members ---

  async listMembers(filter?: ExtracurricularMemberQueryInput): Promise<ExtracurricularMemberEnriched[]> {
    return await this.repo.findMembers(filter);
  }

  async getMemberById(id: string) {
    const member = await this.repo.findMemberById(id);
    if (!member) {
      throw new NotFoundError("Anggota ekstrakurikuler tidak ditemukan");
    }
    return member;
  }

  async registerMember(input: CreateExtracurricularMemberInput) {
    const ekskul = await this.getExtracurricularById(input.extracurricularId);
    if (!ekskul.isActive) {
      throw new ValidationError(`Ekstrakurikuler '${ekskul.name}' saat ini tidak aktif`);
    }

    // Check duplicate enrollment in this period
    const existing = await this.repo.findMemberByStudentAndPeriod(
      input.studentId,
      input.extracurricularId,
      input.academicYearId,
      input.semester
    );
    if (existing) {
      throw new ConflictError("Siswa sudah terdaftar pada ekstrakurikuler ini di periode tersebut");
    }

    // Check max student capacity
    if (ekskul.maxCapacity && ekskul.maxCapacity > 0) {
      const currentCount = await this.repo.countMembers(
        input.extracurricularId,
        input.academicYearId,
        input.semester
      );
      if (currentCount >= ekskul.maxCapacity) {
        throw new ValidationError(`Kuota pendaftaran untuk '${ekskul.name}' sudah penuh (Maks: ${ekskul.maxCapacity})`);
      }
    }

    // Check student choice limit (F-EKS-02: max 3 active ekskul per student per period)
    const studentActiveCount = await this.repo.countStudentActiveEkskul(
      input.studentId,
      input.academicYearId,
      input.semester
    );
    if (studentActiveCount >= 3) {
      throw new ValidationError("Siswa telah mencapai batas maksimal 3 ekstrakurikuler per semester");
    }

    const payload = {
      ...input,
      role: input.role || "MEMBER",
      status: input.status || "ACTIVE",
      joinedDate: input.joinedDate || new Date().toISOString().slice(0, 10),
    };

    return await this.repo.createMember(payload as any);
  }

  async updateMember(id: string, input: UpdateExtracurricularMemberInput) {
    await this.getMemberById(id);
    return await this.repo.updateMember(id, input as any);
  }

  async deleteMember(id: string): Promise<boolean> {
    await this.getMemberById(id);
    return await this.repo.deleteMember(id);
  }

  // --- Grades & RDM Integration ---

  async listGrades(filter?: ExtracurricularGradeQueryInput): Promise<ExtracurricularGradeEnriched[]> {
    return await this.repo.findGrades(filter);
  }

  async upsertGrade(input: UpsertExtracurricularGradeInput) {
    await this.getMemberById(input.extracurricularMemberId);
    return await this.repo.upsertGrade(input as any);
  }

  async batchUpsertGrades(input: BatchUpsertExtracurricularGradesInput) {
    if (!input.items || input.items.length === 0) {
      throw new ValidationError("Daftar nilai tidak boleh kosong");
    }
    return await this.repo.batchUpsertGrades(input.items as any);
  }

  async getStudentRdmGrades(
    studentId: string,
    academicYearId?: string,
    semester?: string
  ): Promise<RdmReportExtracurricularItem[]> {
    const records = await this.repo.findStudentGradesForRdm(studentId, academicYearId, semester);

    return records.map((r) => {
      const predicateLabel = EXTRACURRICULAR_PREDICATE_LABELS[r.score as keyof typeof EXTRACURRICULAR_PREDICATE_LABELS] || r.score;
      return {
        name: r.extracurricularName,
        score: predicateLabel,
        description: r.notes,
      };
    });
  }

  async getStats(): Promise<ExtracurricularStats> {
    return await this.repo.getStats();
  }
}

export const extracurricularService = new ExtracurricularService();
