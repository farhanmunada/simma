import crypto from "node:crypto";
import { NotFoundError } from "../../core/errors/index.js";
import { EmisRepository } from "./emis.repository.js";
import {
  validateStudent,
  validateTeacher,
  validateClassroom,
  validateInstitution,
  calculateReadiness,
} from "./emis.validator.js";
import {
  formatEmisStudentsCsv,
  formatEmisTeachersCsv,
  formatEmisClassroomsCsv,
  formatEmisInstitutionCsv,
} from "./emis.csv.js";
import { generateEmisBapPdf } from "./emis.pdf.js";
import type {
  EmisAuditQuery,
  EmisExportQuery,
  EmisBapCreateInput,
  EmisBapApprovalInput,
} from "./emis.schema.js";
import type {
  EmisReadinessSummary,
  EmisAnomalyItem,
  EmisStudentExportRow,
  EmisTeacherExportRow,
  EmisClassroomExportRow,
  EmisBapRecord,
} from "./emis.types.js";

export class EmisService {
  constructor(private repo = new EmisRepository()) {}

  async getAuditReadiness(query?: EmisAuditQuery): Promise<{
    summary: EmisReadinessSummary;
    anomalies: EmisAnomalyItem[];
  }> {
    const [inst, rawStudents, rawTeachers, rawClassrooms] = await Promise.all([
      this.repo.getActiveInstitution(),
      this.repo.getStudentsForEmis(),
      this.repo.getTeachersForEmis(),
      this.repo.getClassroomsForEmis(),
    ]);

    const instResult = validateInstitution(inst);

    let readyStudents = 0;
    const studentAnomalies: EmisAnomalyItem[] = [];
    for (const s of rawStudents) {
      const res = validateStudent(s);
      if (res.isReady) readyStudents++;
      studentAnomalies.push(...res.anomalies);
    }

    let readyTeachers = 0;
    const teacherAnomalies: EmisAnomalyItem[] = [];
    for (const t of rawTeachers) {
      const res = validateTeacher(t);
      if (res.isReady) readyTeachers++;
      teacherAnomalies.push(...res.anomalies);
    }

    let readyClassrooms = 0;
    const classroomAnomalies: EmisAnomalyItem[] = [];
    for (const c of rawClassrooms) {
      const res = validateClassroom(c);
      if (res.isReady) readyClassrooms++;
      classroomAnomalies.push(...res.anomalies);
    }

    const studentsReadiness = calculateReadiness(rawStudents.length, readyStudents);
    const teachersReadiness = calculateReadiness(rawTeachers.length, readyTeachers);
    const classroomsReadiness = calculateReadiness(rawClassrooms.length, readyClassrooms);
    const institutionReadiness = calculateReadiness(1, instResult.isReady ? 1 : 0);

    const overallPercentage = Math.round(
      (studentsReadiness.percentage * 0.45) +
      (teachersReadiness.percentage * 0.35) +
      (classroomsReadiness.percentage * 0.15) +
      (institutionReadiness.percentage * 0.05)
    );

    let allAnomalies: EmisAnomalyItem[] = [
      ...instResult.anomalies,
      ...studentAnomalies,
      ...teacherAnomalies,
      ...classroomAnomalies,
    ];

    if (query?.entityType && query.entityType !== "all") {
      allAnomalies = allAnomalies.filter((a) => a.entityType === query.entityType);
    }

    if (query?.search) {
      const s = query.search.toLowerCase();
      allAnomalies = allAnomalies.filter(
        (a) =>
          a.name.toLowerCase().includes(s) ||
          a.identifier.toLowerCase().includes(s) ||
          a.issueReason.toLowerCase().includes(s)
      );
    }

    const criticalCount = allAnomalies.filter((a) => a.severity === "critical").length;

    const summary: EmisReadinessSummary = {
      overallPercentage,
      isReadyForExport: criticalCount === 0 && overallPercentage >= 95,
      students: studentsReadiness,
      teachers: teachersReadiness,
      classrooms: classroomsReadiness,
      institution: institutionReadiness,
      totalAnomalies: allAnomalies.length,
      criticalAnomalies: criticalCount,
      warningAnomalies: allAnomalies.length - criticalCount,
    };

    return { summary, anomalies: allAnomalies };
  }

  async exportStudents(query: EmisExportQuery): Promise<string | EmisStudentExportRow[]> {
    const rawStudents = await this.repo.getStudentsForEmis();
    const rows: EmisStudentExportRow[] = rawStudents.map((s, idx) => {
      const mother = s.parents.find((p: any) => p.relationType === "ibu");
      const father = s.parents.find((p: any) => p.relationType === "ayah");
      return {
        no: idx + 1,
        nik: s.nik || "",
        nisn: s.nisn || "",
        nis: s.nis || "",
        fullName: s.fullName,
        gender: s.gender === "L" ? "L" : "P",
        birthPlace: s.birthPlace || "",
        birthDate: s.birthDate || "",
        motherName: s.motherName || mother?.name || "",
        motherNik: mother?.nik || "",
        fatherName: father?.name || "",
        fatherNik: father?.nik || "",
        classroomName: s.classroomName || "Belum ada rombel",
        gradeLevel: String(s.gradeLevel || ""),
        status: s.status,
      };
    });

    if (query.format === "json") return rows;
    return formatEmisStudentsCsv(rows);
  }

