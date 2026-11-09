import { eq, and, or, ilike, count, desc, sql } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import {
  letterClassifications,
  incomingLetters,
  dispositions,
  letterSequences,
  outgoingLetters,
  expeditionBooks,
} from "../../db/schema/letters.js";
import { institutions } from "../../db/schema/setup.js";
import type {
  LetterClassification,
  NewLetterClassification,
  IncomingLetter,
  NewIncomingLetter,
  Disposition,
  NewDisposition,
  OutgoingLetter,
  NewOutgoingLetter,
  ExpeditionBook,
  NewExpeditionBook,
  LetterStats,
} from "./letters.types.js";

export class LettersRepository {
  async findClassifications(search?: string, isActive?: boolean): Promise<LetterClassification[]> {
    const db = getDb();
    const conds = [];
    if (search) conds.push(or(ilike(letterClassifications.code, `%${search}%`), ilike(letterClassifications.name, `%${search}%`)));
    if (isActive !== undefined) conds.push(eq(letterClassifications.isActive, isActive));
    return db.select().from(letterClassifications).where(conds.length ? and(...conds) : undefined).orderBy(letterClassifications.code);
  }

  async findClassificationByCode(code: string): Promise<LetterClassification | null> {
    const [row] = await getDb().select().from(letterClassifications).where(eq(letterClassifications.code, code)).limit(1);
    return row || null;
  }

  async createClassification(data: NewLetterClassification): Promise<LetterClassification> {
    const [row] = await getDb().insert(letterClassifications).values(data).returning();
    return row;
  }

  async getNextAgendaNumber(year: number): Promise<number> {
    const [row] = await getDb()
      .select({ maxAgenda: sql<number>`COALESCE(MAX(${incomingLetters.agendaNumber}), 0)` })
      .from(incomingLetters)
      .where(eq(incomingLetters.year, year));
    return Number(row?.maxAgenda ?? 0) + 1;
  }

  async findIncomingLetters(p: { page: number; limit: number; search?: string; status?: string; year?: number; classificationCode?: string }) {
    const db = getDb();
    const conds = [];
    if (p.search) conds.push(or(ilike(incomingLetters.subject, `%${p.search}%`), ilike(incomingLetters.mailNumber, `%${p.search}%`), ilike(incomingLetters.sender, `%${p.search}%`)));
    if (p.status) conds.push(eq(incomingLetters.status, p.status));
    if (p.year) conds.push(eq(incomingLetters.year, p.year));
    if (p.classificationCode) conds.push(eq(incomingLetters.classificationCode, p.classificationCode));
    const where = conds.length ? and(...conds) : undefined;
    const [cnt] = await db.select({ count: count() }).from(incomingLetters).where(where);
    const rows = await db.select().from(incomingLetters).where(where).orderBy(desc(incomingLetters.createdAt)).limit(p.limit).offset((p.page - 1) * p.limit);
    return { data: rows, total: Number(cnt?.count ?? 0) };
  }

  async findIncomingLetterById(id: string): Promise<IncomingLetter | null> {
    const [row] = await getDb().select().from(incomingLetters).where(eq(incomingLetters.id, id)).limit(1);
    return row || null;
  }

  async createIncomingLetter(data: NewIncomingLetter): Promise<IncomingLetter> {
    const [row] = await getDb().insert(incomingLetters).values(data).returning();
    return row;
  }

  async updateIncomingLetter(id: string, data: Partial<NewIncomingLetter>): Promise<IncomingLetter | null> {
    const [row] = await getDb().update(incomingLetters).set({ ...data, updatedAt: new Date() }).where(eq(incomingLetters.id, id)).returning();
    return row || null;
  }

  async findDispositions(p: { incomingLetterId?: string; targetRole?: string; status?: string }): Promise<Disposition[]> {
    const conds = [];
    if (p.incomingLetterId) conds.push(eq(dispositions.incomingLetterId, p.incomingLetterId));
    if (p.targetRole) conds.push(eq(dispositions.targetRole, p.targetRole));
    if (p.status) conds.push(eq(dispositions.status, p.status));
    return getDb().select().from(dispositions).where(conds.length ? and(...conds) : undefined).orderBy(desc(dispositions.createdAt));
  }

  async findDispositionById(id: string): Promise<Disposition | null> {
    const [row] = await getDb().select().from(dispositions).where(eq(dispositions.id, id)).limit(1);
    return row || null;
  }

  async createDisposition(data: NewDisposition): Promise<Disposition> {
    const [row] = await getDb().insert(dispositions).values(data).returning();
    return row;
  }

  async updateDisposition(id: string, data: Partial<NewDisposition>): Promise<Disposition | null> {
    const [row] = await getDb().update(dispositions).set({ ...data, updatedAt: new Date() }).where(eq(dispositions.id, id)).returning();
    return row || null;
  }

