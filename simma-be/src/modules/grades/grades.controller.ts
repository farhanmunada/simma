import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { GradesService, gradesService } from "./grades.service.js";
import {
  CreateAssessmentSchema,
  UpdateAssessmentSchema,
  AssessmentQuerySchema,
  CreateStudentGradeSchema,
  UpdateStudentGradeSchema,
  BatchUpsertGradesSchema,
  StudentGradeQuerySchema,
  CreateSemesterGradeSchema,
  UpdateSemesterGradeSchema,
  CalculateSemesterGradeSchema,
  SemesterGradeQuerySchema,
  IdParamSchema,
  AssessmentIdParamSchema,
} from "./grades.schema.js";

function parseData<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class GradesController {
  constructor(private readonly service: GradesService = gradesService) {}

  // --- Assessments ---

  getAssessments = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(AssessmentQuerySchema, req.query);
    const result = await this.service.getAssessments(query);
    return reply.status(200).send(result);
  };

  getAssessmentById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getAssessmentById(id);
    return reply.status(200).send({ data });
  };

  createAssessment = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateAssessmentSchema, req.body);
    const teacherId = req.user?.teacherId;
    const data = await this.service.createAssessment(input, teacherId);
    return reply.status(201).send({ data });
  };

  updateAssessment = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateAssessmentSchema, req.body);
    const data = await this.service.updateAssessment(id, input);
    return reply.status(200).send({ data });
  };

  deleteAssessment = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteAssessment(id);
    return reply.status(204).send();
  };

  // --- Student Grades ---

  getStudentGrades = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(StudentGradeQuerySchema, req.query);
    const result = await this.service.getStudentGrades(query);
    return reply.status(200).send(result);
  };

  getStudentGradeById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getStudentGradeById(id);
    return reply.status(200).send({ data });
  };

  getGradesByAssessmentId = async (req: FastifyRequest, reply: FastifyReply) => {
    const { assessmentId } = parseData(AssessmentIdParamSchema, req.params);
    const data = await this.service.getGradesByAssessmentId(assessmentId);
    return reply.status(200).send({ data });
  };

  createStudentGrade = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateStudentGradeSchema, req.body);
    const data = await this.service.createStudentGrade(input);
    return reply.status(201).send({ data });
  };

  batchUpsertGrades = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(BatchUpsertGradesSchema, req.body);
    const data = await this.service.batchUpsertGrades(input);
    return reply.status(200).send({ data });
  };

  updateStudentGrade = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateStudentGradeSchema, req.body);
    const data = await this.service.updateStudentGrade(id, input);
    return reply.status(200).send({ data });
  };

  deleteStudentGrade = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteStudentGrade(id);
    return reply.status(204).send();
  };

  // --- Semester Grades ---

  getSemesterGrades = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(SemesterGradeQuerySchema, req.query);
    const result = await this.service.getSemesterGrades(query);
    return reply.status(200).send(result);
  };

  getSemesterGradeById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getSemesterGradeById(id);
    return reply.status(200).send({ data });
  };

  createOrUpsertSemesterGrade = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const input = parseData(CreateSemesterGradeSchema, req.body);
    const data = await this.service.createOrUpsertSemesterGrade(input);
    return reply.status(201).send({ data });
  };

  updateSemesterGrade = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateSemesterGradeSchema, req.body);
    const data = await this.service.updateSemesterGrade(id, input);
    return reply.status(200).send({ data });
  };

  deleteSemesterGrade = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteSemesterGrade(id);
    return reply.status(204).send();
  };

  calculateSemesterGrades = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const input = parseData(CalculateSemesterGradeSchema, req.body);
    const result = await this.service.calculateSemesterGrades(input);
    return reply.status(200).send({ data: result });
  };
}

export const gradesController = new GradesController();
