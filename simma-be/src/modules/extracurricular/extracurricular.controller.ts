import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import {
  ExtracurricularService,
  extracurricularService,
} from "./extracurricular.service.js";
import {
  CreateExtracurricularSchema,
  UpdateExtracurricularSchema,
  CreateExtracurricularMemberSchema,
  UpdateExtracurricularMemberSchema,
  UpsertExtracurricularGradeSchema,
  BatchUpsertExtracurricularGradesSchema,
  ExtracurricularQuerySchema,
  ExtracurricularMemberQuerySchema,
  ExtracurricularGradeQuerySchema,
  ExtracurricularIdParamSchema,
  StudentIdParamExtracurricularSchema,
} from "./extracurricular.schema.js";

function parseData<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class ExtracurricularController {
  constructor(
    private readonly service: ExtracurricularService = extracurricularService
  ) {}

  // --- Master Extracurricular ---

  list = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(ExtracurricularQuerySchema, request.query);
    const data = await this.service.listExtracurriculars(query);
    return reply.status(200).send({ data });
  };

  getById = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ExtracurricularIdParamSchema, request.params);
    const data = await this.service.getExtracurricularById(id);
    return reply.status(200).send({ data });
  };

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateExtracurricularSchema, request.body);
    const data = await this.service.createExtracurricular(body);
    return reply.status(201).send({ data, message: "Ekstrakurikuler berhasil ditambahkan" });
  };

  update = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ExtracurricularIdParamSchema, request.params);
    const body = parseData(UpdateExtracurricularSchema, request.body);
    const data = await this.service.updateExtracurricular(id, body);
    return reply.status(200).send({ data, message: "Ekstrakurikuler berhasil diperbarui" });
  };

  delete = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ExtracurricularIdParamSchema, request.params);
    await this.service.deleteExtracurricular(id);
    return reply.status(200).send({ message: "Ekstrakurikuler berhasil dihapus" });
  };

  // --- Members ---

  listMembers = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(ExtracurricularMemberQuerySchema, request.query);
    const data = await this.service.listMembers(query);
    return reply.status(200).send({ data });
  };

  registerMember = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateExtracurricularMemberSchema, request.body);
    const data = await this.service.registerMember(body);
    return reply.status(201).send({ data, message: "Pendaftaran anggota berhasil" });
  };

  updateMember = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ExtracurricularIdParamSchema, request.params);
    const body = parseData(UpdateExtracurricularMemberSchema, request.body);
    const data = await this.service.updateMember(id, body);
    return reply.status(200).send({ data, message: "Data anggota berhasil diperbarui" });
  };

  deleteMember = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(ExtracurricularIdParamSchema, request.params);
    await this.service.deleteMember(id);
    return reply.status(200).send({ message: "Anggota berhasil dihapus dari ekstrakurikuler" });
  };

  // --- Grades & RDM ---

  listGrades = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(ExtracurricularGradeQuerySchema, request.query);
    const data = await this.service.listGrades(query);
    return reply.status(200).send({ data });
  };

  upsertGrade = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(UpsertExtracurricularGradeSchema, request.body);
    const data = await this.service.upsertGrade(body);
    return reply.status(200).send({ data, message: "Nilai ekstrakurikuler berhasil disimpan" });
  };

  batchUpsertGrades = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(BatchUpsertExtracurricularGradesSchema, request.body);
    const data = await this.service.batchUpsertGrades(body);
    return reply.status(200).send({ data, message: `${data.length} nilai ekstrakurikuler berhasil disimpan` });
  };

  getStudentGradesForRdm = async (request: FastifyRequest, reply: FastifyReply) => {
    const { studentId } = parseData(StudentIdParamExtracurricularSchema, request.params);
    const query = request.query as { academicYearId?: string; semester?: string };
    const data = await this.service.getStudentRdmGrades(studentId, query.academicYearId, query.semester);
    return reply.status(200).send({ data });
  };

  // --- Stats ---

  getStats = async (_request: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.getStats();
    return reply.status(200).send({ data });
  };
}

export const extracurricularController = new ExtracurricularController();
