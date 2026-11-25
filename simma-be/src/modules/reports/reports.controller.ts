import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { eq } from "drizzle-orm";
import { ForbiddenError, ValidationError } from "../../core/errors/index.js";
import { teacherScopeService } from "../../core/auth/index.js";
import { getDb } from "../../core/database/client.js";
import { classStudents } from "../../db/schema/students.js";
import { ReportsService, reportsService } from "./reports.service.js";
import { reportsRepository } from "./reports.repository.js";
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

  private async assertStudentScope(
    req: FastifyRequest,
    studentId: string,
    semesterId?: string,
    requireHomeroom = false,
  ) {
    if (teacherScopeService.isPrivileged(req.user, ["kepala_madrasah", "waka_kurikulum", "admin_tu"])) {
      return;
    }
    const scope = await teacherScopeService.getScopeForUser(req.user);
    const allowedIds = requireHomeroom
      ? scope.homeroomClassroomIds
      : Array.from(new Set([...scope.homeroomClassroomIds, ...scope.assignedClassroomIds]));

    if (allowedIds.length === 0) {
      throw new ForbiddenError("Akses ditolak: Anda belum ditugaskan pada kelas ini.");
    }

    if (semesterId) {
      const sc = await reportsRepository.findStudentClassroom(studentId, semesterId);
      if (sc && allowedIds.includes(sc.classroom.id)) return;
      if (sc && !allowedIds.includes(sc.classroom.id)) {
        throw new ForbiddenError("Akses ditolak: siswa ini bukan berada di kelas tugas Anda.");
      }
    }

    const db = getDb();
    const enrollments = await db
      .select({ classroomId: classStudents.classroomId })
      .from(classStudents)
      .where(eq(classStudents.studentId, studentId));
    const allowed = enrollments.some((e) => allowedIds.includes(e.classroomId));
    if (!allowed) {
      throw new ForbiddenError("Akses ditolak: siswa ini bukan berada di kelas tugas Anda.");
    }
  }

  getStudentReportCard = async (
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    const { studentId, semesterId } = parseData(
      StudentSemesterParamSchema,
      req.params,
    );
    await this.assertStudentScope(req, studentId, semesterId, false);
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
    await teacherScopeService.assertHomeroomClassroom(req.user, classroomId);
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
    await this.assertStudentScope(req, studentId, semesterId, false);
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
    await this.assertStudentScope(req, studentId, body.semesterId, true);
    const data = await this.service.saveStudentNotes(studentId, body);
    return reply.status(201).send({ data });
  };
}

export const reportsController = new ReportsController();
