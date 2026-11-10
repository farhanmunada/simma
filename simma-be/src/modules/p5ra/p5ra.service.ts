import { NotFoundError, ValidationError } from "../../core/errors/index.js";
import { p5raRepository, P5raRepository } from "./p5ra.repository.js";
import type {
  CreateP5raProjectInput,
  UpdateP5raProjectInput,
  CreateP5raTargetInput,
  UpdateP5raTargetInput,
  BatchP5raAssessmentItemInput,
  P5raProjectQueryInput,
} from "./p5ra.schema.js";
import type {
  ProjectRecapData,
  StudentAssessmentRow,
  StudentP5raReportData,
  TargetPredicateRecap,
} from "./p5ra.types.js";
import { P5RA_PREDICATES, type P5raPredicate } from "@simma/shared";

export class P5raService {
  constructor(private readonly repo: P5raRepository = p5raRepository) {}

  async listProjects(query: P5raProjectQueryInput) {
    return this.repo.listProjects(query);
  }

  async getProject(id: string) {
    const project = await this.repo.findProjectById(id);
    if (!project) throw new NotFoundError("Projek P5RA", id);
    const targets = await this.repo.listProjectTargets(id);
    return { ...project, targets };
  }

  async createProject(input: CreateP5raProjectInput) {
    return this.repo.createProject(input);
  }

  async updateProject(id: string, input: UpdateP5raProjectInput) {
    await this.getProject(id);
    const updated = await this.repo.updateProject(id, input);
    if (!updated) throw new NotFoundError("Projek P5RA", id);
    return updated;
  }

  async deleteProject(id: string) {
    await this.getProject(id);
    return this.repo.deleteProject(id);
  }

  async listTargets(projectId: string) {
    await this.getProject(projectId);
    return this.repo.listProjectTargets(projectId);
  }

  async addTarget(projectId: string, input: CreateP5raTargetInput) {
    await this.getProject(projectId);
    return this.repo.createTarget(projectId, {
      ...input,
      projectId,
      element: input.element ?? null,
      subElement: input.subElement ?? null,
      orderIndex: input.orderIndex ?? 0,
    });
  }

  async updateTarget(targetId: string, input: UpdateP5raTargetInput) {
    const existing = await this.repo.findTargetById(targetId);
    if (!existing) throw new NotFoundError("Target Capaian P5RA", targetId);
    const updated = await this.repo.updateTarget(targetId, input);
    return updated!;
  }

  async deleteTarget(targetId: string) {
    const existing = await this.repo.findTargetById(targetId);
    if (!existing) throw new NotFoundError("Target Capaian P5RA", targetId);
    return this.repo.deleteTarget(targetId);
  }

  async getProjectStudents(projectId: string, classroomId?: string) {
    await this.getProject(projectId);
    return this.repo.listStudentsForProject(projectId, classroomId);
  }

  async getAssessments(projectId: string, classroomId?: string) {
    await this.getProject(projectId);
    const targets = await this.repo.listProjectTargets(projectId);
    const studentRows = await this.repo.listStudentsForProject(projectId, classroomId);
    const assessments = await this.repo.listAssessments(projectId, classroomId);

    const assessmentMap = new Map<string, typeof assessments[0]>();
    for (const a of assessments) {
      assessmentMap.set(`${a.studentId}_${a.targetId}`, a);
    }

    const rows: StudentAssessmentRow[] = [];
    for (const { student, classroom } of studentRows) {
      const notes = await this.repo.getStudentNotes(projectId, student.id);
      const studentAssessments: Record<string, typeof assessments[0]> = {};
      for (const t of targets) {
        const item = assessmentMap.get(`${student.id}_${t.id}`);
        if (item) studentAssessments[t.id] = item;
      }
      rows.push({
        student,
        classroom,
        assessments: studentAssessments,
        processNotes: notes?.processNotes ?? null,
      });
    }

    return { targets, rows };
  }

  async saveBatchAssessments(
    projectId: string,
    items: BatchP5raAssessmentItemInput[],
    userId?: string,
  ) {
    await this.getProject(projectId);
    if (items.length === 0) return [];
    return this.repo.batchUpsertAssessments(projectId, items, userId);
  }

