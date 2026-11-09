process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://simma:***@localhost:5432/simma_test";
process.env.JWT_ACCESS_SECRET = "test-jwt-access-secret-minimum-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-minimum-32-chars-long";
process.env.JWT_ACCESS_EXPIRY = "15m";
process.env.JWT_REFRESH_EXPIRY = "7d";

import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { LettersService } from "./letters.service.js";
import { LettersRepository } from "./letters.repository.js";
import { generateOfficialLetterPdf } from "./letters.pdf.js";
import { NotFoundError, ConflictError } from "../../core/errors/index.js";
import { signAccessToken } from "../../core/auth/jwt.js";
import { buildApp } from "../../app.js";

const mockIncomingLetter = {
  id: "018f3a2c-0000-7000-8000-000000000001",
  agendaNumber: 1,
  year: 2026,
  mailNumber: "123/KEMENAG/V/2026",
  sender: "Kantor Kemenag Wilayah",
  mailDate: "2026-05-10",
  receivedDate: "2026-05-12",
  subject: "Undangan Rapat Koordinasi Kurikulum Madrasah",
  summary: "Rapat teknis KMA 450",
  classificationCode: "PP.00",
  classificationId: null,
  attachmentPath: null,
  attachmentName: null,
  status: "waiting_disposition",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOutgoingLetter = {
  id: "018f3a2c-0000-7000-8000-000000000002",
  letterNumber: "B-001/Ma.13.04/PP.00.6/05/2026",
  securityDegree: "B",
  sequenceNumber: 1,
  year: 2026,
  month: 5,
  satkerCode: "Ma.13.04",
  classificationCode: "PP.00.6",
  classificationId: null,
  letterDate: "2026-05-15",
  recipient: "Ahmad Siswa",
  subject: "Surat Keterangan Aktif Belajar",
  signerName: "Drs. H. Ahmad Dahlan, M.Pd.I",
  signerNip: "197508152002121003",
  signerRole: "Kepala Madrasah",
  templateType: "student_active",
  studentId: null,
  teacherId: null,
  contentData: { body: "Menerangkan bahwa siswa aktif belajar." },
  verificationHash: "abc123hash999",
  attachmentPath: null,
  status: "approved",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("LettersService Unit Tests", () => {
  let service: LettersService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findClassifications: vi.fn().mockResolvedValue([{ id: "uuid-1", code: "PP.00.6", name: "Kesiswaan" }]),
      findClassificationByCode: vi.fn().mockResolvedValue(null),
      createClassification: vi.fn().mockResolvedValue({ id: "uuid-2", code: "KP.00", name: "Kepegawaian" }),
      findIncomingLetters: vi.fn().mockResolvedValue({ data: [mockIncomingLetter], total: 1 }),
      findIncomingLetterById: vi.fn().mockResolvedValue(mockIncomingLetter),
      getNextAgendaNumber: vi.fn().mockResolvedValue(1),
      createIncomingLetter: vi.fn().mockResolvedValue(mockIncomingLetter),
      updateIncomingLetter: vi.fn().mockResolvedValue({ ...mockIncomingLetter, status: "disposed" }),
      findDispositions: vi.fn().mockResolvedValue([]),
      findDispositionById: vi.fn().mockResolvedValue({ id: "disp-1", status: "pending", notes: "Catatan" }),
      createDisposition: vi.fn().mockResolvedValue({ id: "disp-1", status: "pending" }),
      updateDisposition: vi.fn().mockResolvedValue({ id: "disp-1", status: "completed" }),
      allocateSequenceNumber: vi.fn().mockResolvedValue(1),
      createOutgoingLetter: vi.fn().mockResolvedValue(mockOutgoingLetter),
      findOutgoingLetters: vi.fn().mockResolvedValue({ data: [mockOutgoingLetter], total: 1 }),
      findOutgoingLetterById: vi.fn().mockResolvedValue(mockOutgoingLetter),
      findOutgoingLetterByHash: vi.fn().mockResolvedValue(mockOutgoingLetter),
      getInstitutionInfo: vi.fn().mockResolvedValue({ name: "MAN 1 SIMMA" }),
      findExpeditions: vi.fn().mockResolvedValue({ data: [], total: 0 }),
      createExpedition: vi.fn().mockResolvedValue({ id: "exp-1" }),
      updateExpedition: vi.fn().mockResolvedValue({ id: "exp-1", recipientName: "Budi" }),
      getStats: vi.fn().mockResolvedValue({ incomingTotal: 1, outgoingTotal: 1, pendingDispositions: 0 }),
    };

    service = new LettersService(mockRepo as unknown as LettersRepository);
  });

  it("should format official Kemenag letter number according to PMA 12/2024", () => {
    const formatted = service.formatLetterNumber(1, "B", "Ma.13.04", "PP.00.6", new Date(2026, 4, 15));
    expect(formatted).toBe("B-001/Ma.13.04/PP.00.6/05/2026");
  });

  it("should create incoming letter with auto-increment agenda number", async () => {
    const input = {
      mailNumber: "123/KEMENAG/V/2026",
      sender: "Kantor Kemenag Wilayah",
      mailDate: "2026-05-10",
      receivedDate: "2026-05-12",
      subject: "Undangan Rapat",
      classificationCode: "PP.00",
    };

    const result = await service.createIncomingLetter(input);
    expect(mockRepo.getNextAgendaNumber).toHaveBeenCalledWith(2026);
    expect(result).toEqual(mockIncomingLetter);
  });

  it("should prevent duplicate classification codes", async () => {
    mockRepo.findClassificationByCode.mockResolvedValueOnce({ id: "uuid-1", code: "PP.00.6" });
    await expect(
      service.createClassification({ code: "PP.00.6", name: "Duplikat" })
    ).rejects.toThrow(ConflictError);
  });

  it("should create outgoing letter with allocated sequence and verification hash", async () => {
    const input = {
      classificationCode: "PP.00.6",
      letterDate: "2026-05-15",
      recipient: "Ahmad Siswa",
      subject: "Surat Keterangan Aktif",
      signerName: "Drs. H. Ahmad Dahlan, M.Pd.I",
    };

    const result = await service.createOutgoingLetter(input);
    expect(mockRepo.allocateSequenceNumber).toHaveBeenCalled();
    expect(result.letterNumber).toBe("B-001/Ma.13.04/PP.00.6/05/2026");
  });

  it("should verify public letter by cryptographic hash", async () => {
    const result = await service.verifyPublicLetter("abc123hash999");
    expect(result.verified).toBe(true);
    expect(result.letterNumber).toBe(mockOutgoingLetter.letterNumber);
  });

  it("should generate valid PDF buffer with PDF-1.4 header and footer", () => {
    const pdfBuffer = generateOfficialLetterPdf(mockOutgoingLetter as any);
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.toString("utf-8").startsWith("%PDF-1.4")).toBe(true);
    expect(pdfBuffer.toString("utf-8")).toContain("%%EOF");
  });
});

