import type { FastifyRequest, FastifyReply } from "fastify";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { z } from "zod";
import { ValidationError, NotFoundError } from "../../core/errors/index.js";
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

  // --- Upload & Serve Image ---
  uploadImage = async (request: FastifyRequest, reply: FastifyReply) => {
    const part = await request.file();
    if (!part) {
      throw new ValidationError("Berkas gambar tidak ditemukan");
    }

    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedMimes.includes(part.mimetype)) {
      throw new ValidationError(
        `Format gambar '${part.mimetype}' tidak didukung. Harap unggah format JPG, PNG, atau WEBP.`
      );
    }

    const uploadDir = path.resolve(process.cwd(), "storage", "uploads", "facilities");
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(part.filename).toLowerCase() || ".jpg";
    const fileUUID = crypto.randomUUID();
    const storedFileName = `asset_${fileUUID}${ext}`;
    const absolutePath = path.join(uploadDir, storedFileName);

    const buffer = await part.toBuffer();
    await fs.writeFile(absolutePath, buffer);

    const imageUrl = `/api/v1/facilities/images/${storedFileName}`;
    return reply.status(201).send({
      message: "Gambar berhasil diunggah",
      data: {
        url: imageUrl,
        fileName: storedFileName,
      },
    });
  };

  serveImage = async (request: FastifyRequest, reply: FastifyReply) => {
    const { filename } = request.params as { filename: string };
    const safeFilename = path.basename(filename);
    const uploadDir = path.resolve(process.cwd(), "storage", "uploads", "facilities");
    const filePath = path.join(uploadDir, safeFilename);

    try {
      await fs.access(filePath);
    } catch {
      throw new NotFoundError("Berkas foto tidak ditemukan di server");
    }

    const ext = path.extname(safeFilename).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
    };
    reply.header("Content-Type", mimeMap[ext] || "application/octet-stream");
    reply.header("Cache-Control", "public, max-age=86400");
    const stream = fsSync.createReadStream(filePath);
    return reply.send(stream);
  };
}

export const facilitiesController = new FacilitiesController();
