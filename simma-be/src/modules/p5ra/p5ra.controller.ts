import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { P5raService, p5raService } from "./p5ra.service.js";
import { generateP5raReportPdf } from "./p5ra.pdf.js";
import {
  ProjectIdParamSchema,
  TargetIdParamSchema,
  StudentReportParamSchema,
  P5raProjectQuerySchema,
  P5raAssessmentQuerySchema,
  CreateP5raProjectSchema,
  UpdateP5raProjectSchema,
  CreateP5raTargetSchema,
  UpdateP5raTargetSchema,
  BatchP5raAssessmentSchema,
  P5raStudentNotesSchema,
} from "./p5ra.schema.js";

function parseData<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class P5raController {
  constructor(private readonly service: P5raService = p5raService) {}

  listProjects = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(P5raProjectQuerySchema, req.query);
    const data = await this.service.listProjects(query);
    return reply.status(200).send({ data });
  };

  getProject = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = parseData(ProjectIdParamSchema, req.params);
    const data = await this.service.getProject(projectId);
    return reply.status(200).send({ data });
  };

  createProject = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateP5raProjectSchema, req.body);
    const data = await this.service.createProject(body);
    return reply.status(201).send({ data });
  };

  updateProject = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = parseData(ProjectIdParamSchema, req.params);
    const body = parseData(UpdateP5raProjectSchema, req.body);
    const data = await this.service.updateProject(projectId, body);
    return reply.status(200).send({ data });
  };

  deleteProject = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = parseData(ProjectIdParamSchema, req.params);
    await this.service.deleteProject(projectId);
    return reply.status(200).send({ message: "Projek berhasil dihapus", success: true });
  };

  listTargets = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = parseData(ProjectIdParamSchema, req.params);
    const data = await this.service.listTargets(projectId);
    return reply.status(200).send({ data });
  };

  createTarget = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = parseData(ProjectIdParamSchema, req.params);
    const body = parseData(CreateP5raTargetSchema, req.body);
    const data = await this.service.addTarget(projectId, body);
    return reply.status(201).send({ data });
  };

  updateTarget = async (req: FastifyRequest, reply: FastifyReply) => {
    const { targetId } = parseData(TargetIdParamSchema, req.params);
    const body = parseData(UpdateP5raTargetSchema, req.body);
    const data = await this.service.updateTarget(targetId, body);
    return reply.status(200).send({ data });
  };

  deleteTarget = async (req: FastifyRequest, reply: FastifyReply) => {
    const { targetId } = parseData(TargetIdParamSchema, req.params);
    await this.service.deleteTarget(targetId);
    return reply.status(200).send({ message: "Target capaian berhasil dihapus", success: true });
  };

  getAssessments = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = parseData(ProjectIdParamSchema, req.params);
    const query = parseData(P5raAssessmentQuerySchema, req.query);
    const data = await this.service.getAssessments(projectId, query.classroomId);
    return reply.status(200).send({ data });
  };

  saveBatchAssessments = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = parseData(ProjectIdParamSchema, req.params);
    const body = parseData(BatchP5raAssessmentSchema, req.body);
    const userId = (req as any).user?.id;
    const data = await this.service.saveBatchAssessments(projectId, body.items, userId);
    return reply.status(200).send({ data, success: true });
  };

  getStudentNotes = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId, studentId } = parseData(StudentReportParamSchema, req.params);
    const data = await this.service.getStudentNotes(projectId, studentId);
    return reply.status(200).send({ data });
  };

  saveStudentNotes = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId, studentId } = parseData(StudentReportParamSchema, req.params);
    const body = parseData(P5raStudentNotesSchema, req.body);
    const userId = (req as any).user?.id;
    const data = await this.service.saveStudentNotes(projectId, studentId, body.processNotes, userId);
    return reply.status(200).send({ data, success: true });
  };

  generateProcessNotes = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId, studentId } = parseData(StudentReportParamSchema, req.params);
    const generatedNotes = await this.service.generateProcessNotes(projectId, studentId);
    return reply.status(200).send({ data: { processNotes: generatedNotes } });
  };

  getStudentReport = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId, studentId } = parseData(StudentReportParamSchema, req.params);
    const data = await this.service.getStudentReport(projectId, studentId);
    return reply.status(200).send({ data });
  };

  getStudentReportPdf = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId, studentId } = parseData(StudentReportParamSchema, req.params);
    const reportData = await this.service.getStudentReport(projectId, studentId);
    const pdfBuffer = generateP5raReportPdf(reportData);

    const filename = `Rapor-P5RA-${reportData.student.nisn ?? reportData.student.id}.pdf`;
    return reply
      .header("Content-Type", "application/pdf")
      .header("Content-Disposition", `inline; filename="${filename}"`)
      .send(pdfBuffer);
  };

  getProjectRecap = async (req: FastifyRequest, reply: FastifyReply) => {
    const { projectId } = parseData(ProjectIdParamSchema, req.params);
    const query = parseData(P5raAssessmentQuerySchema, req.query);
    const data = await this.service.getProjectRecap(projectId, query.classroomId);
    return reply.status(200).send({ data });
  };
}

export const p5raController = new P5raController();
