import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { TahfidzService, tahfidzService } from "./tahfidz.service.js";
import {
  CreateTahfidzRecordSchema,
  UpdateTahfidzRecordSchema,
  TahfidzQuerySchema,
  CreateTasmiExamSchema,
  UpdateTasmiExamSchema,
  TasmiQuerySchema,
  IdParamSchema,
  StudentIdParamSchema,
} from "./tahfidz.schema.js";

function parseData<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class TahfidzController {
  constructor(private readonly service: TahfidzService = tahfidzService) {}

  // --- Tahfidz Records ---

  getRecords = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(TahfidzQuerySchema, req.query);
    const result = await this.service.getRecords(query);
    return reply.status(200).send(result);
  };

  getRecordById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getRecordById(id);
    return reply.status(200).send({ data });
  };

  createRecord = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateTahfidzRecordSchema, req.body);
    const teacherId = req.user?.teacherId;
    const data = await this.service.createRecord(input, teacherId);
    return reply.status(201).send({ data });
  };

  updateRecord = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateTahfidzRecordSchema, req.body);
    const data = await this.service.updateRecord(id, input);
    return reply.status(200).send({ data });
  };

  deleteRecord = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteRecord(id);
    return reply.status(204).send();
  };

  // --- Student History & Progress ---

  getStudentHistory = async (req: FastifyRequest, reply: FastifyReply) => {
    const { studentId } = parseData(StudentIdParamSchema, req.params);
    const data = await this.service.getStudentHistory(studentId);
    return reply.status(200).send({ data });
  };

  getStudentProgress = async (req: FastifyRequest, reply: FastifyReply) => {
    const { studentId } = parseData(StudentIdParamSchema, req.params);
    const data = await this.service.getStudentProgress(studentId);
    return reply.status(200).send({ data });
  };

  // --- Tasmi' Exams ---

  getTasmiExams = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(TasmiQuerySchema, req.query);
    const result = await this.service.getTasmiExams(query);
    return reply.status(200).send(result);
  };

  getTasmiExamById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getTasmiExamById(id);
    return reply.status(200).send({ data });
  };

  createTasmiExam = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateTasmiExamSchema, req.body);
    const examinerId = req.user?.teacherId;
    const data = await this.service.createTasmiExam(input, examinerId);
    return reply.status(201).send({ data });
  };

  updateTasmiExam = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateTasmiExamSchema, req.body);
    const data = await this.service.updateTasmiExam(id, input);
    return reply.status(200).send({ data });
  };

  deleteTasmiExam = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteTasmiExam(id);
    return reply.status(204).send();
  };
}

export const tahfidzController = new TahfidzController();
