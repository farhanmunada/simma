import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../../core/errors/app-error.js";
import {
  ADDITIONAL_DUTY_JTM_MAP,
  MIN_JTM_TPG,
  type AdditionalDutyType,
  type SimpatikaStatus,
} from "@simma/shared";
import { teachersRepository, TeachersRepository } from "./teachers.repository.js";
import type {
  CreateTeacherFullInput,
  UpdateTeacherFullInput,
  CreateTeacherEducationInput,
  CreateTeacherRankInput,
  CreateTeacherDocumentInput,
  UpsertTeacherWorkloadInput,
  TeacherQueryParams,
} from "./teachers.schema.js";
import type {
  TeacherFullDetail,
  TeacherWithDetails,
  WorkloadSummary,
  GtkStats,
  EmisGtkRecord,
} from "./teachers.types.js";

export class TeachersService {
  constructor(private repo: TeachersRepository = teachersRepository) {}

  async getTeachers(params: TeacherQueryParams): Promise<{ data: TeacherWithDetails[]; total: number }> {
    return this.repo.findTeachers(params);
  }

  async getTeacherById(id: string): Promise<TeacherFullDetail> {
    const teacher = await this.repo.findTeacherById(id);
    if (!teacher) {
      throw new NotFoundError(`GTK dengan ID ${id} tidak ditemukan`);
    }
    return teacher;
  }

  async createTeacher(input: CreateTeacherFullInput): Promise<TeacherFullDetail> {
    const existingNik = await this.repo.findByNik(input.nik);
    if (existingNik) {
      throw new ConflictError(`GTK dengan NIK ${input.nik} sudah terdaftar`);
    }

    if (input.nuptk) {
      const existingNuptk = await this.repo.findByNuptk(input.nuptk);
      if (existingNuptk) {
        throw new ConflictError(`GTK dengan NUPTK ${input.nuptk} sudah terdaftar`);
      }
    }

    const teacherData = {
      userId: input.userId ?? null,
      nik: input.nik,
      nuptk: input.nuptk ?? null,
      fullName: input.fullName,
      employmentType: input.employmentType,
      certification: input.certification ?? null,
      emisData: input.emisData ?? {},
    };

    return this.repo.createTeacherWithProfile(teacherData, input.profile);
  }

  async updateTeacher(id: string, input: UpdateTeacherFullInput): Promise<TeacherFullDetail> {
    const current = await this.repo.findTeacherById(id);
    if (!current) {
      throw new NotFoundError(`GTK dengan ID ${id} tidak ditemukan`);
    }

    if (input.nik && input.nik !== current.nik) {
      const existingNik = await this.repo.findByNik(input.nik);
      if (existingNik && existingNik.id !== id) {
        throw new ConflictError(`GTK dengan NIK ${input.nik} sudah digunakan`);
      }
    }

    if (input.nuptk && input.nuptk !== current.nuptk) {
      const existingNuptk = await this.repo.findByNuptk(input.nuptk);
      if (existingNuptk && existingNuptk.id !== id) {
        throw new ConflictError(`GTK dengan NUPTK ${input.nuptk} sudah digunakan`);
      }
    }

    const teacherData = {
      userId: input.userId !== undefined ? input.userId : undefined,
      nik: input.nik,
      nuptk: input.nuptk,
      fullName: input.fullName,
      employmentType: input.employmentType,
      certification: input.certification,
      emisData: input.emisData,
    };

    return this.repo.updateTeacherWithProfile(id, teacherData, input.profile);
  }

  async deleteTeacher(id: string): Promise<void> {
    const current = await this.repo.findTeacherById(id);
    if (!current) {
      throw new NotFoundError(`GTK dengan ID ${id} tidak ditemukan`);
    }
    await this.repo.softDeleteTeacher(id);
  }

  async addEducation(teacherId: string, input: CreateTeacherEducationInput) {
    await this.getTeacherById(teacherId);
    return this.repo.createEducation(teacherId, input);
  }

  async removeEducation(teacherId: string, eduId: string) {
    await this.getTeacherById(teacherId);
    const success = await this.repo.deleteEducation(eduId);
    if (!success) throw new NotFoundError("Data pendidikan tidak ditemukan");
  }

  async addRank(teacherId: string, input: CreateTeacherRankInput) {
    await this.getTeacherById(teacherId);
    let { nextKgbDate, nextPromotionDate, tmtRank } = input;
    if (!nextKgbDate && tmtRank) {
      const tmt = new Date(tmtRank);
      tmt.setFullYear(tmt.getFullYear() + 2);
      nextKgbDate = tmt.toISOString().split("T")[0];
    }
    if (!nextPromotionDate && tmtRank) {
      const tmt = new Date(tmtRank);
      tmt.setFullYear(tmt.getFullYear() + 4);
      nextPromotionDate = tmt.toISOString().split("T")[0];
    }
    return this.repo.createRank(teacherId, {
      ...input,
      nextKgbDate,
      nextPromotionDate,
    });
  }

  async removeRank(teacherId: string, rankId: string) {
    await this.getTeacherById(teacherId);
    const success = await this.repo.deleteRank(rankId);
    if (!success) throw new NotFoundError("Data pangkat tidak ditemukan");
  }

  async addDocument(teacherId: string, input: CreateTeacherDocumentInput) {
    await this.getTeacherById(teacherId);
    return this.repo.createDocument(teacherId, input);
  }

  async removeDocument(teacherId: string, docId: string) {
    await this.getTeacherById(teacherId);
    const success = await this.repo.deleteDocument(docId);
    if (!success) throw new NotFoundError("Dokumen GTK tidak ditemukan");
  }

