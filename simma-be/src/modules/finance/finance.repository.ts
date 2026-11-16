import { eq, and, or, desc, asc, sql, ilike } from "drizzle-orm";
import { getDb } from "../../core/database/client.js";
import {
  feeItems, studentInvoices, paymentTransactions, paymentTransactionItems, dispensationRequests,
  type FeeItemRow, type NewFeeItemRow, type StudentInvoiceRow, type NewStudentInvoiceRow,
  type PaymentTransactionRow, type NewPaymentTransactionRow, type DispensationRequestRow, type NewDispensationRequestRow,
} from "../../db/schema/finance.js";
import { students, classStudents } from "../../db/schema/students.js";
import { classrooms, institutions } from "../../db/schema/setup.js";
import { users } from "../../db/schema/users.js";

export class FinanceRepository {
  async findFeeItems(p?: { type?: string; category?: string; academicYearId?: string; gradeLevel?: number; isActive?: boolean }): Promise<FeeItemRow[]> {
    const conds = [];
    if (p?.type) conds.push(eq(feeItems.type, p.type));
    if (p?.category) conds.push(eq(feeItems.category, p.category));
    if (p?.academicYearId) conds.push(eq(feeItems.academicYearId, p.academicYearId));
    if (p?.gradeLevel !== undefined) conds.push(eq(feeItems.gradeLevel, p.gradeLevel));
    if (p?.isActive !== undefined) conds.push(eq(feeItems.isActive, p.isActive));
    return getDb().select().from(feeItems).where(conds.length ? and(...conds) : undefined).orderBy(asc(feeItems.name));
  }

  async findFeeItemById(id: string): Promise<FeeItemRow | null> {
    const [row] = await getDb().select().from(feeItems).where(eq(feeItems.id, id));
    return row ?? null;
  }

  async findFeeItemByCode(code: string): Promise<FeeItemRow | null> {
    const [row] = await getDb().select().from(feeItems).where(eq(feeItems.code, code.toUpperCase()));
    return row ?? null;
  }

  async createFeeItem(data: NewFeeItemRow): Promise<FeeItemRow> {
    const [row] = await getDb().insert(feeItems).values(data).returning();
    return row;
  }

  async updateFeeItem(id: string, data: Partial<NewFeeItemRow>): Promise<FeeItemRow | null> {
    const [row] = await getDb().update(feeItems).set({ ...data, updatedAt: new Date() }).where(eq(feeItems.id, id)).returning();
    return row ?? null;
  }

  async deleteFeeItem(id: string): Promise<boolean> {
    const res = await getDb().delete(feeItems).where(eq(feeItems.id, id));
    return ((res as any).rowCount ?? 0) > 0;
  }

  async findInvoices(p: { studentId?: string; feeItemId?: string; classroomId?: string; month?: number; year?: number; status?: string; limit?: number; offset?: number }) {
    const conds = [];
    if (p.studentId) conds.push(eq(studentInvoices.studentId, p.studentId));
    if (p.feeItemId) conds.push(eq(studentInvoices.feeItemId, p.feeItemId));
    if (p.classroomId) conds.push(eq(studentInvoices.classroomId, p.classroomId));
    if (p.month) conds.push(eq(studentInvoices.month, p.month));
    if (p.year) conds.push(eq(studentInvoices.year, p.year));
    if (p.status) conds.push(eq(studentInvoices.status, p.status));

    const rows = await getDb()
      .select({ invoice: studentInvoices, studentName: students.fullName, studentNis: students.nis, classroomName: classrooms.name, feeName: feeItems.name, feeCategory: feeItems.category })
      .from(studentInvoices)
      .innerJoin(students, eq(studentInvoices.studentId, students.id))
      .innerJoin(feeItems, eq(studentInvoices.feeItemId, feeItems.id))
      .leftJoin(classrooms, eq(studentInvoices.classroomId, classrooms.id))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(studentInvoices.createdAt))
      .limit(p.limit ?? 50)
      .offset(p.offset ?? 0);