  async exportTeachers(query: EmisExportQuery): Promise<string | EmisTeacherExportRow[]> {
    const rawTeachers = await this.repo.getTeachersForEmis();
    const rows: EmisTeacherExportRow[] = rawTeachers.map((t, idx) => ({
      no: idx + 1,
      nik: t.nik || "",
      nuptk: t.nuptk || "",
      pegId: t.pegId || "",
      nip: t.nip || "-",
      fullName: t.fullName,
      gender: t.gender === "L" ? "L" : "P",
      birthPlace: t.birthPlace || "",
      birthDate: t.birthDate || "",
      employmentType: t.employmentType || "GTY",
      gtkType: t.gtkType,
      dutyStatus: t.dutyStatus,
      highestEducation: t.highestEducation || "S1",
      major: t.major || "-",
      isCertified: t.isCertified ? "Sudah" : "Belum",
      certificationField: t.certificationField || "-",
      totalJtm: t.totalJtm || 24,
    }));

    if (query.format === "json") return rows;
    return formatEmisTeachersCsv(rows);
  }

  async exportClassrooms(query: EmisExportQuery): Promise<string | EmisClassroomExportRow[]> {
    const rawClassrooms = await this.repo.getClassroomsForEmis();
    const rows: EmisClassroomExportRow[] = rawClassrooms.map((c, idx) => ({
      no: idx + 1,
      classroomName: c.name,
      gradeLevel: c.gradeLevel,
      homeroomTeacherName: c.homeroomTeacherName || "Belum Ditugaskan",
      homeroomTeacherNuptk: c.homeroomTeacherNuptk || "-",
      studentCount: c.studentCount,
      capacity: c.capacity,
    }));

    if (query.format === "json") return rows;
    return formatEmisClassroomsCsv(rows);
  }

  async exportInstitution(query: EmisExportQuery) {
    const inst = await this.repo.getActiveInstitution();
    if (query.format === "json") return inst;
    return formatEmisInstitutionCsv(inst);
  }

  async exportBundle() {
    const [inst, students, teachers, classrooms, audit] = await Promise.all([
      this.repo.getActiveInstitution(),
      this.repo.getStudentsForEmis(),
      this.repo.getTeachersForEmis(),
      this.repo.getClassroomsForEmis(),
      this.getAuditReadiness(),
    ]);

    return {
      metadata: {
        system: "SIMMA EMIS 4.0 Exporter",
        exportDate: new Date().toISOString(),
        institution: inst.name,
        nsm: inst.nsm,
        npsn: inst.npsn,
        academicYear: inst.academicYear,
        semester: inst.semester,
        readinessScore: audit.summary.overallPercentage,
      },
      institution: inst,
      summary: audit.summary,
      counts: {
        students: students.length,
        teachers: teachers.length,
        classrooms: classrooms.length,
      },
    };
  }

  async createBapDraft(input: EmisBapCreateInput, operatorName: string): Promise<EmisBapRecord> {
    const [inst, rawStudents, rawTeachers, rawClassrooms, audit] = await Promise.all([
      this.repo.getActiveInstitution(),
      this.repo.getStudentsForEmis(),
      this.repo.getTeachersForEmis(),
      this.repo.getClassroomsForEmis(),
      this.getAuditReadiness(),
    ]);

    const totalStudents = rawStudents.length;
    const maleStudents = rawStudents.filter((s) => s.gender === "L").length;
    const femaleStudents = totalStudents - maleStudents;

    const totalTeachers = rawTeachers.length;
    const pnsTeachers = rawTeachers.filter((t) => t.employmentType === "PNS").length;
    const nonPnsTeachers = totalTeachers - pnsTeachers;

    const serial = Math.floor(1000 + Math.random() * 9000);
    const bapNumber = `BAP-EMIS/${new Date().getFullYear()}/${inst.semester === "Ganjil" ? "1" : "2"}/${serial}`;

    const bap: EmisBapRecord = {
      id: crypto.randomUUID(),
      bapNumber,
      academicYear: inst.academicYear,
      semester: inst.semester,
      totalStudents,
      maleStudents,
      femaleStudents,
      totalTeachers,
      pnsTeachers,
      nonPnsTeachers,
      totalClassrooms: rawClassrooms.length,
      readinessPercentage: audit.summary.overallPercentage,
      status: "draft",
      headmasterName: inst.headmasterName,
      operatorName: operatorName || "Operator EMIS",
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };

    return this.repo.saveBap(bap);
  }

  async approveBap(id: string, input: EmisBapApprovalInput, approverName: string): Promise<EmisBapRecord> {
    const bap = await this.repo.findBapById(id);
    if (!bap) throw new NotFoundError("Berita Acara Pendataan (BAP) tidak ditemukan");

    bap.status = input.approved ? "approved" : "draft";
    bap.headmasterName = approverName || bap.headmasterName;
    bap.signedAt = input.approved ? new Date().toISOString() : undefined;
    if (input.notes) bap.notes = input.notes;

    return this.repo.saveBap(bap);
  }

  async getBapPdf(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const bap = await this.repo.findBapById(id);
    if (!bap) throw new NotFoundError("Berita Acara Pendataan (BAP) tidak ditemukan");

    const inst = await this.repo.getActiveInstitution();
    const buffer = generateEmisBapPdf(bap, inst);
    const filename = `BAP_EMIS_${bap.bapNumber.replace(/\//g, "-")}.pdf`;

    return { buffer, filename };
  }

  async listBaps(): Promise<EmisBapRecord[]> {
    return this.repo.listBapRecords();
  }
}