describe("Letters Routes Integration", () => {
  let app: FastifyInstance;
  let adminToken: string;
  let kamadToken: string;
  let studentToken: string;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    adminToken = await signAccessToken({
      sub: "018f3a2c-1234-7000-8000-000000000001",
      role: "admin_tu",
      username: "admin_tu",
    });
    kamadToken = await signAccessToken({
      sub: "018f3a2c-1234-7000-8000-000000000003",
      role: "kepala_madrasah",
      username: "kamad",
    });
    studentToken = await signAccessToken({
      sub: "018f3a2c-1234-7000-8000-000000000002",
      role: "calon_siswa",
      username: "siswa",
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/v1/letters/stats - should require authentication (401)", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/v1/letters/stats",
    });
    expect(res.statusCode).toBe(401);
  });

  it("POST /api/v1/letters/incoming - should reject unauthorized role with 403", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/letters/incoming",
      headers: {
        authorization: `Bearer ${studentToken}`,
      },
      payload: {
        mailNumber: "123",
      },
    });
    expect(res.statusCode).toBe(403);
  });

  it("POST /api/v1/letters/incoming - should reject invalid payload with 400", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/letters/incoming",
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        mailNumber: "", // invalid empty string
      },
    });
    expect(res.statusCode).toBe(400);
  });

  it("POST /api/v1/letters/dispositions - should reject unauthorized role with 403", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/letters/dispositions",
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      payload: {
        incomingLetterId: "018f3a2c-0000-7000-8000-000000000001",
      },
    });
    expect(res.statusCode).toBe(403);
  });

  it("POST /api/v1/letters/dispositions - should reject invalid payload with 400 for kamad", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/v1/letters/dispositions",
      headers: {
        authorization: `Bearer ${kamadToken}`,
      },
      payload: {
        incomingLetterId: "invalid-uuid",
      },
    });
    expect(res.statusCode).toBe(400);
  });
});