  async allocateSequenceNumber(year: number, securityDegree: string): Promise<number> {
    const db = getDb();
    return await db.transaction(async (tx) => {
      const [seq] = await tx.select().from(letterSequences)
        .where(and(eq(letterSequences.year, year), eq(letterSequences.securityDegree, securityDegree)))
        .for("update");
      if (!seq) {
        await tx.insert(letterSequences).values({ year, securityDegree, lastSequence: 1 });
        return 1;
      }
      const nextSeq = seq.lastSequence + 1;
      await tx.update(letterSequences).set({ lastSequence: nextSeq, updatedAt: new Date() }).where(eq(letterSequences.id, seq.id));
      return nextSeq;
    });
  }

  async createOutgoingLetter(data: NewOutgoingLetter): Promise<OutgoingLetter> {
    const [row] = await getDb().insert(outgoingLetters).values(data).returning();
    return row;
  }

  async findOutgoingLetters(p: { page: number; limit: number; search?: string; templateType?: string; status?: string; year?: number; classificationCode?: string }) {
    const db = getDb();
    const conds = [];
    if (p.search) conds.push(or(ilike(outgoingLetters.subject, `%${p.search}%`), ilike(outgoingLetters.letterNumber, `%${p.search}%`), ilike(outgoingLetters.recipient, `%${p.search}%`)));
    if (p.templateType) conds.push(eq(outgoingLetters.templateType, p.templateType));
    if (p.status) conds.push(eq(outgoingLetters.status, p.status));
    if (p.year) conds.push(eq(outgoingLetters.year, p.year));
    if (p.classificationCode) conds.push(eq(outgoingLetters.classificationCode, p.classificationCode));
    const where = conds.length ? and(...conds) : undefined;
    const [cnt] = await db.select({ count: count() }).from(outgoingLetters).where(where);
    const rows = await db.select().from(outgoingLetters).where(where).orderBy(desc(outgoingLetters.createdAt)).limit(p.limit).offset((p.page - 1) * p.limit);
    return { data: rows, total: Number(cnt?.count ?? 0) };
  }

  async findOutgoingLetterById(id: string): Promise<OutgoingLetter | null> {
    const [row] = await getDb().select().from(outgoingLetters).where(eq(outgoingLetters.id, id)).limit(1);
    return row || null;
  }

  async findOutgoingLetterByHash(hash: string): Promise<OutgoingLetter | null> {
    const [row] = await getDb().select().from(outgoingLetters).where(eq(outgoingLetters.verificationHash, hash)).limit(1);
    return row || null;
  }

  async findExpeditions(p: { page: number; limit: number; search?: string; outgoingLetterId?: string }) {
    const db = getDb();
    const conds = [];
    if (p.search) conds.push(or(ilike(expeditionBooks.courierName, `%${p.search}%`), ilike(expeditionBooks.recipientName, `%${p.search}%`)));
    if (p.outgoingLetterId) conds.push(eq(expeditionBooks.outgoingLetterId, p.outgoingLetterId));
    const where = conds.length ? and(...conds) : undefined;
    const [cnt] = await db.select({ count: count() }).from(expeditionBooks).where(where);
    const rows = await db.select().from(expeditionBooks).where(where).orderBy(desc(expeditionBooks.createdAt)).limit(p.limit).offset((p.page - 1) * p.limit);
    return { data: rows, total: Number(cnt?.count ?? 0) };
  }

  async createExpedition(data: NewExpeditionBook): Promise<ExpeditionBook> {
    const [row] = await getDb().insert(expeditionBooks).values(data).returning();
    return row;
  }

  async updateExpedition(id: string, data: Partial<NewExpeditionBook>): Promise<ExpeditionBook | null> {
    const [row] = await getDb().update(expeditionBooks).set({ ...data, updatedAt: new Date() }).where(eq(expeditionBooks.id, id)).returning();
    return row || null;
  }

  async getInstitutionInfo() {
    const [row] = await getDb().select().from(institutions).limit(1);
    return row || null;
  }

  async getStats(): Promise<LetterStats> {
    const db = getDb();
    const [incTotal] = await db.select({ count: count() }).from(incomingLetters);
    const [waitingDisp] = await db.select({ count: count() }).from(incomingLetters).where(eq(incomingLetters.status, "waiting_disposition"));
    const [outTotal] = await db.select({ count: count() }).from(outgoingLetters);
    const [pendingDisp] = await db.select({ count: count() }).from(dispositions).where(eq(dispositions.status, "pending"));
    return {
      totalIncoming: Number(incTotal?.count ?? 0),
      waitingDisposition: Number(waitingDisp?.count ?? 0),
      totalOutgoing: Number(outTotal?.count ?? 0),
      pendingDispositions: Number(pendingDisp?.count ?? 0),
    };
  }
}
