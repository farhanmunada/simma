import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { MutabaahService, mutabaahService } from "./mutabaah.service.js";
import {
  CreateMutabaahActivitySchema,
  UpdateMutabaahActivitySchema,
  BatchUpsertMutabaahEntriesSchema,
  QueryMutabaahDailyChecklistSchema,
  CreateMutabaahUzurRecordSchema,
  QueryComplianceSchema,
  IdParamSchema,
  StudentIdParamSchema,
  MonthlyReportQuerySchema,
} from "./mutabaah.schema.js";

function parseData<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class MutabaahController {
  constructor(private readonly service: MutabaahService = mutabaahService) {}

  // --- Activities ---

  getActivities = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as { category?: string; isActive?: string };
    const isActive = query.isActive !== undefined ? query.isActive === "true" : undefined;
    const data = await this.service.getActivities({
      category: query.category,
      isActive,
    });
    return reply.status(200).send({ data });
  };

  getActivityById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getActivityById(id);
    return reply.status(200).send({ data });
  };

  createActivity = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateMutabaahActivitySchema, req.body);
    const data = await this.service.createActivity(input);
    return reply.status(201).send({ data });
  };

  updateActivity = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const input = parseData(UpdateMutabaahActivitySchema, req.body);
    const data = await this.service.updateActivity(id, input);
    return reply.status(200).send({ data });
  };

  deleteActivity = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteActivity(id);
    return reply.status(204).send();
  };

  // --- Daily Checklist ---

  getDailyChecklist = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(QueryMutabaahDailyChecklistSchema, req.query);
    const data = await this.service.getDailyChecklist(query);
    return reply.status(200).send({ data });
  };

  saveDailyChecklist = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(BatchUpsertMutabaahEntriesSchema, req.body);
    const userId = req.user?.sub;
    const result = await this.service.saveBatchDailyEntries(input, userId);
    return reply.status(200).send({ data: result });
  };

  // --- Uzur Syar'i ---

  getUzurRecords = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as { studentId?: string };
    const data = await this.service.getUzurRecords(query.studentId);
    return reply.status(200).send({ data });
  };

  createUzurRecord = async (req: FastifyRequest, reply: FastifyReply) => {
    const input = parseData(CreateMutabaahUzurRecordSchema, req.body);
    const userId = req.user?.sub;
    const data = await this.service.createUzurRecord(input, userId);
    return reply.status(201).send({ data });
  };

  deleteUzurRecord = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteUzurRecord(id);
    return reply.status(204).send();
  };

  // --- Compliance Recap & Early Warning ---

  getComplianceRecap = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(QueryComplianceSchema, req.query);
    const data = await this.service.getComplianceRecap(query);
    return reply.status(200).send({ data });
  };

  getEarlyWarnings = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as { classroomId?: string };
    const data = await this.service.getEarlyWarnings(query.classroomId);
    return reply.status(200).send({ data });
  };

  // --- Rapor Mutaba'ah PDF ---

  downloadStudentReportPdf = async (req: FastifyRequest, reply: FastifyReply) => {
    const { studentId } = parseData(StudentIdParamSchema, req.params);
    const { month, year } = parseData(MonthlyReportQuerySchema, req.query);
    const pdfBuffer = await this.service.generateStudentMonthlyReportPdf(
      studentId,
      month,
      year,
    );

    reply.header("Content-Type", "application/pdf");
    reply.header(
      "Content-Disposition",
      `attachment; filename="mutabaah_${studentId}_${year}_${month}.pdf"`,
    );
    return reply.send(pdfBuffer);
  };
}

export const mutabaahController = new MutabaahController();
