import type { FastifyRequest, FastifyReply } from "fastify";
import type { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { DisciplineService } from "./discipline.service.js";
import {
  CreateDisciplineRuleSchema,
  UpdateDisciplineRuleSchema,
  CreateStudentInfractionSchema,
  UpdateInfractionApprovalSchema,
  QueryStudentInfractionsSchema,
  CreateCounselingSessionSchema,
  UpdateCounselingSessionSchema,
  CreateParentSummonSchema,
  UpdateParentSummonSchema,
  DisciplineIdParamSchema,
  StudentIdParamSchema,
  LeaderboardQuerySchema,
  CounselingQuerySchema,
  ParentSummonQuerySchema,
} from "./discipline.schema.js";

function parseData<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class DisciplineController {
  constructor(private readonly service = new DisciplineService()) {}

  // --- Rules ---
  getRules = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { type?: string; category?: string };
    const data = await this.service.getRules(query.type, query.category);
    return reply.status(200).send({ data, success: true });
  };

  createRule = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateDisciplineRuleSchema, request.body);
    const data = await this.service.createRule(body as any);
    return reply.status(201).send({ data, message: "Aturan tata tertib berhasil dibuat", success: true });
  };

  updateRule = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(DisciplineIdParamSchema, request.params);
    const body = parseData(UpdateDisciplineRuleSchema, request.body);
    const data = await this.service.updateRule(id, body as any);
    return reply.status(200).send({ data, message: "Aturan tata tertib berhasil diperbarui", success: true });
  };

  deleteRule = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(DisciplineIdParamSchema, request.params);
    await this.service.deleteRule(id);
    return reply.status(200).send({ message: "Aturan tata tertib berhasil dihapus", success: true });
  };

  // --- Infractions ---
  getInfractions = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(QueryStudentInfractionsSchema, request.query);
    const data = await this.service.getInfractions(query);
    return reply.status(200).send({ data, success: true });
  };

  createInfraction = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateStudentInfractionSchema, request.body);
    const user = (request as any).user;
    const { infraction, escalation } = await this.service.createInfraction(
      body,
      user?.sub,
      user?.role,
    );
    return reply.status(201).send({
      data: infraction,
      escalation,
      success: true,
      message:
        infraction.status === "pending_approval"
          ? "Pelanggaran > 50 poin memerlukan persetujuan Waka Kesiswaan"
          : "Catatan kedisiplinan berhasil disimpan",
    });
  };

  updateApproval = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(DisciplineIdParamSchema, request.params);
    const body = parseData(UpdateInfractionApprovalSchema, request.body);
    const user = (request as any).user;
    const data = await this.service.updateInfractionApproval(
      id,
      user?.sub,
      body.status,
      body.notes,
    );
    return reply.status(200).send({ data, message: `Status pelanggaran berhasil diubah ke ${body.status}`, success: true });
  };

  deleteInfraction = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(DisciplineIdParamSchema, request.params);
    await this.service.deleteInfraction(id);
    return reply.status(200).send({ message: "Catatan kedisiplinan berhasil dihapus", success: true });
  };

  // --- Student Profiles & Leaderboard ---
  getStudentProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    const { studentId } = parseData(StudentIdParamSchema, request.params);
    const data = await this.service.getStudentProfile(studentId);
    return reply.status(200).send({ data, success: true });
  };

  getLeaderboard = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(LeaderboardQuerySchema, request.query);
    const data = await this.service.getLeaderboard(query.classroomId, query.type, query.limit);
    return reply.status(200).send({ data, success: true });
  };

  // --- Counseling Sessions (Rahasia BK) ---
  getCounselingSessions = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(CounselingQuerySchema, request.query);
    const user = (request as any).user;
    const data = await this.service.getCounselingSessions(
      user?.role,
      query.studentId,
      query.counselorId,
      query.status,
    );
    return reply.status(200).send({ data, success: true });
  };

  createCounselingSession = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateCounselingSessionSchema, request.body);
    const user = (request as any).user;
    const data = await this.service.createCounselingSession(body as any, user?.sub);
    return reply.status(201).send({ data, message: "Sesi konseling BK berhasil dijadwalkan", success: true });
  };

  updateCounselingSession = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(DisciplineIdParamSchema, request.params);
    const body = parseData(UpdateCounselingSessionSchema, request.body);
    const data = await this.service.updateCounselingSession(id, body as any);
    return reply.status(200).send({ data, message: "Sesi konseling BK berhasil diperbarui", success: true });
  };

  deleteCounselingSession = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(DisciplineIdParamSchema, request.params);
    await this.service.deleteCounselingSession(id);
    return reply.status(200).send({ message: "Sesi konseling BK berhasil dihapus", success: true });
  };

  // --- Parent Summons ---
  getParentSummons = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(ParentSummonQuerySchema, request.query);
    const data = await this.service.getParentSummons(query.studentId, query.status);
    return reply.status(200).send({ data, success: true });
  };

  createParentSummon = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateParentSummonSchema, request.body);
    const user = (request as any).user;
    const data = await this.service.createParentSummon(body, user?.sub);
    return reply.status(201).send({ data, message: "Surat panggilan orang tua berhasil diterbitkan", success: true });
  };

  updateParentSummon = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(DisciplineIdParamSchema, request.params);
    const body = parseData(UpdateParentSummonSchema, request.body);
    const data = await this.service.updateParentSummon(id, body);
    return reply.status(200).send({ data, message: "Surat panggilan orang tua berhasil diperbarui", success: true });
  };

  exportSummonPdf = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(DisciplineIdParamSchema, request.params);
    const buffer = await this.service.generateSummonPdf(id);

    return reply
      .header("Content-Type", "application/pdf")
      .header("Content-Disposition", `inline; filename="surat-panggilan-${id}.pdf"`)
      .send(buffer);
  };
}

export const disciplineController = new DisciplineController();
