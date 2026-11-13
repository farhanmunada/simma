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
    return reply.status(200).send({ data });
  };

  createRule = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateDisciplineRuleSchema, request.body);
    const data = await this.service.createRule(body as any);
    return reply.status(201).send({ data, message: "Aturan tata tertib berhasil dibuat" });
  };

  updateRule = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(DisciplineIdParamSchema, request.params);
    const body = parseData(UpdateDisciplineRuleSchema, request.body);
    const data = await this.service.updateRule(id, body as any);
    return reply.status(200).send({ data, message: "Aturan tata tertib berhasil diperbarui" });
  };

  deleteRule = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(DisciplineIdParamSchema, request.params);
    await this.service.deleteRule(id);
    return reply.status(200).send({ message: "Aturan tata tertib berhasil dihapus" });
  };

  // --- Infractions ---
  getInfractions = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(QueryStudentInfractionsSchema, request.query);
    const data = await this.service.getInfractions(query);
    return reply.status(200).send({ data });
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
    return reply.status(200).send({ data, message: `Status pelanggaran berhasil diubah ke ${body.status}` });
  };

  deleteInfraction = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(DisciplineIdParamSchema, request.params);
    await this.service.deleteInfraction(id);
    return reply.status(200).send({ message: "Catatan kedisiplinan berhasil dihapus" });
  };

  // --- Student Profiles & Leaderboard ---
  getStudentProfile = async (request: FastifyRequest, reply: FastifyReply) => {
    const { studentId } = parseData(StudentIdParamSchema, request.params);
    const data = await this.service.getStudentProfile(studentId);
    return reply.status(200).send({ data });
  };

  getLeaderboard = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(LeaderboardQuerySchema, request.query);
    const data = await this.service.getLeaderboard(query.classroomId, query.type, query.limit);
    return reply.status(200).send({ data });
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
    return reply.status(200).send({ data });
  };

  createCounselingSession = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateCounselingSessionSchema, request.body);
    const user = (request as any).user;
    const data = await this.service.createCounselingSession(body as any, user?.sub);
    return reply.status(201).send({ data, message: "Sesi konseling BK berhasil dijadwalkan" });
  };

  updateCounselingSession = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(DisciplineIdParamSchema, request.params);
    const body = parseData(UpdateCounselingSessionSchema, request.body);
    const data = await this.service.updateCounselingSession(id, body as any);
    return reply.status(200).send({ data, message: "Sesi konseling BK berhasil diperbarui" });
  };

  deleteCounselingSession = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(DisciplineIdParamSchema, request.params);
    await this.service.deleteCounselingSession(id);
    return reply.status(200).send({ message: "Sesi konseling BK berhasil dihapus" });
  };

  // --- Parent Summons ---
  getParentSummons = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(ParentSummonQuerySchema, request.query);
    const data = await this.service.getParentSummons(query.studentId, query.status);
    return reply.status(200).send({ data });
  };

  createParentSummon = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateParentSummonSchema, request.body);
    const user = (request as any).user;
    const data = await this.service.createParentSummon(body, user?.sub);
    return reply.status(201).send({ data, message: "Surat panggilan orang tua berhasil diterbitkan" });
  };

  updateParentSummon = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(DisciplineIdParamSchema, request.params);
    const body = parseData(UpdateParentSummonSchema, request.body);
    const data = await this.service.updateParentSummon(id, body);
    return reply.status(200).send({ data, message: "Surat panggilan orang tua berhasil diperbarui" });
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
