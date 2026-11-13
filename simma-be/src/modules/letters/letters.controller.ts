import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ValidationError } from "../../core/errors/index.js";
import { LettersService } from "./letters.service.js";
import { LettersGeneratorService } from "./letters-generator.service.js";
import { generateOfficialLetterPdf } from "./letters.pdf.js";
import {
  CreateLetterClassificationSchema,
  CreateIncomingLetterSchema,
  IncomingLetterQuerySchema,
  UpdateIncomingLetterStatusSchema,
  CreateDispositionSchema,
  UpdateDispositionStatusSchema,
  CreateOutgoingLetterSchema,
  OutgoingLetterQuerySchema,
  UpdateOutgoingLetterStatusSchema,
  CreateExpeditionBookSchema,
  UpdateExpeditionBookSchema,
  ExpeditionQuerySchema,
  GenerateStudentActiveLetterSchema,
  GenerateStudentBehaviorLetterSchema,
  GenerateTeacherDutyLetterSchema,
  GenerateParentInvitationLetterSchema,
  VerifyLetterHashSchema,
} from "@simma/shared";

const IdParamSchema = z.object({ id: z.string().uuid("ID tidak valid") });

function parseData<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class LettersController {
  constructor(
    private readonly service: LettersService = new LettersService(),
    private readonly generatorService: LettersGeneratorService = new LettersGeneratorService()
  ) {}

  // 1. Master Klasifikasi Kemenag (KMA 44/2010)
  getClassifications = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as { search?: string; isActive?: string };
    const isActive = query.isActive !== undefined ? query.isActive === "true" : undefined;
    const data = await this.service.getClassifications(query.search, isActive);
    return reply.status(200).send({ message: "Daftar klasifikasi surat Kemenag berhasil diambil", data });
  };

  createClassification = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateLetterClassificationSchema, req.body);
    const data = await this.service.createClassification(body);
    return reply.status(201).send({ message: "Klasifikasi surat berhasil ditambahkan", data });
  };

  // 2. Agenda Surat Masuk (F-TU-01)
  getIncomingLetters = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(IncomingLetterQuerySchema, req.query);
    const result = await this.service.getIncomingLetters(query);
    return reply.status(200).send({ message: "Daftar surat masuk berhasil diambil", data: result.data, meta: { total: result.total } });
  };

  getIncomingLetterById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getIncomingLetterById(id);
    return reply.status(200).send({ message: "Detail surat masuk", data });
  };

  createIncomingLetter = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateIncomingLetterSchema, req.body);
    const data = await this.service.createIncomingLetter(body);
    return reply.status(201).send({ message: "Surat masuk berhasil dicatat dalam buku agenda", data });
  };

  updateIncomingLetterStatus = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const body = parseData(UpdateIncomingLetterStatusSchema, req.body);
    const data = await this.service.updateIncomingLetterStatus(id, body.status);
    return reply.status(200).send({ message: "Status surat masuk diperbarui", data });
  };

  // 3. Lembar Disposisi Kamad (F-TU-02)
  getDispositions = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as { incomingLetterId?: string; targetRole?: string; status?: string };
    const data = await this.service.getDispositions(query);
    return reply.status(200).send({ message: "Daftar disposisi", data });
  };

  createDisposition = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateDispositionSchema, req.body);
    const disposedBy = body.disposedBy || (req.user as { name?: string } | undefined)?.name || "Kepala Madrasah";
    const data = await this.service.createDisposition({ ...body, disposedBy });
    return reply.status(201).send({ message: "Disposisi elektronik Kepala Madrasah berhasil dibuat", data });
  };

  updateDispositionStatus = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const body = parseData(UpdateDispositionStatusSchema, req.body);
    const data = await this.service.updateDispositionStatus(id, body.status, body.followUpNotes);
    return reply.status(200).send({ message: "Status tindak lanjut disposisi diperbarui", data });
  };

  // 4. Penomoran Otomatis Kemenag & Surat Keluar (F-TU-03 s/d F-TU-05)
  getOutgoingLetters = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(OutgoingLetterQuerySchema, req.query);
    const result = await this.service.getOutgoingLetters(query);
    return reply.status(200).send({ message: "Daftar surat keluar berhasil diambil", data: result.data, meta: { total: result.total } });
  };

  getOutgoingLetterById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const data = await this.service.getOutgoingLetterById(id);
    return reply.status(200).send({ message: "Detail surat keluar", data });
  };

  createOutgoingLetter = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateOutgoingLetterSchema, req.body);
    const data = await this.service.createOutgoingLetter(body);
    return reply.status(201).send({ message: "Surat keluar berhasil dibuat dengan nomor resmi Kemenag otomatis", data });
  };

  updateOutgoingLetterStatus = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const body = parseData(UpdateOutgoingLetterStatusSchema, req.body);
    const data = await this.service.updateOutgoingLetterStatus(id, body.status);
    return reply.status(200).send({ message: "Status surat keluar berhasil diperbarui", data });
  };

  updateOutgoingLetter = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const body = req.body as Record<string, unknown>;
    const data = await this.service.updateOutgoingLetter(id, body);
    return reply.status(200).send({ message: "Data surat keluar berhasil diperbarui", data });
  };

  deleteOutgoingLetter = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const result = await this.service.deleteOutgoingLetter(id);
    return reply.status(200).send({ message: "Surat keluar berhasil dihapus", data: result });
  };

  updateClassification = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const body = req.body as Record<string, unknown>;
    const data = await this.service.updateClassification(id, body);
    return reply.status(200).send({ message: "Klasifikasi surat berhasil diperbarui", data });
  };

  deleteClassification = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const result = await this.service.deleteClassification(id);
    return reply.status(200).send({ message: "Klasifikasi surat berhasil dihapus", data: result });
  };

  downloadOutgoingLetterPdf = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const letter = await this.service.getOutgoingLetterById(id);
    const buffer = generateOfficialLetterPdf(letter);
    const safeName = letter.letterNumber.replace(/[/\\?%*:|"<>]/g, "_");
    reply.header("Content-Type", "application/pdf");
    reply.header("Content-Disposition", `inline; filename="Surat_${safeName}.pdf"`);
    return reply.send(buffer);
  };

  verifyPublicLetter = async (req: FastifyRequest, reply: FastifyReply) => {
    const { hash } = parseData(VerifyLetterHashSchema, req.params);
    const result = await this.service.verifyPublicLetter(hash);
    return reply.status(200).send({ message: "Hasil verifikasi keaslian surat dinas Kemenag", data: result });
  };

  // 5. Template Generator Surat Otomatis (F-TU-06 s/d F-TU-09)
  generateStudentActive = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(GenerateStudentActiveLetterSchema, req.body);
    const data = await this.generatorService.generateStudentActiveLetter(body);
    return reply.status(201).send({ message: "Surat keterangan aktif siswa berhasil di-generate", data });
  };

  generateStudentBehavior = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(GenerateStudentBehaviorLetterSchema, req.body);
    const data = await this.generatorService.generateStudentBehaviorLetter(body);
    return reply.status(201).send({ message: "Surat Keterangan Berkelakuan Baik (SKKB) berhasil di-generate", data });
  };

  generateTeacherDuty = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(GenerateTeacherDutyLetterSchema, req.body);
    const data = await this.generatorService.generateTeacherDutyLetter(body);
    return reply.status(201).send({ message: "Surat Tugas GTK (SPT) berhasil di-generate", data });
  };

  generateParentInvitation = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(GenerateParentInvitationLetterSchema, req.body);
    const data = await this.generatorService.generateParentInvitationLetter(body);
    return reply.status(201).send({ message: "Surat undangan wali murid berhasil di-generate", data });
  };

  // 6. Buku Ekspedisi (F-TU-11)
  getExpeditions = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(ExpeditionQuerySchema, req.query);
    const result = await this.service.getExpeditions(query);
    return reply.status(200).send({ message: "Daftar buku ekspedisi pengiriman surat", data: result.data, meta: { total: result.total } });
  };

  createExpedition = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(CreateExpeditionBookSchema, req.body);
    const data = await this.service.createExpedition(body);
    return reply.status(201).send({ message: "Pengiriman surat berhasil dicatat dalam buku ekspedisi", data });
  };

  updateExpeditionStatus = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const body = parseData(UpdateExpeditionBookSchema, req.body);
    const data = await this.service.updateExpeditionStatus(id, body);
    return reply.status(200).send({ message: "Status buku ekspedisi berhasil diperbarui", data });
  };

  // 7. Statistik Persuratan & Disposisi
  getStats = async (_req: FastifyRequest, reply: FastifyReply) => {
    const data = await this.service.getStats();
    return reply.status(200).send({ message: "Statistik persuratan & disposisi tata usaha", data });
  };
}
