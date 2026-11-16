import { eq, and, or, ilike, count, desc } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import { ppdbApplicants, ppdbDocuments } from "../../db/schema/ppdb.js";
import { academicYears } from "../../db/schema/setup.js";
import { PpdbDocumentRepository } from "./ppdb-document.repository.js";
import type {
  PpdbApplicant,
  NewPpdbApplicant,
  PpdbDocument,
  NewPpdbDocument,
} from "./ppdb.types.js";

export class PpdbRepository {
  private readonly documentRepo = new PpdbDocumentRepository();
  async getActiveAcademicYear(): Promise<{ id: string; name: string } | null> {
    const db = getDb();
    const [row] = await db
      .select({ id: academicYears.id, name: academicYears.name })
      .from(academicYears)
      .where(eq(academicYears.isActive, true))
      .limit(1);
    return row || null;
  }

  async findApplicants(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    major?: string;
    track?: string;
  }): Promise<{ data: PpdbApplicant[]; total: number }> {
    const db = getDb();
    const conditions = [];

    if (params.search) {
      const term = `%${params.search}%`;
      conditions.push(
        or(
          ilike(ppdbApplicants.fullName, term),
          ilike(ppdbApplicants.registrationNumber, term),
          ilike(ppdbApplicants.nik, term),
          ilike(ppdbApplicants.nisn, term),
          ilike(ppdbApplicants.previousSchoolName, term)
        )
      );
    }

    if (params.status) {
      conditions.push(eq(ppdbApplicants.status, params.status));
    }

    if (params.major) {
      conditions.push(eq(ppdbApplicants.chosenMajor, params.major));
    }

    if (params.track) {
      conditions.push(eq(ppdbApplicants.track, params.track));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalRow] = await db
      .select({ count: count() })
      .from(ppdbApplicants)
      .where(whereClause);

    const total = Number(totalRow?.count ?? 0);
    const offset = (params.page - 1) * params.limit;

    const rows = await db
      .select()
      .from(ppdbApplicants)
      .where(whereClause)
      .orderBy(desc(ppdbApplicants.createdAt))
      .limit(params.limit)
      .offset(offset);

    return { data: rows, total };
  }

  async findById(id: string): Promise<PpdbApplicant | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(ppdbApplicants)
      .where(eq(ppdbApplicants.id, id))
      .limit(1);
    return row || null;
  }

  async findByIdentifier(identifier: string): Promise<PpdbApplicant | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(ppdbApplicants)
      .where(
        or(
          eq(ppdbApplicants.nik, identifier),
          eq(ppdbApplicants.nisn, identifier),
          eq(ppdbApplicants.email, identifier),
          eq(ppdbApplicants.registrationNumber, identifier)
        )
      )
      .limit(1);
    return row || null;
  }

  async findByRegistrationNumber(regNumber: string): Promise<PpdbApplicant | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(ppdbApplicants)
      .where(eq(ppdbApplicants.registrationNumber, regNumber))
      .limit(1);
    return row || null;
  }

  async findByNik(nik: string): Promise<PpdbApplicant | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(ppdbApplicants)
      .where(eq(ppdbApplicants.nik, nik))
      .limit(1);
    return row || null;
  }

  async findByEmail(email: string): Promise<PpdbApplicant | null> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(ppdbApplicants)
      .where(eq(ppdbApplicants.email, email))
      .limit(1);
    return row || null;
  }

  async getLatestRegistrationNumber(prefix: string): Promise<string | null> {
    const db = getDb();
    const term = `${prefix}%`;
    const [row] = await db
      .select({ reg: ppdbApplicants.registrationNumber })
      .from(ppdbApplicants)
      .where(ilike(ppdbApplicants.registrationNumber, term))
      .orderBy(desc(ppdbApplicants.registrationNumber))
      .limit(1);
    return row?.reg || null;
  }

  async create(data: NewPpdbApplicant): Promise<PpdbApplicant> {
    const db = getDb();
    const [row] = await db.insert(ppdbApplicants).values(data).returning();
    return row;
  }

  async update(id: string, data: Partial<NewPpdbApplicant>): Promise<PpdbApplicant | null> {
    const db = getDb();
    const [row] = await db
      .update(ppdbApplicants)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(ppdbApplicants.id, id))
      .returning();
    return row || null;
  }

  // Documents
  async createDocument(data: NewPpdbDocument): Promise<PpdbDocument> {
    return this.documentRepo.createDocument(data);
  }

  async findDocumentsByApplicantId(applicantId: string): Promise<PpdbDocument[]> {
    return this.documentRepo.findDocumentsByApplicantId(applicantId);
  }

  async findDocumentById(id: string): Promise<PpdbDocument | null> {
    return this.documentRepo.findDocumentById(id);
  }

  async updateDocumentVerification(
    id: string,
    status: string,
    notes?: string | null,
    verifiedBy?: string | null
  ): Promise<PpdbDocument | null> {
    return this.documentRepo.updateDocumentVerification(id, status, notes, verifiedBy);
  }

  async deleteDocument(id: string): Promise<boolean> {
    return this.documentRepo.deleteDocument(id);
  }

  async updateStatus(
    id: string,
    status: string,
    notes?: string | null
  ): Promise<PpdbApplicant | null> {
    const db = getDb();
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    const [row] = await db
      .update(ppdbApplicants)
      .set(updateData)
      .where(eq(ppdbApplicants.id, id))
      .returning();
    return row || null;
  }

  async setEnrolled(id: string, studentId: string): Promise<PpdbApplicant | null> {
    const db = getDb();
    const [row] = await db
      .update(ppdbApplicants)
      .set({
        status: "enrolled",
        studentId,
        enrolledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(ppdbApplicants.id, id))
      .returning();
    return row || null;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const res = await db.delete(ppdbApplicants).where(eq(ppdbApplicants.id, id));
    return (res.rowCount ?? 0) > 0;
  }

  async getStats(): Promise<{
    total: number;
    submitted: number;
    verified: number;
    accepted: number;
    rejected: number;
    enrolled: number;
  }> {
    const db = getDb();
    const rows = await db
      .select({
        status: ppdbApplicants.status,
        count: count(),
      })
      .from(ppdbApplicants)
      .groupBy(ppdbApplicants.status);

    const stats = {
      total: 0,
      submitted: 0,
      verified: 0,
      accepted: 0,
      rejected: 0,
      enrolled: 0,
    };

    for (const r of rows) {
      const c = Number(r.count);
      stats.total += c;
      if (r.status in stats) {
        stats[r.status as keyof typeof stats] = c;
      }
    }

    return stats;
  }
}
