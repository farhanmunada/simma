import { NotFoundError, ValidationError, ConflictError } from "../../core/errors/app-error.js";
import { getDb } from "../../core/database/client.js";
import { financeRepository, FinanceRepository } from "./finance.repository.js";
import { generatePaymentReceiptPdf } from "./finance.pdf.js";
import type {
  CreateFeeItemInput,
  UpdateFeeItemInput,
  QueryFeeItemParams,
  GenerateInvoicesInput,
  QueryInvoicesParams,
  ProcessPaymentInput,
  VoidPaymentInput,
  CreateDispensationInput,
  UpdateDispensationStatusInput,
  CashflowReportQuery,
  ArrearsReportQuery,
} from "./finance.types.js";

export class FinanceService {
  constructor(private repo: FinanceRepository = financeRepository) {}

  async listFeeItems(params?: QueryFeeItemParams) {
    return this.repo.findFeeItems(params);
  }

  async getFeeItem(id: string) {
    const item = await this.repo.findFeeItemById(id);
    if (!item) throw new NotFoundError("Pos biaya", id);
    return item;
  }

  async createFeeItem(input: CreateFeeItemInput) {
    const existing = await this.repo.findFeeItemByCode(input.code);
    if (existing) throw new ConflictError(`Kode pos biaya '${input.code}' sudah digunakan`);
    return this.repo.createFeeItem({
      name: input.name,
      code: input.code.toUpperCase(),
      type: input.type,
      category: input.category,
      amount: input.amount,
      academicYearId: input.academicYearId ?? null,
      gradeLevel: input.gradeLevel ?? null,
      description: input.description ?? null,
      isActive: input.isActive ?? true,
    });
  }

  async updateFeeItem(id: string, input: UpdateFeeItemInput) {
    await this.getFeeItem(id);
    if (input.code) {
      const existing = await this.repo.findFeeItemByCode(input.code);
      if (existing && existing.id !== id) throw new ConflictError(`Kode pos biaya '${input.code}' sudah digunakan`);
    }
    return this.repo.updateFeeItem(id, {
      ...input,
      code: input.code ? input.code.toUpperCase() : undefined,
    });
  }

  async deleteFeeItem(id: string) {
    await this.getFeeItem(id);
    return this.repo.deleteFeeItem(id);
  }

  async listInvoices(params: QueryInvoicesParams) {
    return this.repo.findInvoices(params);
  }

  async getInvoice(id: string) {
    const inv = await this.repo.findInvoiceById(id);
    if (!inv) throw new NotFoundError("Tagihan", id);
    return inv;
  }

  async generateBulkInvoices(input: GenerateInvoicesInput) {
    const feeItem = await this.getFeeItem(input.feeItemId);
    const students = await this.repo.findActiveStudentsForGeneration({
      classroomId: input.classroomId ?? undefined,
      gradeLevel: input.gradeLevel ?? (feeItem.gradeLevel ?? undefined),
    });
    if (!students.length) throw new ValidationError("Tidak ada siswa aktif yang memenuhi kriteria");

    const currentCount = await this.repo.countInvoicesForYear(input.year);
    const toInsert = [];
    let idx = 0;

    for (const s of students) {
      const exists = await this.repo.findExistingInvoice(s.studentId, feeItem.id, input.year, input.month ?? null);
      if (!exists && s.classroomId) {
        idx++;
        const invNum = `INV/${input.year}/${String(currentCount + idx).padStart(5, "0")}`;
        toInsert.push({
          invoiceNumber: invNum,
          studentId: s.studentId,
          feeItemId: feeItem.id,
          classroomId: s.classroomId,
          month: input.month ?? null,
          year: input.year,
          amount: feeItem.amount,
          paidAmount: 0,
          remainingAmount: feeItem.amount,
          status: "unpaid" as const,
          dueDate: input.dueDate ?? null,
          notes: null,
        });
      }
    }

    const created = await this.repo.createInvoicesBulk(toInsert);
    return { totalEligible: students.length, generated: created, skipped: students.length - created };
  }

  async searchStudents(query: string) {
    if (!query || query.trim().length < 2) return [];
    return this.repo.searchActiveStudents(query.trim());
  }

  async getStudentBillingProfile(studentId: string) {
    const student = await this.repo.findStudentWithClass(studentId);
    if (!student) throw new NotFoundError("Siswa", studentId);
    const unpaidInvoices = await this.repo.findUnpaidInvoicesByStudent(studentId);
    const history = await this.repo.findTransactionsByStudentId(studentId);
    const dispensations = await this.repo.findDispensations(studentId);
    const totalArrears = unpaidInvoices.reduce((sum, item) => sum + item.invoice.remainingAmount, 0);

    return { student, unpaidInvoices, history, dispensations, totalArrears };
  }

