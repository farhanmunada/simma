import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { TransfersService, transfersService } from "./transfers.service.js";
import {
  createTransferInSchema,
  createTransferOutSchema,
  updateClearanceItemSchema,
  approveTransferOutSchema,
  batchGraduationSchema,
  filterTransferSchema,
  filterGraduationSchema,
  TransferIdParamSchema,
  ClearanceDimensionParamSchema,
  VerifyCodeParamSchema,
} from "./transfers.schema.js";

function parseData<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class TransfersController {
  constructor(private readonly service: TransfersService = transfersService) {}

  getTransfers = async (request: FastifyRequest, reply: FastifyReply) => {
    const filter = parseData(filterTransferSchema, request.query);
    const result = await this.service.listTransfers(filter);
    return reply.status(200).send({ data: result.items, meta: { total: result.total, page: filter.page, limit: filter.limit } });
  };

  getTransferById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(TransferIdParamSchema, request.params);
    const data = await this.service.getTransfer(id);
    return reply.status(200).send({ data });
  };

  createTransferIn = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(createTransferInSchema, request.body);
    const userId = request.user?.sub ?? "system";
    const data = await this.service.createTransferIn(body, userId);
    return reply.status(201).send({ data, message: "Mutasi masuk berhasil dicatat" });
  };

  createTransferOut = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(createTransferOutSchema, request.body);
    const userId = request.user?.sub ?? "system";
    const data = await this.service.createTransferOut(body, userId);
    return reply.status(201).send({ data, message: "Pengajuan mutasi keluar berhasil dibuat" });
  };

  updateClearance = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id, dimension } = parseData(ClearanceDimensionParamSchema, request.params);
    const body = parseData(updateClearanceItemSchema, request.body);
    const userId = request.user?.sub ?? "system";
    const data = await this.service.updateClearance(id, dimension, body.cleared, userId, body.notes);
    return reply.status(200).send({ data, message: `Status clearance ${dimension} berhasil diperbarui` });
  };

  approveTransfer = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(TransferIdParamSchema, request.params);
    const body = parseData(approveTransferOutSchema, request.body);
    const userId = request.user?.sub ?? "system";
    const data = await this.service.approveTransfer(id, body.approved, userId, body.notes);
    return reply.status(200).send({
      data,
      message: body.approved ? "Mutasi keluar berhasil disetujui" : "Mutasi keluar ditolak",
    });
  };

  verifyTransfer = async (request: FastifyRequest, reply: FastifyReply) => {
    const { code } = parseData(VerifyCodeParamSchema, request.params);
    const data = await this.service.verifyTransferByCode(code);
    return reply.status(200).send({ data, message: "Surat mutasi valid" });
  };

  downloadPdf = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(TransferIdParamSchema, request.params);
    const buffer = await this.service.generatePdf(id);
    reply.header("Content-Type", "application/pdf");
    reply.header("Content-Disposition", `attachment; filename="surat-mutasi-${id}.pdf"`);
    return reply.status(200).send(buffer);
  };

  getStats = async (_request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.getStatistics();
    return reply.status(200).send({ data });
  };

  getGraduations = async (request: FastifyRequest, reply: FastifyReply) => {
    const filter = parseData(filterGraduationSchema, request.query);
    const result = await this.service.listGraduations(filter);
    return reply.status(200).send({ data: result.items, meta: { total: result.total, page: filter.page, limit: filter.limit } });
  };

  processGraduation = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(batchGraduationSchema, request.body);
    const userId = request.user?.sub ?? "system";
    const data = await this.service.processBatchGraduation(body, userId);
    return reply.status(200).send({ data, message: "Kelulusan siswa berhasil diproses" });
  };
}

export const transfersController = new TransfersController();
