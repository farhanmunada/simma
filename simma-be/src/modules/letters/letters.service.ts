import crypto from "crypto";
import { LettersRepository } from "./letters.repository.js";
import { NotFoundError, ConflictError } from "../../core/errors/index.js";
import type {
  NewIncomingLetter,
  NewDisposition,
  NewOutgoingLetter,
  NewExpeditionBook,
  NewLetterClassification,
  LetterStats,
  VerifyLetterResult,
} from "./letters.types.js";

const DEFAULT_CLASSIFICATIONS = [
  { code: "PP.00", name: "Kurikulum & Pembelajaran", description: "Pedoman kurikulum, silabus, dan pembelajaran madrasah" },
  { code: "PP.00.6", name: "Kesiswaan & Buku Induk", description: "Administrasi kesiswaan, NISN, mutasi, dan ijazah" },
  { code: "PP.00.8", name: "Ujian & Penilaian", description: "Asesmen madrasah, ujian semester, dan kelulusan" },
  { code: "KP.00", name: "Kepegawaian & GTK", description: "Kenaikan pangkat, penugasan, izin cuti, sertifikasi GTK" },
  { code: "KS.01", name: "Kerjasama Antar Lembaga", description: "MoU dan kemitraan dengan instansi eksternal" },
  { code: "HM.00", name: "Hubungan Masyarakat", description: "Publikasi madrasah, dokumentasi, siaran pers" },
  { code: "OT.00", name: "Organisasi & Tata Kerja", description: "Struktur komite, statuta madrasah, dan tata tertib" },
  { code: "KU.00", name: "Keuangan & BOS/BOP", description: "Pengelolaan anggaran, SPP, dan pelaporan BOS madrasah" },
  { code: "TL.00", name: "Tata Usaha & Perlengkapan", description: "Persuratan dinas, inventaris barang, sarpras" },
  { code: "BA.00", name: "Berita Acara", description: "Berita acara serah terima jabatan, rapat komite, ujian" },
];

export class LettersService {
  constructor(private repo: LettersRepository = new LettersRepository()) {}

  // --- Klasifikasi KMA 44/2010 ---
  async getClassifications(search?: string, isActive?: boolean) {
    const list = await this.repo.findClassifications(search, isActive);
    if (list.length === 0 && !search) {
      for (const item of DEFAULT_CLASSIFICATIONS) {
        await this.repo.createClassification({ ...item, isActive: true });
      }
      return this.repo.findClassifications(search, isActive);
    }
    return list;
  }

  async createClassification(data: NewLetterClassification) {
    const existing = await this.repo.findClassificationByCode(data.code);
    if (existing) throw new ConflictError(`Kode klasifikasi '${data.code}' sudah terdaftar`);
    return this.repo.createClassification(data);
  }

  // --- Agenda Surat Masuk ---
  async getIncomingLetters(p: { page?: number; limit?: number; search?: string; status?: string; year?: number; classificationCode?: string }) {
    const page = Math.max(1, p.page || 1);
    const limit = Math.min(100, Math.max(1, p.limit || 10));
    return this.repo.findIncomingLetters({ ...p, page, limit });
  }

  async getIncomingLetterById(id: string) {
    const item = await this.repo.findIncomingLetterById(id);
    if (!item) throw new NotFoundError("Surat masuk tidak ditemukan");
    return item;
  }

  async createIncomingLetter(data: Omit<NewIncomingLetter, "agendaNumber" | "year"> & { year?: number }) {
    const letterDate = new Date(data.mailDate);
    const year = data.year || letterDate.getFullYear();
    const agendaNumber = await this.repo.getNextAgendaNumber(year);
    return this.repo.createIncomingLetter({ ...data, year, agendaNumber });
  }

  async updateIncomingLetterStatus(id: string, status: "waiting_disposition" | "disposed" | "completed") {
    await this.getIncomingLetterById(id);
    return this.repo.updateIncomingLetter(id, { status });
  }

  // --- Disposisi Kamad ---
  async getDispositions(p: { incomingLetterId?: string; targetRole?: string; status?: string }) {
    return this.repo.findDispositions(p);
  }

  async getDispositionById(id: string) {
    const item = await this.repo.findDispositionById(id);
    if (!item) throw new NotFoundError("Lembar disposisi tidak ditemukan");
    return item;
  }

