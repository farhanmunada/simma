import fs from "node:fs";
import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { ValidationError, UnauthorizedError } from "../../core/errors/index.js";
import { PpdbService } from "./ppdb.service.js";
import {
  RegisterApplicantSchema,
  UpdateApplicantStatusSchema,
  ApplicantQuerySchema,
  CheckStatusQuerySchema,
  PpdbRegisterAccountSchema,
  PpdbLoginSchema,
  UpdateApplicantFormSchema,
  VerifyDocumentSchema,
} from "@simma/shared";

const IdParamSchema = z.object({
  id: z.string().uuid("ID tidak valid"),
});

const DocumentIdParamSchema = z.object({
  id: z.string().uuid("ID dokumen tidak valid"),
});

function parseData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.output<T> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(message);
  }
  return parsed.data;
}

export class PpdbController {
  constructor(private readonly service: PpdbService = new PpdbService()) {}

  // ==========================================
  // 1. Calon Siswa Authentication & Portal
  // ==========================================

  // Calon Siswa: Register account
  registerAccount = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(PpdbRegisterAccountSchema, req.body);
    const result = await this.service.registerAccount(body);
    return reply.status(201).send({
      message: "Akun calon siswa berhasil dibuat. Simpan Nomor Pendaftaran Anda untuk login.",
      data: result,
    });
  };

  // Calon Siswa: Login
  loginCalonSiswa = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(PpdbLoginSchema, req.body);
    const result = await this.service.loginCalonSiswa(body);
    return reply.status(200).send({
      message: "Login berhasil",
      data: result,
    });
  };

  // Calon Siswa: Get current application & uploaded documents
  getMyApplication = async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user || req.user.role !== "calon_siswa") {
      throw new UnauthorizedError("Hanya calon siswa terautentikasi yang dapat mengakses portal ini");
    }
    const result = await this.service.getMyApplication(req.user.sub);
    return reply.status(200).send({
      data: result,
    });
  };

  // Calon Siswa: Update application form
  updateMyApplication = async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user || req.user.role !== "calon_siswa") {
      throw new UnauthorizedError("Hanya calon siswa terautentikasi yang dapat mengubah formulir");
    }
    const body = parseData(UpdateApplicantFormSchema, req.body);
    const result = await this.service.updateMyApplication(req.user.sub, body);
    return reply.status(200).send({
      message: "Formulir pendaftaran berhasil disimpan sebagai draf",
      data: result,
    });
  };

  // Calon Siswa: Finalize & lock application
  finalizeMyApplication = async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user || req.user.role !== "calon_siswa") {
      throw new UnauthorizedError("Hanya calon siswa terautentikasi yang dapat memfinalisasi data");
    }
    const result = await this.service.finalizeMyApplication(req.user.sub);
    return reply.status(200).send({
      message: "Pendaftaran Anda telah berhasil difinalisasi dan dikirim ke Panitia PPDB.",
      data: result,
    });
  };

  // Calon Siswa: Upload document via Multipart
  uploadDocument = async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user || req.user.role !== "calon_siswa") {
      throw new UnauthorizedError("Hanya calon siswa terautentikasi yang dapat mengunggah berkas");
    }

    const part = await req.file();
    if (!part) {
      throw new ValidationError("Berkas file tidak ditemukan dalam permintaan multipart");
    }

    const documentType = (part.fields.documentType as any)?.value || "dokumen_pendukung";
    const buffer = await part.toBuffer();

    const result = await this.service.uploadDocument(req.user.sub, {
      buffer,
      originalName: part.filename,
      mimeType: part.mimetype,
      documentType,
    });

    return reply.status(201).send({
      message: "Berkas berhasil diunggah",
      data: result,
    });
  };

  // Calon Siswa: Delete uploaded document
  deleteDocument = async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user || req.user.role !== "calon_siswa") {
      throw new UnauthorizedError("Hanya calon siswa terautentikasi yang dapat menghapus berkas");
    }
    const { id } = parseData(DocumentIdParamSchema, req.params);
    await this.service.deleteDocument(req.user.sub, id);
    return reply.status(200).send({
      message: "Berkas berhasil dihapus",
    });
  };

  // Stream document securely (both Calon Siswa & Staff)
  streamDocument = async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user) {
      throw new UnauthorizedError("Autentikasi diperlukan untuk mengakses dokumen");
    }
    const { id } = parseData(DocumentIdParamSchema, req.params);
    const { filePath, mimeType, originalName } = await this.service.getDocumentForStream(
      id,
      { id: req.user.sub, role: req.user.role }
    );

    reply.header("Content-Type", mimeType);
    reply.header(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(originalName)}"`
    );
    const stream = fs.createReadStream(filePath);
    return reply.send(stream);
  };

  // Public: Register applicant
  register = async (req: FastifyRequest, reply: FastifyReply) => {
    const body = parseData(RegisterApplicantSchema, req.body);
    const result = await this.service.registerApplicant(body);
    return reply.status(201).send({
      message: "Pendaftaran berhasil dikirim. Simpan Nomor Pendaftaran Anda.",
      data: result,
    });
  };

  // Public: Check status
  checkStatus = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(CheckStatusQuerySchema, req.query);
    const result = await this.service.checkStatus(query);
    return reply.status(200).send({
      message: "Status pendaftaran ditemukan",
      data: result,
    });
  };

  // Public: PPDB Info
  getPublicInfo = async (_req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getPublicInfo();
    return reply.status(200).send({
      data: result,
    });
  };

  // Internal: List applicants
  getApplicants = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = parseData(ApplicantQuerySchema, req.query);
    const result = await this.service.listApplicants(query);
    return reply.status(200).send(result);
  };

  // Internal: Get stats
  getStats = async (_req: FastifyRequest, reply: FastifyReply) => {
    const result = await this.service.getStats();
    return reply.status(200).send({
      data: result,
    });
  };

  // Internal: Get applicant by id
  getApplicantById = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const result = await this.service.getApplicantById(id);
    return reply.status(200).send({
      data: result,
    });
  };

  // Internal: Verify document
  verifyDocument = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(DocumentIdParamSchema, req.params);
    const body = parseData(VerifyDocumentSchema, req.body);
    const verifiedBy = req.user?.username || req.user?.sub || "Panitia PPDB";
    const result = await this.service.verifyDocument(id, body, verifiedBy);
    return reply.status(200).send({
      message: `Status verifikasi dokumen diperbarui menjadi '${body.verificationStatus}'`,
      data: result,
    });
  };

  // Internal: Update status (verify, accept, reject)
  updateStatus = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const body = parseData(UpdateApplicantStatusSchema, req.body);
    const result = await this.service.updateStatus(id, body);
    return reply.status(200).send({
      message: `Status pendaftaran berhasil diubah menjadi '${body.status}'`,
      data: result,
    });
  };

  // Internal: Enroll to Buku Induk Siswa
  enroll = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    const result = await this.service.enrollToBukuInduk(id);
    return reply.status(201).send({
      message:
        "Calon siswa berhasil didaftarkan ke Buku Induk Siswa dengan status 'Aktif Tanpa Rombel'.",
      data: result,
    });
  };

  // Internal: Delete applicant
  delete = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = parseData(IdParamSchema, req.params);
    await this.service.deleteApplicant(id);
    return reply.status(200).send({
      message: "Data pendaftar berhasil dihapus",
    });
  };
}