    return rows.map((r) => ({ ...r.invoice, studentName: r.studentName, studentNis: r.studentNis, classroomName: r.classroomName, feeName: r.feeName, feeCategory: r.feeCategory }));
  }

  async findInvoiceById(id: string) {
    const [row] = await getDb()
      .select({ invoice: studentInvoices, feeName: feeItems.name, feeCategory: feeItems.category, studentName: students.fullName, studentNis: students.nis })
      .from(studentInvoices)
      .innerJoin(feeItems, eq(studentInvoices.feeItemId, feeItems.id))
      .innerJoin(students, eq(studentInvoices.studentId, students.id))
      .where(eq(studentInvoices.id, id));
    return row ? { ...row.invoice, feeName: row.feeName, feeCategory: row.feeCategory, studentName: row.studentName, studentNis: row.studentNis } : null;
  }

  async findExistingInvoice(studentId: string, feeItemId: string, year: number, month?: number | null) {
    const conds = [eq(studentInvoices.studentId, studentId), eq(studentInvoices.feeItemId, feeItemId), eq(studentInvoices.year, year)];
    if (month !== undefined && month !== null) conds.push(eq(studentInvoices.month, month));
    const [row] = await getDb().select().from(studentInvoices).where(and(...conds));
    return row ?? null;
  }

  async countInvoicesForYear(year: number): Promise<number> {
    const [res] = await getDb().select({ count: sql<number>`count(*)::int` }).from(studentInvoices).where(eq(studentInvoices.year, year));
    return res?.count ?? 0;
  }

  async createInvoicesBulk(invoices: NewStudentInvoiceRow[]): Promise<number> {
    if (!invoices.length) return 0;
    const res = await getDb().insert(studentInvoices).values(invoices).returning();
    return res.length;
  }

  async updateInvoicePayment(id: string, paidDelta: number, status: string, tx?: any): Promise<StudentInvoiceRow> {
    const client = tx ?? getDb();
    const [updated] = await client
      .update(studentInvoices)
      .set({ paidAmount: sql`${studentInvoices.paidAmount} + ${paidDelta}`, remainingAmount: sql`${studentInvoices.remainingAmount} - ${paidDelta}`, status, updatedAt: new Date() })
      .where(eq(studentInvoices.id, id))
      .returning();
    return updated;
  }

  async searchActiveStudents(query: string, limit = 10) {
    const pattern = `%${query.trim()}%`;
    return getDb()
      .select({ id: students.id, fullName: students.fullName, nis: students.nis, nisn: students.nisn, status: students.status, classroomId: classStudents.classroomId, classroomName: classrooms.name })
      .from(students)
      .leftJoin(classStudents, eq(students.id, classStudents.studentId))
      .leftJoin(classrooms, eq(classStudents.classroomId, classrooms.id))
      .where(and(eq(students.status, "aktif"), or(ilike(students.fullName, pattern), ilike(students.nis, pattern), ilike(students.nisn, pattern))))
      .limit(limit);
  }

  async findStudentWithClass(studentId: string) {
    const [row] = await getDb()
      .select({ id: students.id, fullName: students.fullName, nis: students.nis, nisn: students.nisn, gender: students.gender, status: students.status, classroomId: classStudents.classroomId, classroomName: classrooms.name })
      .from(students)
      .leftJoin(classStudents, eq(students.id, classStudents.studentId))
      .leftJoin(classrooms, eq(classStudents.classroomId, classrooms.id))
      .where(eq(students.id, studentId));
    return row ?? null;
  }

  async findUnpaidInvoicesByStudent(studentId: string) {
    return getDb()
      .select({ invoice: studentInvoices, feeName: feeItems.name, feeCategory: feeItems.category })
      .from(studentInvoices)
      .innerJoin(feeItems, eq(studentInvoices.feeItemId, feeItems.id))
      .where(and(eq(studentInvoices.studentId, studentId), or(eq(studentInvoices.status, "unpaid"), eq(studentInvoices.status, "partial"))))
      .orderBy(asc(studentInvoices.year), asc(studentInvoices.month));
  }

  async countTransactionsByPeriod(year: number, month: number): Promise<number> {
    const [res] = await getDb()
      .select({ count: sql<number>`count(*)::int` })
      .from(paymentTransactions)
      .where(sql`EXTRACT(YEAR FROM ${paymentTransactions.paymentDate}) = ${year} AND EXTRACT(MONTH FROM ${paymentTransactions.paymentDate}) = ${month}`);
    return res?.count ?? 0;
  }

  async createTransaction(trxData: NewPaymentTransactionRow, items: Array<{ invoiceId: string; amount: number; notes?: string | null }>, tx?: any) {
    const client = tx ?? getDb();
    const [transaction] = await client.insert(paymentTransactions).values(trxData).returning();
    const itemValues = items.map((it) => ({ transactionId: transaction.id, invoiceId: it.invoiceId, amount: it.amount, notes: it.notes }));
    const insertedItems = await client.insert(paymentTransactionItems).values(itemValues).returning();
    return { transaction, items: insertedItems };
  }

  async findTransactionById(id: string) {
    const [trx] = await getDb()
      .select({ transaction: paymentTransactions, studentName: students.fullName, studentNis: students.nis, studentNisn: students.nisn, classroomName: classrooms.name, cashierName: users.username })
      .from(paymentTransactions)
      .innerJoin(students, eq(paymentTransactions.studentId, students.id))
      .leftJoin(classStudents, eq(students.id, classStudents.studentId))
      .leftJoin(classrooms, eq(classStudents.classroomId, classrooms.id))
      .leftJoin(users, eq(paymentTransactions.cashierId, users.id))
      .where(eq(paymentTransactions.id, id));

    if (!trx) return null;

    const items = await getDb()
      .select({ item: paymentTransactionItems, invoiceNumber: studentInvoices.invoiceNumber, month: studentInvoices.month, year: studentInvoices.year, feeName: feeItems.name })
      .from(paymentTransactionItems)
      .innerJoin(studentInvoices, eq(paymentTransactionItems.invoiceId, studentInvoices.id))
      .innerJoin(feeItems, eq(studentInvoices.feeItemId, feeItems.id))
      .where(eq(paymentTransactionItems.transactionId, id));

    return {
      ...trx.transaction,
      studentName: trx.studentName,
      studentNis: trx.studentNis,
      studentNisn: trx.studentNisn,
      classroomName: trx.classroomName,
      cashierName: trx.cashierName ?? "Kasir",
      items: items.map((i) => ({ ...i.item, invoiceNumber: i.invoiceNumber, month: i.month, year: i.year, feeName: i.feeName })),
    };
  }

  async findTransactionsByStudentId(studentId: string, limit = 20) {
    return getDb().select().from(paymentTransactions).where(eq(paymentTransactions.studentId, studentId)).orderBy(desc(paymentTransactions.paymentDate)).limit(limit);
  }

  async voidTransaction(id: string, reason: string, voidedBy: string, tx?: any): Promise<PaymentTransactionRow | null> {
    const client = tx ?? getDb();
    const [row] = await client
      .update(paymentTransactions)
      .set({ status: "void", voidReason: reason, voidedBy, voidedAt: new Date(), updatedAt: new Date() })
      .where(eq(paymentTransactions.id, id))
      .returning();
    return row ?? null;
  }

  async findTransactionItems(transactionId: string) {
    return getDb().select().from(paymentTransactionItems).where(eq(paymentTransactionItems.transactionId, transactionId));
  }

  async findActiveStudentsForGeneration(filter?: { classroomId?: string; gradeLevel?: number }) {
    const conds = [eq(students.status, "aktif")];
    if (filter?.classroomId) conds.push(eq(classStudents.classroomId, filter.classroomId));
    if (filter?.gradeLevel) conds.push(eq(classrooms.gradeLevel, filter.gradeLevel));

    return getDb()
      .select({ studentId: students.id, classroomId: classStudents.classroomId })
      .from(students)
      .innerJoin(classStudents, eq(students.id, classStudents.studentId))
      .innerJoin(classrooms, eq(classStudents.classroomId, classrooms.id))
      .where(and(...conds));
  }

  async findDispensations(studentId?: string) {
    const conds = studentId ? [eq(dispensationRequests.studentId, studentId)] : [];
    return getDb()
      .select({ dispensation: dispensationRequests, studentName: students.fullName, studentNis: students.nis, classroomName: classrooms.name, approverName: users.username })
      .from(dispensationRequests)
      .innerJoin(students, eq(dispensationRequests.studentId, students.id))
      .leftJoin(classStudents, eq(students.id, classStudents.studentId))
      .leftJoin(classrooms, eq(classStudents.classroomId, classrooms.id))
      .leftJoin(users, eq(dispensationRequests.approvedBy, users.id))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(dispensationRequests.createdAt));
  }

  async findDispensationById(id: string) {
    const [row] = await getDb().select().from(dispensationRequests).where(eq(dispensationRequests.id, id));
    return row ?? null;
  }

  async createDispensation(data: NewDispensationRequestRow): Promise<DispensationRequestRow> {
    const [row] = await getDb().insert(dispensationRequests).values(data).returning();
    return row;
  }

  async updateDispensation(id: string, data: Partial<NewDispensationRequestRow>): Promise<DispensationRequestRow | null> {
    const [row] = await getDb().update(dispensationRequests).set({ ...data, updatedAt: new Date() }).where(eq(dispensationRequests.id, id)).returning();
    return row ?? null;
  }

  async getCashflowSummary(startDate?: string, endDate?: string, method?: string) {
    const conds = [eq(paymentTransactions.status, "success")];
    if (startDate) conds.push(sql`${paymentTransactions.paymentDate} >= ${startDate}::timestamp`);
    if (endDate) conds.push(sql`${paymentTransactions.paymentDate} <= (${endDate} || ' 23:59:59')::timestamp`);
    if (method) conds.push(eq(paymentTransactions.paymentMethod, method));

    const rows = await getDb()
      .select({ total: sql<number>`COALESCE(SUM(${paymentTransactions.totalAmount}), 0)::int`, count: sql<number>`count(*)::int`, method: paymentTransactions.paymentMethod })
      .from(paymentTransactions)
      .where(and(...conds))
      .groupBy(paymentTransactions.paymentMethod);

    const list = await getDb()
      .select({ transaction: paymentTransactions, studentName: students.fullName, studentNis: students.nis })
      .from(paymentTransactions)
      .innerJoin(students, eq(paymentTransactions.studentId, students.id))
      .where(and(...conds))
      .orderBy(desc(paymentTransactions.paymentDate))
      .limit(100);

    return { summary: rows, recentList: list };
  }

  async getArrearsSummary(classroomId?: string) {
    const conds = [or(eq(studentInvoices.status, "unpaid"), eq(studentInvoices.status, "partial"))];
    if (classroomId) conds.push(eq(studentInvoices.classroomId, classroomId));

    return getDb()
      .select({
        studentId: studentInvoices.studentId,
        studentName: students.fullName,
        studentNis: students.nis,
        classroomName: classrooms.name,
        unpaidCount: sql<number>`count(*)::int`,
        totalRemaining: sql<number>`COALESCE(SUM(${studentInvoices.remainingAmount}), 0)::int`.as("total_remaining"),
      })
      .from(studentInvoices)
      .innerJoin(students, eq(studentInvoices.studentId, students.id))
      .leftJoin(classrooms, eq(studentInvoices.classroomId, classrooms.id))
      .where(and(...conds))
      .groupBy(studentInvoices.studentId, students.fullName, students.nis, classrooms.name)
      .orderBy(desc(sql`COALESCE(SUM(${studentInvoices.remainingAmount}), 0)`));
  }

  async findInstitution() {
    const [inst] = await getDb().select().from(institutions).limit(1);
    return inst ?? { name: "Madrasah Aliyah SIMMA", nsm: "131232010001", npsn: "20276001", address: "Jl. Madrasah No. 1" };
  }
}

export const financeRepository = new FinanceRepository();
