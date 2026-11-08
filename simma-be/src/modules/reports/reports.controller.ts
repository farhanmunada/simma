import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { ReportsService, reportsService } from "./reports.service.js";
import {
  StudentSemesterParamSchema,
  ClassroomSemesterParamSchema,
  StudentIdParamSchema,
  LeggerQuerySchema,
  ReportCardQuerySchema,
  ReportNotesBodySchema,
} from "./reports.schema.js";

function parseData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class ReportsController {
  constructor(
    private readonly service: ReportsService = reportsService,
  ) {}

  getStudentReportCard = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { studentId, semesterId } = parseData(
      StudentSemesterParamSchema,
      req.params,
    );
    const query = parseData(ReportCardQuerySchema, req.query);
    const data = await this.service.getStudentReportCard(
      studentId,
      semesterId,
      query,
    );
    return reply.status(200).send({ data });
  };

  getClassroomLegger = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { classroomId, semesterId } = parseData(
      ClassroomSemesterParamSchema,
      req.params,
    );
    const query = parseData(LeggerQuerySchema, req.query);
    const data = await this.service.getClassroomLegger(
      classroomId,
      semesterId,
      query,
    );
    return reply.status(200).send({ data });
  };

  getStudentReportPdf = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { studentId, semesterId } = parseData(
      StudentSemesterParamSchema,
      req.params,
    );
    const pdfBuffer = await this.service.getStudentReportPdf(
      studentId,
      semesterId,
    );

    return reply
      .status(200)
      .header("Content-Type", "application/pdf")
      .header(
        "Content-Disposition",
        `inline; filename="rapor-${studentId}-${semesterId}.pdf"`,
      )
      .send(pdfBuffer);
  };

  saveStudentNotes = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { studentId } = parseData(StudentIdParamSchema, req.params);
    const body = parseData(ReportNotesBodySchema, req.body);
    const data = await this.service.saveStudentNotes(studentId, body);
    return reply.status(201).send({ data });
  };
}

export const reportsController = new ReportsController();
