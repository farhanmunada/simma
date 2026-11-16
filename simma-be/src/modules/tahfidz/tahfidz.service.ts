import { NotFoundError } from "../../core/errors/index.js";
import { TahfidzRepository, tahfidzRepository } from "./tahfidz.repository.js";
import type {
  TahfidzRecord,
  TasmiExam,
  JuzProgress,
  TahfidzProgressResponse,
  StudentTahfidzHistory,
} from "./tahfidz.types.js";
import type {
  CreateTahfidzRecordInput,
  UpdateTahfidzRecordInput,
  TahfidzQueryParams,
  CreateTasmiExamInput,
  UpdateTasmiExamInput,
  TasmiQueryParams,
} from "./tahfidz.schema.js";
import type { PaginatedResponse } from "@simma/shared";

export class TahfidzService {
  constructor(private readonly repo: TahfidzRepository = tahfidzRepository) {}

  // --- Tahfidz Records ---

  async getRecordById(id: string): Promise<TahfidzRecord> {
    const record = await this.repo.findRecordById(id);
    if (!record) {
      throw new NotFoundError("Catatan setoran tahfidz", id);
    }
    return record;
  }

  async createRecord(
    input: CreateTahfidzRecordInput,
    authTeacherId?: string | null,
  ): Promise<TahfidzRecord> {
    const teacherId = input.teacherId ?? authTeacherId ?? null;

    return this.repo.createRecord({
      studentId: input.studentId,
      teacherId,
      type: input.type,
      juz: input.juz,
      surah: input.surah,
      ayahStart: input.ayahStart,
      ayahEnd: input.ayahEnd,
      tajwidScore: input.tajwidScore,
      makhrojScore: input.makhrojScore,
      fluencyScore: input.fluencyScore,
      status: input.status,
      notes: input.notes ?? null,
      date: input.date,
    });
  }

  async updateRecord(
    id: string,
    input: UpdateTahfidzRecordInput,
  ): Promise<TahfidzRecord> {
    await this.getRecordById(id);

    const updated = await this.repo.updateRecord(id, {
      ...(input.studentId !== undefined && { studentId: input.studentId }),
      ...(input.teacherId !== undefined && { teacherId: input.teacherId }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.juz !== undefined && { juz: input.juz }),
      ...(input.surah !== undefined && { surah: input.surah }),
      ...(input.ayahStart !== undefined && { ayahStart: input.ayahStart }),
      ...(input.ayahEnd !== undefined && { ayahEnd: input.ayahEnd }),
      ...(input.tajwidScore !== undefined && { tajwidScore: input.tajwidScore }),
      ...(input.makhrojScore !== undefined && { makhrojScore: input.makhrojScore }),
      ...(input.fluencyScore !== undefined && { fluencyScore: input.fluencyScore }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.date !== undefined && { date: input.date }),
    });

    if (!updated) {
      throw new NotFoundError("Catatan setoran tahfidz", id);
    }
    return updated;
  }

  async deleteRecord(id: string): Promise<void> {
    await this.getRecordById(id);
    const deleted = await this.repo.deleteRecord(id);
    if (!deleted) {
      throw new NotFoundError("Catatan setoran tahfidz", id);
    }
  }

  async getRecords(
    query: TahfidzQueryParams,
  ): Promise<PaginatedResponse<TahfidzRecord>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { data, total } = await this.repo.findRecords(query);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // --- Student History & Progress ---

  async getStudentHistory(studentId: string): Promise<StudentTahfidzHistory> {
    const [records, tasmiExams] = await Promise.all([
      this.repo.findRecordsByStudentId(studentId),
      this.repo.findTasmiExamsByStudentId(studentId),
    ]);

    return {
      studentId,
      records,
      tasmiExams,
    };
  }

