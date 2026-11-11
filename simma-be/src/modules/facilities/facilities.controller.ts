import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { FacilitiesService } from "./facilities.service.js";
import {
  CreateFacilityAssetSchema,
  UpdateFacilityAssetSchema,
  QueryFacilityAssetsSchema,
  CreateFacilityLoanSchema,
  ReturnFacilityLoanSchema,
  CreateFacilityMaintenanceTicketSchema,
  UpdateFacilityMaintenanceTicketSchema,
  FacilityIdParamSchema,
  FacilityTokenParamSchema,
  QueryLoansSchema,
  QueryMaintenanceTicketsSchema,
} from "./facilities.schema.js";

function parseData<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class FacilitiesController {
  constructor(private readonly service = new FacilitiesService()) {}

  // --- Assets ---
  getAssets = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(QueryFacilityAssetsSchema, request.query);
    const data = await this.service.getAssets(query);
    return reply.status(200).send({ data });
  };

  getAssetById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(FacilityIdParamSchema, request.params);
    const data = await this.service.getAssetById(id);
    return reply.status(200).send({ data });
  };

  getAssetByQrToken = async (request: FastifyRequest, reply: FastifyReply) => {
    const { token } = parseData(FacilityTokenParamSchema, request.params);
    const data = await this.service.getAssetByQrToken(token);
    return reply.status(200).send({ data });
  };

  createAsset = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateFacilityAssetSchema, request.body);
    const data = await this.service.createAsset(body);
    return reply
      .status(201)
      .send({ data, message: "Aset sarana prasarana berhasil didaftarkan" });
  };

  updateAsset = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(FacilityIdParamSchema, request.params);
    const body = parseData(UpdateFacilityAssetSchema, request.body);
    const data = await this.service.updateAsset(id, body);
    return reply
      .status(200)
      .send({ data, message: "Informasi aset berhasil diperbarui" });
  };

  deleteAsset = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(FacilityIdParamSchema, request.params);
    await this.service.deleteAsset(id);
    return reply
      .status(200)
      .send({ message: "Aset sarana prasarana berhasil dihapus" });
  };

  // --- Loans ---
  getLoans = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(QueryLoansSchema, request.query);
    const data = await this.service.getLoans(query);
    return reply.status(200).send({ data });
  };

  getLoanById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(FacilityIdParamSchema, request.params);
    const data = await this.service.getLoanById(id);
    return reply.status(200).send({ data });
  };

  createLoan = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateFacilityLoanSchema, request.body);
    const data = await this.service.createLoan(body);
    return reply
      .status(201)
      .send({ data, message: "Peminjaman fasilitas berhasil dicatat" });
  };

  returnLoan = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(FacilityIdParamSchema, request.params);
    const body = parseData(ReturnFacilityLoanSchema, request.body || {});
    const data = await this.service.returnLoan(id, body);
    return reply
      .status(200)
      .send({ data, message: "Pengembalian aset fasilitas berhasil diverifikasi" });
  };

  // --- Maintenance Tickets ---
  getTickets = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(QueryMaintenanceTicketsSchema, request.query);
    const data = await this.service.getTickets(query);
    return reply.status(200).send({ data });
  };

  getTicketById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(FacilityIdParamSchema, request.params);
    const data = await this.service.getTicketById(id);
    return reply.status(200).send({ data });
  };

  createTicket = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateFacilityMaintenanceTicketSchema, request.body);
    const user = (request as any).user;
    const data = await this.service.createTicket(body, user?.id);
    return reply
      .status(201)
      .send({ data, message: "Laporan kerusakan aset berhasil dibuat" });
  };

  updateTicket = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(FacilityIdParamSchema, request.params);
    const body = parseData(UpdateFacilityMaintenanceTicketSchema, request.body);
    const data = await this.service.updateTicket(id, body);
    return reply
      .status(200)
      .send({ data, message: "Status tiket perbaikan berhasil diperbarui" });
  };

  // --- Stats ---
  getStats = async (_request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.getStats();
    return reply.status(200).send({ data });
  };
}

export const facilitiesController = new FacilitiesController();
