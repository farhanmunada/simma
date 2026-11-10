import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { TeachersService, teachersService } from "./teachers.service.js";
import {
  CreateTeacherFullSchema,
  UpdateTeacherFullSchema,
  CreateTeacherEducationSchema,
  CreateTeacherRankSchema,
  CreateTeacherDocumentSchema,
  UpsertTeacherWorkloadSchema,
  TeacherQuerySchema,
} from "./teachers.schema.js";

function parseData<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class TeachersController {
  constructor(private readonly service: TeachersService = teachersService) {}

  getTeachers = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(TeacherQuerySchema, req.query);
    const result = await this.service.getTeachers(query);
    return reply.status(200).send(result);
  };

  getStats = async (_req: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.getStats();
    return reply.status(200).send({ data });
  };

  getEmisExport = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(TeacherQuerySchema, req.query);
    const data = await this.service.getEmisExport(query);
    return reply.status(200).send({ data });
  };

  getWorkloads = async (req: FastifyRequest, reply: FastifyReply) => {
    const { academicYearId, semesterId } = req.query as { academicYearId?: string; semesterId?: string };
    const data = await this.service.getWorkloadRecap(academicYearId, semesterId);
    return reply.status(200).send({ data });
  };

  getTeacherById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const data = await this.service.getTeacherById(id);
    return reply.status(200).send({ data });
  };

  createTeacher = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateTeacherFullSchema, req.body);
    const data = await this.service.createTeacher(input);
    return reply.status(201).send({ data });
  };

  updateTeacher = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const input = parseData(UpdateTeacherFullSchema, req.body);
    const data = await this.service.updateTeacher(id, input);
    return reply.status(200).send({ data });
  };

  deleteTeacher = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    await this.service.deleteTeacher(id);
    return reply.status(204).send();
  };

  addEducation = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const input = parseData(CreateTeacherEducationSchema, req.body);
    const data = await this.service.addEducation(id, input);
    return reply.status(201).send({ data });
  };

  deleteEducation = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id, eduId } = req.params as { id: string; eduId: string };
    await this.service.removeEducation(id, eduId);
    return reply.status(204).send();
  };

  addRank = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const input = parseData(CreateTeacherRankSchema, req.body);
    const data = await this.service.addRank(id, input);
    return reply.status(201).send({ data });
  };

  deleteRank = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id, rankId } = req.params as { id: string; rankId: string };
    await this.service.removeRank(id, rankId);
    return reply.status(204).send();
  };

  addDocument = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const input = parseData(CreateTeacherDocumentSchema, req.body);
    const data = await this.service.addDocument(id, input);
    return reply.status(201).send({ data });
  };

  deleteDocument = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id, docId } = req.params as { id: string; docId: string };
    await this.service.removeDocument(id, docId);
    return reply.status(204).send();
  };

  upsertWorkload = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(UpsertTeacherWorkloadSchema, req.body);
    const data = await this.service.upsertWorkload(input);
    return reply.status(200).send({ data });
  };
}

export const teachersController = new TeachersController();