  async createDisposition(data: NewDisposition) {
    await this.getIncomingLetterById(data.incomingLetterId);
    const disp = await this.repo.createDisposition(data);
    await this.repo.updateIncomingLetter(data.incomingLetterId, { status: "disposed" });
    return disp;
  }

  async updateDispositionStatus(id: string, status: "pending" | "in_progress" | "completed", notes?: string) {
    const disp = await this.getDispositionById(id);
    const updated = await this.repo.updateDisposition(id, {
      status,
      notes: notes ?? disp.notes,
      completedAt: status === "completed" ? new Date() : null,
    });
    return updated;
  }

  // --- Penomoran Resmi Kemenag & Surat Keluar ---
  formatLetterNumber(seq: number, securityDegree: string, satkerCode: string, classificationCode: string, date: Date): string {
    const seqStr = String(seq).padStart(3, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${securityDegree}-${seqStr}/${satkerCode}/${classificationCode}/${month}/${year}`;
  }

  async createOutgoingLetter(data: Omit<NewOutgoingLetter, "letterNumber" | "sequenceNumber" | "verificationHash" | "year" | "month"> & { satkerCode?: string }) {
    const date = new Date(data.letterDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const securityDegree = data.securityDegree || "B";
    const satkerCode = data.satkerCode || "Ma.13.04";

    const seq = await this.repo.allocateSequenceNumber(year, securityDegree);
    const letterNumber = this.formatLetterNumber(seq, securityDegree, satkerCode, data.classificationCode, date);
    const verificationHash = crypto.randomBytes(16).toString("hex");

    return this.repo.createOutgoingLetter({
      ...data,
      year,
      month,
      securityDegree,
      sequenceNumber: seq,
      letterNumber,
      verificationHash,
    });
  }

  async getOutgoingLetters(p: { page?: number; limit?: number; search?: string; templateType?: string; status?: string; year?: number; classificationCode?: string }) {
    const page = Math.max(1, p.page || 1);
    const limit = Math.min(100, Math.max(1, p.limit || 10));
    return this.repo.findOutgoingLetters({ ...p, page, limit });
  }

  async getOutgoingLetterById(id: string) {
    const item = await this.repo.findOutgoingLetterById(id);
    if (!item) throw new NotFoundError("Surat keluar tidak ditemukan");
    return item;
  }

  async verifyPublicLetter(hash: string): Promise<VerifyLetterResult> {
    const letter = await this.repo.findOutgoingLetterByHash(hash);
    if (!letter) {
      return {
        verified: false,
        letterNumber: "",
        subject: "",
        letterDate: "",
        recipient: "",
        signerName: "",
        signerRole: "",
        templateType: "",
        institutionName: "",
        createdAt: "",
      };
    }
    const inst = await this.repo.getInstitutionInfo();
    return {
      verified: true,
      letterNumber: letter.letterNumber,
      subject: letter.subject,
      letterDate: letter.letterDate,
      recipient: letter.recipient,
      signerName: letter.signerName,
      signerRole: letter.signerRole,
      templateType: letter.templateType,
      institutionName: inst?.name || "Madrasah Aliyah Negeri SIMMA",
      createdAt: letter.createdAt ? letter.createdAt.toISOString() : "",
    };
  }

  // --- Buku Ekspedisi ---
  async getExpeditions(p: { page?: number; limit?: number; search?: string; outgoingLetterId?: string }) {
    const page = Math.max(1, p.page || 1);
    const limit = Math.min(100, Math.max(1, p.limit || 10));
    return this.repo.findExpeditions({ ...p, page, limit });
  }

  async createExpedition(data: NewExpeditionBook) {
    const letter = await this.repo.findOutgoingLetterById(data.outgoingLetterId);
    if (!letter) throw new NotFoundError("Surat keluar referensi ekspedisi tidak ditemukan");
    const exp = await this.repo.createExpedition(data);
    return exp;
  }

  async updateExpeditionStatus(id: string, data: Partial<NewExpeditionBook>) {
    const updated = await this.repo.updateExpedition(id, data);
    if (!updated) throw new NotFoundError("Buku ekspedisi tidak ditemukan");
    return updated;
  }

  // --- Summary Stats ---
  async getStats(): Promise<LetterStats> {
    return this.repo.getStats();
  }
}
