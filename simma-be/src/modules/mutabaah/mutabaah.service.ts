import { NotFoundError, ValidationError } from "../../core/errors/index.js";
import { MutabaahRepository, mutabaahRepository } from "./mutabaah.repository.js";
import type {
  MutabaahActivity,
  MutabaahDailyEntry,
  MutabaahUzurRecord,
  NewMutabaahDailyEntry,
  StudentDailyChecklistRow,
  StudentChecklistEntry,
  ClassroomDailyChecklistResponse,
  StudentComplianceSummary,
  EarlyWarningAlert,
  StudentMonthlyReportData,
} from "./mutabaah.types.js";
import type {
  CreateMutabaahActivityInput,
  UpdateMutabaahActivityInput,
  BatchUpsertMutabaahEntriesInput,
  CreateMutabaahUzurRecordInput,
  QueryComplianceInput,
} from "./mutabaah.schema.js";
import {
  DEFAULT_ACTIVITIES,
  computeStudentEntriesMetrics,
  calculateComplianceScore,
  determineComplianceStatus,
  buildStudentChecklistRows,
  buildMonthlyReportActivityStats,
  buildStudentComplianceSummaries,
} from "./mutabaah.calculator.js";
import { generateMutabaahPdf } from "./mutabaah.pdf.js";

export class MutabaahService {
  constructor(private readonly repo: MutabaahRepository = mutabaahRepository) {}

  async ensureDefaultActivities(): Promise<void> {
    const total = await this.repo.countActivities();
    if (total === 0) {
      await this.repo.insertDefaultActivities(DEFAULT_ACTIVITIES as any);
    }
  }

  async getActivities(params?: { category?: string; isActive?: boolean }): Promise<MutabaahActivity[]> {
    await this.ensureDefaultActivities();
    return this.repo.findActivities(params);
  }

  async getActivityById(id: string): Promise<MutabaahActivity> {
    const item = await this.repo.findActivityById(id);
    if (!item) throw new NotFoundError("Amalan mutaba'ah tidak ditemukan");
    return item;
  }

  async createActivity(input: CreateMutabaahActivityInput): Promise<MutabaahActivity> {
    return this.repo.createActivity(input as any);
  }

  async updateActivity(id: string, input: UpdateMutabaahActivityInput): Promise<MutabaahActivity> {
    const updated = await this.repo.updateActivity(id, input as any);
    if (!updated) throw new NotFoundError("Amalan mutaba'ah tidak ditemukan");
    return updated;
  }

  async deleteActivity(id: string): Promise<void> {
    const deleted = await this.repo.deleteActivity(id);
    if (!deleted) throw new NotFoundError("Amalan mutaba'ah tidak ditemukan");
  }

  async getDailyChecklist(params: {
    date: string;
    classroomId?: string;
    category?: string;
  }): Promise<ClassroomDailyChecklistResponse> {
    await this.ensureDefaultActivities();
    const activities = await this.repo.findActivities({
      category: params.category,
      isActive: true,
    });
    const studentRows = await this.repo.findStudentsForChecklist(params.classroomId);
    const studentIds = studentRows.map((s) => s.id);

    const [entries, uzurRecords] = await Promise.all([
      studentIds.length > 0 ? this.repo.findDailyEntries({ date: params.date, studentIds }) : [],
      studentIds.length > 0 ? this.repo.findUzurRecords({ date: params.date, studentIds }) : [],
    ]);

    const entryMap = new Map<string, MutabaahDailyEntry>();
    for (const e of entries) {
      entryMap.set(`${e.studentId}_${e.activityId}`, e);
    }

    const uzurMap = new Map<string, MutabaahUzurRecord>();
    for (const u of uzurRecords) {
      uzurMap.set(u.studentId, u);
    }

    const students = buildStudentChecklistRows({
      studentRows,
      activities,
      entryMap,
      uzurMap,
    });

    return {
      date: params.date,
      classroomId: params.classroomId,
      className: studentRows[0]?.className ?? null,
      totalStudents: students.length,
      activities,
      students,
    };
  }

  async saveBatchDailyEntries(
    input: BatchUpsertMutabaahEntriesInput,
    recordedBy?: string,
  ): Promise<{ savedCount: number }> {
    const toInsert: NewMutabaahDailyEntry[] = input.entries.map((item) => {
      let score = item.score;
      if (item.status === "terlaksana") score = 100;
      else if (item.status === "masbuk") score = 70;
      else if (item.status === "uzur") score = 100;
      else if (item.status === "tidak_terlaksana") score = 0;

      return {
        studentId: item.studentId,
        activityId: item.activityId,
        date: input.date,
        status: item.status,
        volume: item.volume ?? 1,
        score,
        notes: item.notes ?? null,
        recordedBy: recordedBy ?? null,
      };
    });

    const res = await this.repo.batchUpsertDailyEntries(toInsert);
    return { savedCount: res.length };
  }

