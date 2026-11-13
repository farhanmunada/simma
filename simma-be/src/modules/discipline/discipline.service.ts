import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../core/errors/index.js";
import { DisciplineRepository } from "./discipline.repository.js";
import {
  calculateDisciplineBalance,
  evaluateEscalation,
  formatSummonLetterNumber,
} from "./discipline.escalation.js";
import { generateParentSummonPdf } from "./discipline.pdf.js";
import type {
  DisciplineRule,
  NewDisciplineRule,
  StudentInfractionRecord,
  CounselingSessionRecord,
  NewCounselingSessionRecord,
  ParentSummonRecord,
  StudentPointsSummary,
  StudentDisciplineDetail,
} from "./discipline.types.js";
import type {
  CreateStudentInfractionInput,
  QueryStudentInfractionsInput,
  CreateParentSummonInput,
} from "@simma/shared";

export class DisciplineService {
  constructor(private readonly repo = new DisciplineRepository()) {}

  // --- Rules ---
  async getRules(type?: string, category?: string): Promise<DisciplineRule[]> {
    return this.repo.findAllRules(type, category);
  }

  async getRule(id: string): Promise<DisciplineRule> {
    const rule = await this.repo.findRuleById(id);
    if (!rule) throw new NotFoundError("Aturan Disiplin", id);
    return rule;
  }

  async createRule(data: NewDisciplineRule): Promise<DisciplineRule> {
    return this.repo.createRule(data);
  }

  async updateRule(id: string, data: Partial<NewDisciplineRule>): Promise<DisciplineRule> {
    const updated = await this.repo.updateRule(id, data);
    if (!updated) throw new NotFoundError("Aturan Disiplin", id);
    return updated;
  }

  async deleteRule(id: string): Promise<void> {
    const success = await this.repo.deleteRule(id);
    if (!success) throw new NotFoundError("Aturan Disiplin", id);
  }

  // --- Infractions & Merits ---
  async getInfractions(filter: QueryStudentInfractionsInput) {
    return this.repo.findInfractions(filter);
  }

  async createInfraction(
    data: CreateStudentInfractionInput,
    reporterId?: string,
    userRole?: string,
  ): Promise<{ infraction: StudentInfractionRecord; escalation: ReturnType<typeof evaluateEscalation> }> {
    // Sanksi berat > 50 poin butuh otorisasi Waka Kesiswaan / Super Admin
    const requiresApproval =
      data.type === "infraction" &&
      data.points > 50 &&
      userRole !== "super_admin" &&
      userRole !== "waka_kesiswaan";

    const status = requiresApproval ? "pending_approval" : "approved";

    const infraction = await this.repo.createInfraction({
      studentId: data.studentId,
      ruleId: data.ruleId ?? null,
      date: data.date,
      type: data.type,
      category: data.category,
      points: data.points,
      title: data.title,
      description: data.description ?? null,
      location: data.location ?? null,
      witness: data.witness ?? null,
      evidenceUrl: data.evidenceUrl ?? null,
      reporterId: reporterId ?? null,
      status,
      approvedById: status === "approved" ? reporterId ?? null : null,
      approvedAt: status === "approved" ? new Date() : null,
      notes: data.notes ?? null,
    });

    const studentInfractions = await this.repo.findStudentInfractionsRaw(data.studentId);
    const escalation = evaluateEscalation(data.studentId, studentInfractions);

    return { infraction, escalation };
  }

  async updateInfractionApproval(
    id: string,
    approverId: string,
    status: "approved" | "rejected",
    notes?: string | null,
  ): Promise<StudentInfractionRecord> {
    const existing = await this.repo.findInfractionById(id);
    if (!existing) throw new NotFoundError("Catatan Pelanggaran", id);

    const updated = await this.repo.updateInfraction(id, {
      status,
      approvedById: approverId,
      approvedAt: new Date(),
      notes: notes ?? existing.notes,
    });
    return updated!;
  }

  async deleteInfraction(id: string): Promise<void> {
    const success = await this.repo.deleteInfraction(id);
    if (!success) throw new NotFoundError("Catatan Pelanggaran", id);
  }

  // --- Profiles, Summaries & Leaderboard ---
  async getStudentProfile(studentId: string): Promise<StudentDisciplineDetail> {
    const student = await this.repo.findStudentWithClass(studentId);
    if (!student) throw new NotFoundError("Siswa", studentId);

    const infractions = await this.repo.findStudentInfractionsRaw(studentId);
    const balance = calculateDisciplineBalance(infractions);
    const escalation = evaluateEscalation(studentId, infractions);
    const summons = await this.repo.findParentSummons(studentId);
    const counseling = await this.repo.findCounselingSessions(studentId);

    return {
      studentId,
      studentName: student.fullName,
      nisn: student.nisn,
      nis: student.nis,
      className: student.className,
      totalInfractions: balance.totalInfractions,
      totalRewards: balance.totalRewards,
      infractionPoints: balance.infractionPoints,
      rewardPoints: balance.rewardPoints,
      netPoints: balance.netPoints,
      sanctionLevel: escalation.sanctionLevel,
      activeSummonCount: summons.length,
      latestInfractionDate: infractions[0]?.date ?? null,
      infractions: infractions as any,
      summons: summons.map((s) => s.summon),
      counselingCount: counseling.length,
    };
  }

