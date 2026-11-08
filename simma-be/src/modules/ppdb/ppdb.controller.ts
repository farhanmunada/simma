import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { PpdbService } from "./ppdb.service.js";
import {
  RegisterApplicantSchema,
  UpdateApplicantStatusSchema,
  ApplicantQuerySchema,
  CheckStatusQuerySchema,
} from "@simma/shared";

const IdParamSchema = z.object({
  id: z.string().uuid("ID tidak valid"),
});

function parseData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class PpdbController {
  constructor(private readonly service: PpdbService = new PpdbService()) {}

  // Public: Register applicant
  register = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(RegisterApplicantSchema, req.body);
    const result = await this.service.registerApplicant(body);
    return reply.status(201).send({
      message: "Pendaftaran berhasil dikirim. Simpan Nomor Pendaftaran Anda.",
      data: result,
    });
  };

  // Public: Check status
  checkStatus = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(CheckStatusQuerySchema, req.query);
    const result = await this.service.checkStatus(query);
    return reply.status(200).send({
      message: "Status pendaftaran ditemukan",
      data: result,
    });
  };

  // Public: PPDB Info
  getPublicInfo = async (_req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getPublicInfo();
    return reply.status(200).send({
      data: result,
    });
  };

  // Internal: List applicants
  getApplicants = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(ApplicantQuerySchema, req.query);
    const result = await this.service.listApplicants(query);
    return reply.status(200).send(result);
  };

  // Internal: Get stats
  getStats = async (_req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getStats();
    return reply.status(200).send({
      data: result,
    });
  };

  // Internal: Get applicant by id
  getApplicantById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const result = await this.service.getApplicantById(id);
    return reply.status(200).send({
      data: result,
    });
  };

  // Internal: Update status (verify, accept, reject)
  updateStatus = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const body = parseData(UpdateApplicantStatusSchema, req.body);
    const result = await this.service.updateStatus(id, body);
    return reply.status(200).send({
      message: `Status pendaftaran berhasil diubah menjadi '${body.status}'`,
      data: result,
    });
  };

  // Internal: Enroll to Buku Induk Siswa
  enroll = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const result = await this.service.enrollToBukuInduk(id);
    return reply.status(201).send({
      message:
        "Calon siswa berhasil didaftarkan ke Buku Induk Siswa dengan status 'Aktif Tanpa Rombel'.",
      data: result,
    });
  };

  // Internal: Delete applicant
  delete = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteApplicant(id);
    return reply.status(200).send({
      message: "Data pendaftar berhasil dihapus",
    });
  };
}