  async getStudentNotes(projectId: string, studentId: string) {
    await this.getProject(projectId);
    return this.repo.getStudentNotes(projectId, studentId);
  }

  async saveStudentNotes(
    projectId: string,
    studentId: string,
    notes: string,
    userId?: string,
  ) {
    await this.getProject(projectId);
    return this.repo.upsertStudentNotes(projectId, studentId, notes, userId);
  }

  async generateProcessNotes(projectId: string, studentId: string): Promise<string> {
    const project = await this.getProject(projectId);
    const reportData = await this.repo.getStudentReportData(projectId, studentId);
    if (!reportData) throw new NotFoundError("Data Siswa untuk Rapor P5RA", studentId);

    const validAssessments = reportData.targetsWithAssessment.filter(
      (item) => item.assessment !== null,
    );

    if (validAssessments.length === 0) {
      return `Dalam mengerjakan projek "${project.title}", ananda ${reportData.student.fullName} telah berpartisipasi aktif dalam rangkaian aktivitas yang direncanakan.`;
    }

    const sabList = validAssessments.filter((i) => i.assessment?.predicate === "SAB");
    const bshList = validAssessments.filter((i) => i.assessment?.predicate === "BSH");
    const mbList = validAssessments.filter(
      (i) => i.assessment?.predicate === "MB" || i.assessment?.predicate === "SB",
    );

    const parts: string[] = [];
    parts.push(
      `Dalam menyelesaikan projek "${project.title}" dengan tema ${project.theme}, ${reportData.student.fullName}`,
    );

    if (sabList.length > 0) {
      const dimensions = Array.from(new Set(sabList.map((i) => i.target.dimension))).join(", ");
      parts.push(`sangat berkembang pada dimensi ${dimensions}.`);
    }

    if (bshList.length > 0) {
      const dimensions = Array.from(new Set(bshList.map((i) => i.target.dimension))).join(", ");
      parts.push(`Berkembang sesuai harapan pada dimensi ${dimensions}.`);
    }

    if (mbList.length > 0) {
      const targets = mbList.map((i) => i.target.targetDescription).join("; ");
      parts.push(`Perlu bimbingan dan dorongan lebih lanjut pada capaian: ${targets}.`);
    }

    const generated = parts.join(" ");
    await this.repo.upsertStudentNotes(projectId, studentId, generated);
    return generated;
  }

  async getStudentReport(
    projectId: string,
    studentId: string,
  ): Promise<StudentP5raReportData> {
    await this.getProject(projectId);
    const data = await this.repo.getStudentReportData(projectId, studentId);
    if (!data) throw new NotFoundError("Rapor P5RA Siswa", studentId);
    return data;
  }

  async getProjectRecap(
    projectId: string,
    classroomId?: string,
  ): Promise<ProjectRecapData> {
    const project = await this.getProject(projectId);
    const targets = await this.repo.listProjectTargets(projectId);
    const studentRows = await this.repo.listStudentsForProject(projectId, classroomId);
    const assessments = await this.repo.listAssessments(projectId, classroomId);

    const totalStudents = studentRows.length;
    const targetMap = new Map<string, { MB: number; SB: number; BSH: number; SAB: number }>();

    for (const t of targets) {
      targetMap.set(t.id, { MB: 0, SB: 0, BSH: 0, SAB: 0 });
    }

    const overallCounts = { MB: 0, SB: 0, BSH: 0, SAB: 0, total: 0 };

    for (const a of assessments) {
      const stats = targetMap.get(a.targetId);
      if (stats && a.predicate in stats) {
        stats[a.predicate as P5raPredicate]++;
        overallCounts[a.predicate as P5raPredicate]++;
        overallCounts.total++;
      }
    }

    const targetRecap: TargetPredicateRecap[] = targets.map((t) => {
      const counts = targetMap.get(t.id) || { MB: 0, SB: 0, BSH: 0, SAB: 0 };
      const total = counts.MB + counts.SB + counts.BSH + counts.SAB;
      return {
        targetId: t.id,
        dimension: t.dimension,
        element: t.element ?? "",
        subElement: t.subElement ?? "",
        valuePra: t.valuePra,
        counts: {
          ...counts,
          total,
        },
      };
    });

    return {
      project,
      totalStudents,
      targetRecap,
      overallCounts,
    };
  }
}

export const p5raService = new P5raService();