  async upsertWorkload(input: UpsertTeacherWorkloadInput) {
    await this.getTeacherById(input.teacherId);
    const dutyType = (input.additionalDutyType ?? "tidak_ada") as AdditionalDutyType;
    const additionalDutyJtm =
      input.additionalDutyJtm !== undefined && input.additionalDutyJtm > 0
        ? input.additionalDutyJtm
        : ADDITIONAL_DUTY_JTM_MAP[dutyType] ?? 0;

    const teachingJtm = input.teachingJtm ?? 0;
    const totalJtm = teachingJtm + additionalDutyJtm;
    const isEligibleTpg = totalJtm >= MIN_JTM_TPG;
    const simpatikaStatus: SimpatikaStatus = isEligibleTpg ? "layak" : "tidak_layak";

    return this.repo.upsertWorkload({
      teacherId: input.teacherId,
      academicYearId: input.academicYearId,
      semesterId: input.semesterId,
      teachingJtm,
      additionalDutyType: dutyType,
      additionalDutyJtm,
      totalJtm,
      isEligibleTpg,
      simpatikaStatus,
      notes: input.notes ?? null,
    });
  }

  async getWorkloadRecap(academicYearId?: string, semesterId?: string): Promise<WorkloadSummary[]> {
    const { data: allTeachers } = await this.repo.findTeachers({ page: 1, limit: 100 });
    const workloads = await this.repo.findAllWorkloads(academicYearId, semesterId);
    const workloadMap = new Map(workloads.map((w) => [w.teacherId, w]));

    return allTeachers.map((t) => {
      const wl = workloadMap.get(t.id);
      const teachingJtm = wl?.teachingJtm ?? 0;
      const additionalDutyType = (wl?.additionalDutyType ?? "tidak_ada") as AdditionalDutyType;
      const additionalDutyJtm = wl?.additionalDutyJtm ?? 0;
      const totalJtm = wl?.totalJtm ?? teachingJtm + additionalDutyJtm;
      const isEligibleTpg = wl?.isEligibleTpg ?? totalJtm >= MIN_JTM_TPG;
      const simpatikaStatus = (wl?.simpatikaStatus ?? (isEligibleTpg ? "layak" : "tidak_layak")) as SimpatikaStatus;

      return {
        teacherId: t.id,
        fullName: t.fullName,
        nik: t.nik,
        nuptk: t.nuptk,
        employmentType: t.employmentType,
        teachingJtm,
        additionalDutyType,
        additionalDutyJtm,
        totalJtm,
        isEligibleTpg,
        simpatikaStatus,
      };
    });
  }

  async getStats(): Promise<GtkStats> {
    const { data: teachersList } = await this.repo.findTeachers({ page: 1, limit: 1000 });
    const totalGtk = teachersList.length;
    let totalPendidik = 0;
    let totalTenagaKependidikan = 0;
    let pnsCount = 0;
    let pppkCount = 0;
    let gtyCount = 0;
    let gttCount = 0;
    let pttCount = 0;
    let certifiedCount = 0;
    let eligibleTpgCount = 0;
    let totalJtmSum = 0;

    for (const t of teachersList) {
      if (t.profile?.gtkType === "tenaga_kependidikan") totalTenagaKependidikan++;
      else totalPendidik++;

      if (t.employmentType === "PNS") pnsCount++;
      else if (t.employmentType === "PPPK") pppkCount++;
      else if (t.employmentType === "GTY") gtyCount++;
      else if (t.employmentType === "GTT") gttCount++;
      else if (t.employmentType === "PTT") pttCount++;

      if (t.certification || t.profile?.nrg) certifiedCount++;
      if (t.currentWorkload?.isEligibleTpg) eligibleTpgCount++;
      totalJtmSum += t.currentWorkload?.totalJtm ?? 0;
    }

    return {
      totalGtk,
      totalPendidik,
      totalTenagaKependidikan,
      pnsCount,
      pppkCount,
      gtyCount,
      gttCount,
      pttCount,
      certifiedCount,
      eligibleTpgCount,
      averageJtm: totalGtk > 0 ? Math.round((totalJtmSum / totalGtk) * 10) / 10 : 0,
    };
  }

  async getEmisExport(params: TeacherQueryParams): Promise<EmisGtkRecord[]> {
    const { data } = await this.repo.findTeachers({ ...params, limit: 1000 });
    return data.map((t) => ({
      nik: t.nik,
      nuptk: t.nuptk ?? "",
      pegId: t.profile?.pegId ?? "",
      nip: t.profile?.nip ?? "",
      nrg: t.profile?.nrg ?? "",
      fullName: t.fullName,
      gender: t.profile?.gender ?? "",
      birthPlace: t.profile?.birthPlace ?? "",
      birthDate: t.profile?.birthDate ? String(t.profile.birthDate) : "",
      employmentType: t.employmentType,
      gtkType: t.profile?.gtkType ?? "pendidik",
      dutyStatus: t.profile?.dutyStatus ?? "aktif",
      tmtFirst: t.profile?.tmtFirst ? String(t.profile.tmtFirst) : "",
      highestEducation: "",
      major: "",
      isCertified: Boolean(t.certification || t.profile?.nrg),
      certificationField: t.profile?.certificationField ?? t.certification ?? "",
      totalJtm: t.currentWorkload?.totalJtm ?? 0,
      isEligibleTpg: Boolean(t.currentWorkload?.isEligibleTpg),
    }));
  }
}

export const teachersService = new TeachersService();
