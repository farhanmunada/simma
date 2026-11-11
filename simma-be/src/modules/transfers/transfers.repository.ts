import { eq, and, sql, desc, inArray } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { getDb } from "../../core/database/client.js";
import {
  studentTransfers,
  transferClearances,
} from "../../db/schema/transfers.js";
import { students, classStudents } from "../../db/schema/students.js";
import { classrooms, institutions } from "../../db/schema/setup.js";
import { users } from "../../db/schema/users.js";
import type {
  TransferWithDetails,
  TransferStats,
} from "./transfers.types.js";
import type {
  CreateTransferInInput,
  CreateTransferOutInput,
  FilterTransferInput,
  ClearanceDimension,
} from "./transfers.schema.js";
import { evaluateClearanceStatus } from "./transfers.clearance.js";
import { TransfersClearanceOps } from "./transfers.clearance-ops.js";
import { graduationsRepository } from "./graduations.repository.js";

export class TransfersRepository {
  private readonly clearanceOps: TransfersClearanceOps;

  constructor(private readonly db: PostgresJsDatabase = getDb() as any) {
    this.clearanceOps = new TransfersClearanceOps(this.db);
  }

  async findTransfers(filter: FilterTransferInput): Promise<{ items: TransferWithDetails[]; total: number }> {
    const conditions = [];
    if (filter.type) conditions.push(eq(studentTransfers.type, filter.type));
    if (filter.status) conditions.push(eq(studentTransfers.status, filter.status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (filter.page - 1) * filter.limit;

    const rows = await this.db
      .select({
        transfer: studentTransfers,
        studentName: students.fullName,
        studentNis: students.nis,
        studentNisn: students.nisn,
        targetClassroomName: classrooms.name,
      })
      .from(studentTransfers)
      .leftJoin(students, eq(studentTransfers.studentId, students.id))
      .leftJoin(classrooms, eq(studentTransfers.targetClassroomId, classrooms.id))
      .where(whereClause)
      .orderBy(desc(studentTransfers.createdAt))
      .limit(filter.limit)
      .offset(offset);

    const transferIds = rows.map((r) => r.transfer.id);
    const clearances =
      transferIds.length > 0
        ? await this.db
            .select()
            .from(transferClearances)
            .where(inArray(transferClearances.transferId, transferIds))
        : [];

    const clearanceMap = new Map(clearances.map((c) => [c.transferId, c]));

    const items: TransferWithDetails[] = rows.map((r) => ({
      ...r.transfer,
      studentName: r.studentName ?? "Tanpa Nama",
      studentNis: r.studentNis,
      studentNisn: r.studentNisn,
      targetClassroomName: r.targetClassroomName,
      clearance: clearanceMap.get(r.transfer.id) ?? null,
    }));

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(studentTransfers)
      .where(whereClause);

    return { items, total: countResult?.count ?? 0 };
  }

  async findTransferById(id: string): Promise<TransferWithDetails | null> {
    const [row] = await this.db
      .select({
        transfer: studentTransfers,
        studentName: students.fullName,
        studentNis: students.nis,
        studentNisn: students.nisn,
        targetClassroomName: classrooms.name,
        creatorName: users.username,
      })
      .from(studentTransfers)
      .leftJoin(students, eq(studentTransfers.studentId, students.id))
      .leftJoin(classrooms, eq(studentTransfers.targetClassroomId, classrooms.id))
      .leftJoin(users, eq(studentTransfers.createdById, users.id))
      .where(eq(studentTransfers.id, id))
      .limit(1);

    if (!row) return null;

    const [clearance] = await this.db
      .select()
      .from(transferClearances)
      .where(eq(transferClearances.transferId, id))
      .limit(1);

    return {
      ...row.transfer,
      studentName: row.studentName ?? "Tanpa Nama",
      studentNis: row.studentNis,
      studentNisn: row.studentNisn,
      targetClassroomName: row.targetClassroomName,
      clearance: clearance ?? null,
      creatorName: row.creatorName,
    };
  }

  async findTransferByVerificationCode(code: string): Promise<TransferWithDetails | null> {
    const [row] = await this.db
      .select({
        transfer: studentTransfers,
        studentName: students.fullName,
        studentNis: students.nis,
        studentNisn: students.nisn,
      })
      .from(studentTransfers)
      .leftJoin(students, eq(studentTransfers.studentId, students.id))
      .where(eq(studentTransfers.verificationCode, code))
      .limit(1);

    if (!row) return null;
    return {
      ...row.transfer,
      studentName: row.studentName ?? "Tanpa Nama",
      studentNis: row.studentNis,
      studentNisn: row.studentNisn,
    };
  }

  async createTransferIn(
    input: CreateTransferInInput,
    referenceNumber: string,
    createdById: string
  ): Promise<TransferWithDetails> {
    return await this.db.transaction(async (tx) => {
      const [newStudent] = await tx
        .insert(students)
        .values({
          nik: input.student.nik || `NIK-${Date.now()}`,
          nisn: input.student.nisn,
          fullName: input.student.fullName,
          birthPlace: input.student.birthPlace || "Madrasah",
          birthDate: input.student.birthDate,
          gender: input.student.gender,
          motherName: "Ibu Kandung",
          status: "aktif",
        })
        .returning();

      await tx.insert(classStudents).values({
        studentId: newStudent.id,
        classroomId: input.targetClassroomId,
        nisInClass: input.stambukNumber,
      });

      const [transfer] = await tx
        .insert(studentTransfers)
        .values({
          type: "masuk",
          referenceNumber,
          studentId: newStudent.id,
          status: "completed",
          transferDate: input.transferDate,
          originSchool: input.originSchool,
          originLetterNumber: input.originLetterNumber,
          originNpsn: input.originNpsn,
          previousClassLevel: input.previousClassLevel,
          targetClassroomId: input.targetClassroomId,
          stambukNumber: input.stambukNumber,
          notes: input.notes,
          createdById,
        })
        .returning();

      return {
        ...transfer,
        studentName: newStudent.fullName,
        studentNis: newStudent.nis,
        studentNisn: newStudent.nisn,
      };
    });
  }

  async createTransferOut(
    input: CreateTransferOutInput,
    referenceNumber: string,
    createdById: string
  ): Promise<TransferWithDetails> {
    return await this.db.transaction(async (tx) => {
      const [transfer] = await tx
        .insert(studentTransfers)
        .values({
          type: "keluar",
          referenceNumber,
          studentId: input.studentId,
          status: "pending_clearance",
          transferDate: input.transferDate,
          destinationSchool: input.destinationSchool,
          reason: input.reason,
          notes: input.notes,
          createdById,
        })
        .returning();

      const [clearance] = await tx
        .insert(transferClearances)
        .values({
          transferId: transfer.id,
          studentId: input.studentId,
          status: "pending",
        })
        .returning();

      const [student] = await tx
        .select()
        .from(students)
        .where(eq(students.id, input.studentId))
        .limit(1);

      return {
        ...transfer,
        studentName: student?.fullName ?? "Tanpa Nama",
        studentNis: student?.nis,
        studentNisn: student?.nisn,
        clearance,
      };
    });
  }

  async updateClearance(
    transferId: string,
    dimension: ClearanceDimension,
    cleared: boolean,
    userId: string,
    notes?: string | null
  ) {
    return this.clearanceOps.updateClearance(transferId, dimension, cleared, userId, notes);
  }

  async finalizeTransferApproval(
    transferId: string,
    approved: boolean,
    approverId: string,
    notes?: string | null,
    verificationCode?: string
  ) {
    return this.clearanceOps.finalizeTransferApproval(transferId, approved, approverId, notes, verificationCode);
  }

  async getStats(): Promise<TransferStats> {
    const [statsIn] = await this.db.select({ count: sql<number>`count(*)::int` }).from(studentTransfers).where(eq(studentTransfers.type, "masuk"));
    const [statsOut] = await this.db.select({ count: sql<number>`count(*)::int` }).from(studentTransfers).where(eq(studentTransfers.type, "keluar"));
    const [pendingClearance] = await this.db.select({ count: sql<number>`count(*)::int` }).from(studentTransfers).where(eq(studentTransfers.status, "pending_clearance"));
    const [pendingApproval] = await this.db.select({ count: sql<number>`count(*)::int` }).from(studentTransfers).where(eq(studentTransfers.status, "pending_approval"));
    const [completed] = await this.db.select({ count: sql<number>`count(*)::int` }).from(studentTransfers).where(eq(studentTransfers.status, "completed"));
    const totalGraduated = await graduationsRepository.getGraduationStats();

    return {
      totalIn: statsIn?.count ?? 0,
      totalOut: statsOut?.count ?? 0,
      pendingClearance: pendingClearance?.count ?? 0,
      pendingApproval: pendingApproval?.count ?? 0,
      completedThisYear: completed?.count ?? 0,
      totalGraduated,
    };
  }

  async getInstitutionInfo() {
    const [inst] = await this.db.select().from(institutions).limit(1);
    return inst ?? { name: "Madrasah Aliyah SIMMA", address: "Jl. Pendidikan Madrasah No. 1", nsm: "131100000000", npsn: "60000000" };
  }
}

export const transfersRepository = new TransfersRepository();