  async processPayment(cashierId: string, input: ProcessPaymentInput) {
    const student = await this.repo.findStudentWithClass(input.studentId);
    if (!student) throw new NotFoundError("Siswa", input.studentId);
    if (!input.items.length) throw new ValidationError("Pilih minimal 1 item tagihan yang akan dibayar");

    const totalBill = input.items.reduce((acc: number, curr: { amount: number }) => acc + curr.amount, 0);
    if (input.paymentMethod === "tunai" && input.receivedAmount < totalBill) {
      throw new ValidationError(`Nominal tunai (Rp ${input.receivedAmount.toLocaleString()}) kurang dari total (Rp ${totalBill.toLocaleString()})`);
    }

    const changeAmount = input.paymentMethod === "tunai" ? input.receivedAmount - totalBill : 0;
    const now = new Date();
    const count = await this.repo.countTransactionsByPeriod(now.getFullYear(), now.getMonth() + 1);
    const receiptNum = `KW/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(count + 1).padStart(4, "0")}`;

    return getDb().transaction(async (tx) => {
      for (const item of input.items) {
        const inv = await this.repo.findInvoiceById(item.invoiceId);
        if (!inv) throw new NotFoundError("Tagihan", item.invoiceId);
        if (inv.status === "paid") throw new ValidationError(`Tagihan ${inv.invoiceNumber} sudah lunas`);
        if (item.amount > inv.remainingAmount) {
          throw new ValidationError(`Nominal bayar Rp ${item.amount} melebihi sisa tagihan Rp ${inv.remainingAmount}`);
        }
        const newStatus = inv.remainingAmount - item.amount === 0 ? "paid" : "partial";
        await this.repo.updateInvoicePayment(inv.id, item.amount, newStatus, tx);
      }

      const { transaction } = await this.repo.createTransaction(
        {
          receiptNumber: receiptNum,
          studentId: input.studentId,
          cashierId,
          totalAmount: totalBill,
          receivedAmount: input.receivedAmount,
          changeAmount,
          paymentMethod: input.paymentMethod,
          paymentDate: now,
          status: "success",
          notes: input.notes ?? null,
        },
        input.items,
        tx
      );

      return this.repo.findTransactionById(transaction.id);
    });
  }

  async voidPayment(id: string, cashierId: string, input: VoidPaymentInput) {
    const trx = await this.repo.findTransactionById(id);
    if (!trx) throw new NotFoundError("Transaksi", id);
    if (trx.status === "void") throw new ValidationError("Transaksi sudah dibatalkan sebelumnya");

    return getDb().transaction(async (tx) => {
      const items = await this.repo.findTransactionItems(id);
      for (const item of items) {
        const inv = await this.repo.findInvoiceById(item.invoiceId);
        if (inv) {
          const newPaid = inv.paidAmount - item.amount;
          const newStatus = newPaid <= 0 ? "unpaid" : "partial";
          await this.repo.updateInvoicePayment(inv.id, -item.amount, newStatus, tx);
        }
      }
      await this.repo.voidTransaction(id, input.reason, cashierId, tx);
      return this.repo.findTransactionById(id);
    });
  }

  async getReceiptData(transactionId: string) {
    const trx = await this.repo.findTransactionById(transactionId);
    if (!trx) throw new NotFoundError("Transaksi", transactionId);
    return trx;
  }

  async generateReceiptPdf(transactionId: string): Promise<Buffer> {
    const trx = await this.getReceiptData(transactionId);
    const inst = await this.repo.findInstitution();
    return generatePaymentReceiptPdf({
      transaction: trx as any,
      student: {
        fullName: trx.studentName,
        nis: trx.studentNis,
        nisn: trx.studentNisn,
        classroomName: trx.classroomName,
      },
      cashierName: trx.cashierName,
      items: trx.items.map((it) => ({
        feeName: it.feeName,
        invoiceNumber: it.invoiceNumber,
        month: it.month,
        year: it.year,
        amount: it.amount,
      })),
      institution: {
        name: inst.name,
        nsm: inst.nsm,
        npsn: inst.npsn,
        address: inst.address,
      },
    });
  }

  async listDispensations(studentId?: string) {
    return this.repo.findDispensations(studentId);
  }

  async createDispensation(studentId: string, input: CreateDispensationInput) {
    const student = await this.repo.findStudentWithClass(studentId);
    if (!student) throw new NotFoundError("Siswa", studentId);
    return this.repo.createDispensation({
      studentId,
      reason: input.reason,
      notes: input.notes ?? null,
      status: "pending",
    });
  }

  async updateDispensationStatus(id: string, approverId: string, input: UpdateDispensationStatusInput) {
    const disp = await this.repo.findDispensationById(id);
    if (!disp) throw new NotFoundError("Dispensasi", id);
    return this.repo.updateDispensation(id, {
      status: input.status,
      notes: input.notes,
      approvedBy: approverId,
      approvedAt: new Date(),
    });
  }

  async getCashflowReport(query: CashflowReportQuery) {
    return this.repo.getCashflowSummary(query.startDate, query.endDate, query.paymentMethod);
  }

  async getArrearsReport(query: ArrearsReportQuery) {
    return this.repo.getArrearsSummary(query.classroomId);
  }
}

export const financeService = new FinanceService();