  async getUzurRecords(studentId?: string): Promise<MutabaahUzurRecord[]> {
    return this.repo.findUzurRecords({ studentId });
  }

  async createUzurRecord(
    input: CreateMutabaahUzurRecordInput,
    recordedBy?: string,
  ): Promise<MutabaahUzurRecord> {
    const student = await this.repo.findStudentById(input.studentId);
    if (!student) throw new NotFoundError("Data santri tidak ditemukan");
    if (student.gender !== "P") {
      throw new ValidationError("Uzur syar'i haidh hanya diperuntukkan bagi santriwati");
    }
    return this.repo.createUzurRecord({
      studentId: input.studentId,
      startDate: input.startDate,
      endDate: input.endDate ?? null,
      uzurType: input.uzurType ?? "haidh",
      notes: input.notes ?? null,
      recordedBy: recordedBy ?? null,
    });
  }

  async deleteUzurRecord(id: string): Promise<void> {
    const deleted = await this.repo.deleteUzurRecord(id);
    if (!deleted) throw new NotFoundError("Catatan uzur tidak ditemukan");
  }

  async getComplianceRecap(
    params: QueryComplianceInput,
  ): Promise<StudentComplianceSummary[]> {
    await this.ensureDefaultActivities();
    const studentRows = await this.repo.findStudentsForChecklist(params.classroomId);
    if (studentRows.length === 0) return [];

    const studentIds = params.studentId ? [params.studentId] : studentRows.map((s) => s.id);

    const [activities, entries] = await Promise.all([
      this.repo.findActivities({ isActive: true }),
      this.repo.findEntriesInRange({
        startDate: params.startDate,
        endDate: params.endDate,
        studentIds,
      }),
    ]);

    const fardhuIds = new Set(
      activities.filter((a) => a.category === "fardhu").map((a) => a.id),
    );

    const studentEntriesMap = new Map<string, MutabaahDailyEntry[]>();
    for (const e of entries) {
      const list = studentEntriesMap.get(e.studentId) ?? [];
      list.push(e);
      studentEntriesMap.set(e.studentId, list);
    }

    return buildStudentComplianceSummaries(
      studentIds,
      studentRows,
      studentEntriesMap,
      fardhuIds,
    );
  }

  async getEarlyWarnings(classroomId?: string): Promise<EarlyWarningAlert[]> {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const startDate = sevenDaysAgo.toISOString().slice(0, 10);
    const endDate = now.toISOString().slice(0, 10);

    const recaps = await this.getComplianceRecap({ startDate, endDate, classroomId });
    return recaps
      .filter((r) => r.hasEarlyWarning)
      .map((f) => ({
        studentId: f.studentId,
        studentName: f.studentName,
        className: f.className,
        gender: f.gender,
        missedFardhuCount: f.consecutiveMissedFardhu,
        recentMissedDates: [startDate, endDate],
        lastActivityName: "Shalat Fardhu Berjama'ah",
        warningLevel: f.consecutiveMissedFardhu > 4 ? "tinggi" : "sedang",
      }));
  }

  async generateStudentMonthlyReportPdf(studentId: string, month: number, year: number): Promise<Buffer> {
    const student = await this.repo.findStudentById(studentId);
    if (!student) throw new NotFoundError("Data santri tidak ditemukan");

    const inst = (await this.repo.findInstitution()) ?? {
      name: "Madrasah Aliyah SIMMA",
      nsm: "131232040001",
      npsn: "69900001",
      address: "Jl. Pesantren Luhur No. 1",
    };

    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const [recaps, activities, entries] = await Promise.all([
      this.getComplianceRecap({ startDate, endDate, studentId }),
      this.repo.findActivities({ isActive: true }),
      this.repo.findEntriesInRange({ startDate, endDate, studentIds: [studentId] }),
    ]);

    const summary = recaps[0] ?? {
      studentId,
      studentName: student.fullName,
      nisn: student.nisn,
      gender: student.gender,
      className: student.className,
      totalMandatoryActivities: 0,
      completedActivities: 0,
      masbukActivities: 0,
      uzurActivities: 0,
      missedActivities: 0,
      complianceScore: 100,
      status: "istiqamah" as const,
      consecutiveMissedFardhu: 0,
      hasEarlyWarning: false,
    };

    const activityStats = buildMonthlyReportActivityStats(activities, entries);

    const reportData: StudentMonthlyReportData = {
      student: {
        id: student.id,
        fullName: student.fullName,
        nisn: student.nisn,
        nis: student.nis,
        gender: student.gender,
      },
      classroom: {
        id: student.classroomId ?? "00000000-0000-0000-0000-000000000000",
        name: student.className ?? "Asrama Santri",
      },
      institution: {
        name: inst.name,
        nsm: inst.nsm,
        npsn: inst.npsn,
        address: inst.address,
      },
      period: { month, year, startDate, endDate },
      summary,
      activityStats,
    };

    return generateMutabaahPdf(reportData);
  }
}

export const mutabaahService = new MutabaahService();