  async getStudentProgress(studentId: string): Promise<TahfidzProgressResponse> {
    const [records, tasmiList] = await Promise.all([
      this.repo.findRecordsByStudentId(studentId),
      this.repo.findTasmiExamsByStudentId(studentId),
    ]);

    // Build map for tasmi exams by juz (latest exam wins)
    const tasmiByJuz = new Map<number, TasmiExam>();
    for (const exam of tasmiList) {
      const current = tasmiByJuz.get(exam.juz);
      if (!current || new Date(exam.examDate) > new Date(current.examDate)) {
        tasmiByJuz.set(exam.juz, exam);
      }
    }

    // Initialize 30 juz map
    const juzMap: JuzProgress[] = [];
    let totalZiyadah = 0;
    let totalMurajaah = 0;
    let totalTasmiPassed = 0;
    let completedJuzCount = 0;

    for (let j = 1; j <= 30; j++) {
      const juzRecords = records.filter((r) => r.juz === j && r.status === "lulus");
      const zCount = juzRecords.filter((r) => r.type === "Z").length;
      const mCount = juzRecords.filter((r) => r.type === "M").length;

      const totalPassedAyahs = juzRecords.reduce((sum, r) => {
        const diff = Math.max(0, r.ayahEnd - r.ayahStart + 1);
        return sum + diff;
      }, 0);

      const tasmiExam = tasmiByJuz.get(j);
      const tasmiStatus = tasmiExam ? tasmiExam.status : "none";
      const isCompleted = tasmiStatus === "lulus";

      if (isCompleted) {
        completedJuzCount++;
      }

      juzMap.push({
        juz: j,
        ziyadahCount: zCount,
        murajaahCount: mCount,
        totalPassedAyahs,
        tasmiStatus,
        isCompleted,
      });
    }

    // Overall summary calculations
    totalZiyadah = records.filter((r) => r.type === "Z" && r.status === "lulus").length;
    totalMurajaah = records.filter((r) => r.type === "M" && r.status === "lulus").length;
    totalTasmiPassed = tasmiList.filter((e) => e.status === "lulus").length;

    const latestRecord = records[0]; // ordered desc by date
    const lastMemorized = latestRecord
      ? {
          juz: latestRecord.juz,
          surah: latestRecord.surah,
          ayahEnd: latestRecord.ayahEnd,
          date: latestRecord.date,
        }
      : null;

    return {
      studentId,
      juzMap,
      summary: {
        totalZiyadah,
        totalMurajaah,
        totalTasmiPassed,
        completedJuzCount,
        lastMemorized,
      },
    };
  }

  // --- Tasmi' Exams ---

  async getTasmiExamById(id: string): Promise<TasmiExam> {
    const exam = await this.repo.findTasmiExamById(id);
    if (!exam) {
      throw new NotFoundError("Ujian tasmi'", id);
    }
    return exam;
  }

  async createTasmiExam(
    input: CreateTasmiExamInput,
    authExaminerId?: string | null,
  ): Promise<TasmiExam> {
    const examinerId = input.examinerId ?? authExaminerId ?? null;
    const finalScore =
      input.finalScore ??
      Math.round((input.tajwidScore + input.makhrojScore + input.fluencyScore) / 3);

    return this.repo.createTasmiExam({
      studentId: input.studentId,
      examinerId,
      juz: input.juz,
      tajwidScore: input.tajwidScore,
      makhrojScore: input.makhrojScore,
      fluencyScore: input.fluencyScore,
      finalScore,
      status: input.status,
      notes: input.notes ?? null,
      examDate: input.examDate,
    });
  }

  async updateTasmiExam(
    id: string,
    input: UpdateTasmiExamInput,
  ): Promise<TasmiExam> {
    const existing = await this.getTasmiExamById(id);

    const tajwid = input.tajwidScore ?? existing.tajwidScore;
    const makhroj = input.makhrojScore ?? existing.makhrojScore;
    const fluency = input.fluencyScore ?? existing.fluencyScore;
    const finalScore =
      input.finalScore ??
      (input.tajwidScore !== undefined ||
      input.makhrojScore !== undefined ||
      input.fluencyScore !== undefined
        ? Math.round((tajwid + makhroj + fluency) / 3)
        : existing.finalScore);

    const updated = await this.repo.updateTasmiExam(id, {
      ...(input.studentId !== undefined && { studentId: input.studentId }),
      ...(input.examinerId !== undefined && { examinerId: input.examinerId }),
      ...(input.juz !== undefined && { juz: input.juz }),
      ...(input.tajwidScore !== undefined && { tajwidScore: input.tajwidScore }),
      ...(input.makhrojScore !== undefined && { makhrojScore: input.makhrojScore }),
      ...(input.fluencyScore !== undefined && { fluencyScore: input.fluencyScore }),
      finalScore,
      ...(input.status !== undefined && { status: input.status }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.examDate !== undefined && { examDate: input.examDate }),
    });

    if (!updated) {
      throw new NotFoundError("Ujian tasmi'", id);
    }
    return updated;
  }

  async deleteTasmiExam(id: string): Promise<void> {
    await this.getTasmiExamById(id);
    const deleted = await this.repo.deleteTasmiExam(id);
    if (!deleted) {
      throw new NotFoundError("Ujian tasmi'", id);
    }
  }

  async getTasmiExams(
    query: TasmiQueryParams,
  ): Promise<PaginatedResponse<TasmiExam>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { data, total } = await this.repo.findTasmiExams(query);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

export const tahfidzService = new TahfidzService();