  async getLeaderboard(
    classroomId?: string,
    type: "points_highest" | "merits_highest" = "points_highest",
    limit = 20,
  ): Promise<StudentPointsSummary[]> {
    const studentRows = await this.repo.findActiveStudents(classroomId);
    const results: StudentPointsSummary[] = [];

    for (const st of studentRows) {
      const records = await this.repo.findStudentInfractionsRaw(st.id);
      const balance = calculateDisciplineBalance(records);
      const escalation = evaluateEscalation(st.id, records);

      results.push({
        studentId: st.id,
        studentName: st.fullName,
        nisn: st.nisn,
        nis: st.nis,
        className: st.className,
        totalInfractions: balance.totalInfractions,
        totalRewards: balance.totalRewards,
        infractionPoints: balance.infractionPoints,
        rewardPoints: balance.rewardPoints,
        netPoints: balance.netPoints,
        sanctionLevel: escalation.sanctionLevel,
        activeSummonCount: 0,
        latestInfractionDate: records[0]?.date ?? null,
      });
    }

    if (type === "merits_highest") {
      results.sort((a, b) => b.rewardPoints - a.rewardPoints);
    } else {
      results.sort((a, b) => b.netPoints - a.netPoints);
    }

    return results.slice(0, limit);
  }

  // --- Counseling (Rahasia BK) ---
  async getCounselingSessions(
    userRole: string,
    studentId?: string,
    counselorId?: string,
    status?: string,
  ) {
    if (
      userRole !== "guru_bk" &&
      userRole !== "kepala_madrasah" &&
      userRole !== "super_admin"
    ) {
      throw new ForbiddenError("Rekam konseling BK hanya dapat diakses Guru BK & Kepala Madrasah");
    }
    return this.repo.findCounselingSessions(studentId, counselorId, status);
  }

  async createCounselingSession(
    data: NewCounselingSessionRecord,
    counselorId: string,
  ): Promise<CounselingSessionRecord> {
    return this.repo.createCounselingSession({ ...data, counselorId });
  }

  async updateCounselingSession(
    id: string,
    data: Partial<NewCounselingSessionRecord>,
  ): Promise<CounselingSessionRecord> {
    const updated = await this.repo.updateCounselingSession(id, data);
    if (!updated) throw new NotFoundError("Sesi Konseling BK", id);
    return updated;
  }

  async deleteCounselingSession(id: string): Promise<void> {
    const success = await this.repo.deleteCounselingSession(id);
    if (!success) throw new NotFoundError("Sesi Konseling BK", id);
  }

  // --- Parent Summons ---
  async getParentSummons(studentId?: string, status?: string) {
    return this.repo.findParentSummons(studentId, status);
  }

  async createParentSummon(
    data: CreateParentSummonInput,
    issuedById?: string,
  ): Promise<ParentSummonRecord> {
    const count = await this.repo.countSummons();
    const letterNumber = formatSummonLetterNumber(count + 1, data.sanctionLevel);

    return this.repo.createParentSummon({
      letterNumber,
      studentId: data.studentId,
      parentName: data.parentName,
      summonDate: data.summonDate,
      summonTime: data.summonTime,
      location: data.location,
      reason: data.reason,
      sanctionLevel: data.sanctionLevel,
      status: "terbit",
      notes: data.notes ?? null,
      issuedById: issuedById ?? null,
    });
  }

  async updateParentSummon(
    id: string,
    data: Partial<ParentSummonRecord>,
  ): Promise<ParentSummonRecord> {
    const updated = await this.repo.updateParentSummon(id, data);
    if (!updated) throw new NotFoundError("Surat Panggilan Orang Tua", id);
    return updated;
  }

  async generateSummonPdf(summonId: string): Promise<Buffer> {
    const summon = await this.repo.findParentSummonById(summonId);
    if (!summon) throw new NotFoundError("Surat Panggilan Orang Tua", summonId);
    const student = await this.repo.findStudentWithClass(summon.studentId);
    if (!student) throw new NotFoundError("Siswa", summon.studentId);
    const infractions = await this.repo.findStudentInfractionsRaw(summon.studentId);
    const balance = calculateDisciplineBalance(infractions);
    const inst = (await this.repo.findInstitution()) || {
      name: "MADRASAH ALIYAH NEGERI SIMMA",
      nsm: "131232010001",
      npsn: "20278910",
      address: "Jl. Pendidikan No. 44",
    };

    return generateParentSummonPdf({
      institution: { name: inst.name, nsm: inst.nsm, npsn: inst.npsn, address: inst.address },
      summon,
      student: { fullName: student.fullName, nisn: student.nisn, nis: student.nis, className: student.className },
      infractionsSummary: {
        totalPoints: balance.infractionPoints,
        netPoints: balance.netPoints,
        items: infractions.slice(0, 5).map((inf) => ({
          date: inf.date,
          title: inf.title,
          category: inf.category,
          points: inf.points,
        })),
      },
    });
  }
}
