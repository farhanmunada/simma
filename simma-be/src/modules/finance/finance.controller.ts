import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { FinanceService, financeService } from "./finance.service.js";
import {
  CreateFeeItemSchema,
  UpdateFeeItemSchema,
  QueryFeeItemSchema,
  GenerateInvoicesSchema,
  QueryInvoicesSchema,
  ProcessPaymentSchema,
  VoidPaymentSchema,
  CreateDispensationSchema,
  UpdateDispensationStatusSchema,
  CashierSearchQuerySchema,
  CashflowReportQuerySchema,
  ArrearsReportQuerySchema,
  IdParamSchema,
  StudentIdParamSchema,
} from "./finance.schema.js";

function parseData<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class FinanceController {
  constructor(private readonly service: FinanceService = financeService) {}

  // Fee Items
  getFeeItems = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(QueryFeeItemSchema, req.query);
    const data = await this.service.listFeeItems(query);
    return reply.status(200).send({ data });
  };

  getFeeItemById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getFeeItem(id);
    return reply.status(200).send({ data });
  };

  createFeeItem = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateFeeItemSchema, req.body);
    const data = await this.service.createFeeItem(input);
    return reply.status(201).send({ data });
  };

  updateFeeItem = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateFeeItemSchema, req.body);
    const data = await this.service.updateFeeItem(id, input);
    return reply.status(200).send({ data });
  };

  deleteFeeItem = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteFeeItem(id);
    return reply.status(200).send({ message: "Pos biaya berhasil dihapus" });
  };

  // Invoices
  getInvoices = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(QueryInvoicesSchema, req.query);
    const data = await this.service.listInvoices(query);
    return reply.status(200).send({ data });
  };

  getInvoiceById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getInvoice(id);
    return reply.status(200).send({ data });
  };

  generateInvoices = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(GenerateInvoicesSchema, req.body);
    const data = await this.service.generateBulkInvoices(input);
    return reply.status(201).send({ data });
  };

  // Cashier POS
  searchCashierStudents = async (req: FastifyRequest, reply: FastifyReply) => {
    const { q } = parseData(CashierSearchQuerySchema, req.query);
    const data = await this.service.searchStudents(q);
    return reply.status(200).send({ data });
  };

  getStudentBillingProfile = async (req: FastifyRequest, reply: FastifyReply) => {
    const { studentId } = parseData(StudentIdParamSchema, req.params);
    const data = await this.service.getStudentBillingProfile(studentId);
    return reply.status(200).send({ data });
  };

  processPayment = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(ProcessPaymentSchema, req.body);
    const user = req.user as { id?: string } | undefined;
    const cashierId = user?.id ?? "00000000-0000-0000-0000-000000000001";
    const data = await this.service.processPayment(cashierId, input);
    return reply.status(201).send({ data });
  };

  voidPayment = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(VoidPaymentSchema, req.body);
    const user = req.user as { id?: string } | undefined;
    const cashierId = user?.id ?? "00000000-0000-0000-0000-000000000001";
    const data = await this.service.voidPayment(id, cashierId, input);
    return reply.status(200).send({ data });
  };

  getTransactionReceipt = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getReceiptData(id);
    return reply.status(200).send({ data });
  };

  downloadReceiptPdf = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const pdfBuffer = await this.service.generateReceiptPdf(id);
    reply.header("Content-Type", "application/pdf");
    reply.header("Content-Disposition", `attachment; filename="kwitansi-${id}.pdf"`);
    return reply.send(pdfBuffer);
  };

  // Dispensations
  getDispensations = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as { studentId?: string };
    const data = await this.service.listDispensations(query.studentId);
    return reply.status(200).send({ data });
  };

  createDispensation = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateDispensationSchema, req.body);
    const data = await this.service.createDispensation(input.studentId, input);
    return reply.status(201).send({ data });
  };

  updateDispensationStatus = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateDispensationStatusSchema, req.body);
    const user = req.user as { id?: string } | undefined;
    const approverId = user?.id ?? "00000000-0000-0000-0000-000000000001";
    const data = await this.service.updateDispensationStatus(id, approverId, input);
    return reply.status(200).send({ data });
  };

  // Reports
  getCashflowReport = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(CashflowReportQuerySchema, req.query);
    const data = await this.service.getCashflowReport(query);
    return reply.status(200).send({ data });
  };

  getArrearsReport = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(ArrearsReportQuerySchema, req.query);
    const data = await this.service.getArrearsReport(query);
    return reply.status(200).send({ data });
  };
}

export const financeController = new FinanceController();
