import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { EmisService } from "./emis.service.js";
import {
  emisAuditQuerySchema,
  emisExportQuerySchema,
  emisBapCreateSchema,
  emisBapApprovalSchema,
  bapIdParamSchema,
} from "./emis.schema.js";

function parseData<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class EmisController {
  constructor(private service = new EmisService()) {}

  getAuditReadiness = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(emisAuditQuerySchema, req.query);
    const data = await this.service.getAuditReadiness(query);
    return reply.status(200).send({ data });
  };

  exportStudents = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(emisExportQuerySchema, req.query);
    const result = await this.service.exportStudents(query);
    if (query.format === "csv") {
      reply.header("Content-Type", "text/csv; charset=utf-8");
      reply.header("Content-Disposition", 'attachment; filename="EMIS4_Siswa.csv"');
      return reply.status(200).send(result);
    }
    return reply.status(200).send({ data: result });
  };

  exportTeachers = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(emisExportQuerySchema, req.query);
    const result = await this.service.exportTeachers(query);
    if (query.format === "csv") {
      reply.header("Content-Type", "text/csv; charset=utf-8");
      reply.header("Content-Disposition", 'attachment; filename="EMIS4_GTK.csv"');
      return reply.status(200).send(result);
    }
    return reply.status(200).send({ data: result });
  };

  exportClassrooms = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(emisExportQuerySchema, req.query);
    const result = await this.service.exportClassrooms(query);
    if (query.format === "csv") {
      reply.header("Content-Type", "text/csv; charset=utf-8");
      reply.header("Content-Disposition", 'attachment; filename="EMIS4_Rombel.csv"');
      return reply.status(200).send(result);
    }
    return reply.status(200).send({ data: result });
  };

  exportInstitution = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(emisExportQuerySchema, req.query);
    const result = await this.service.exportInstitution(query);
    if (query.format === "csv") {
      reply.header("Content-Type", "text/csv; charset=utf-8");
      reply.header("Content-Disposition", 'attachment; filename="EMIS4_Lembaga.csv"');
      return reply.status(200).send(result);
    }
    return reply.status(200).send({ data: result });
  };

  exportBundle = async (_req: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.exportBundle();
    return reply.status(200).send({ data });
  };

  listBaps = async (_req: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.listBaps();
    return reply.status(200).send({ data });
  };

  createBapDraft = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(emisBapCreateSchema, req.body);
    const operatorName = (req.user as any)?.name || (req.user as any)?.email || "Operator EMIS";
    const data = await this.service.createBapDraft(body, operatorName);
    return reply.status(201).send({ data, message: "Draf Berita Acara Pendataan (BAP) berhasil dibuat" });
  };

  approveBap = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(bapIdParamSchema, req.params);
    const body = parseData(emisBapApprovalSchema, req.body);
    const approverName = (req.user as any)?.name || "Kepala Madrasah";
    const data = await this.service.approveBap(id, body, approverName);
    return reply.status(200).send({
      data,
      message: body.approved ? "BAP EMIS berhasil disetujui" : "BAP EMIS dikembalikan ke draf",
    });
  };

  downloadBapPdf = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(bapIdParamSchema, req.params);
    const { buffer, filename } = await this.service.getBapPdf(id);
    reply.header("Content-Type", "application/pdf");
    reply.header("Content-Disposition", `attachment; filename="${filename}"`);
    return reply.status(200).send(buffer);
  };
}

export const emisController = new EmisController();
