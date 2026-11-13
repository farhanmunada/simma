import {
  projectsRepository,
  ProjectsRepository,
} from "./repositories/projects.repository.js";
import {
  targetsRepository,
  TargetsRepository,
} from "./repositories/targets.repository.js";
import {
  assessmentsRepository,
  AssessmentsRepository,
} from "./repositories/assessments.repository.js";

export {
  projectsRepository,
  targetsRepository,
  assessmentsRepository,
  ProjectsRepository,
  TargetsRepository,
  AssessmentsRepository,
};

export class P5raRepository {
  constructor(
    public readonly projects: ProjectsRepository = projectsRepository,
    public readonly targets: TargetsRepository = targetsRepository,
    public readonly assessments: AssessmentsRepository = assessmentsRepository,
  ) {}

  // Projects
  async listProjects(filter: Parameters<ProjectsRepository["listProjects"]>[0]) {
    return this.projects.listProjects(filter);
  }

  async findProjectById(id: string) {
    return this.projects.findProjectById(id);
  }

  async createProject(input: Parameters<ProjectsRepository["createProject"]>[0]) {
    return this.projects.createProject(input);
  }

  async updateProject(
    id: string,
    input: Parameters<ProjectsRepository["updateProject"]>[1],
  ) {
    return this.projects.updateProject(id, input);
  }

  async deleteProject(id: string) {
    return this.projects.deleteProject(id);
  }

  // Targets
  async listProjectTargets(projectId: string) {
    return this.targets.listProjectTargets(projectId);
  }

  async findTargetById(targetId: string) {
    return this.targets.findTargetById(targetId);
  }

  async createTarget(
    projectId: string,
    data: Parameters<TargetsRepository["createTarget"]>[1],
  ) {
    return this.targets.createTarget(projectId, data);
  }

  async updateTarget(
    id: string,
    data: Parameters<TargetsRepository["updateTarget"]>[1],
  ) {
    return this.targets.updateTarget(id, data);
  }

  async deleteTarget(id: string) {
    return this.targets.deleteTarget(id);
  }

  // Assessments & Students
  async listStudentsForProject(projectId: string, classroomId?: string) {
    return this.assessments.listStudentsForProject(projectId, classroomId);
  }

  async listAssessments(projectId: string, classroomId?: string) {
    return this.assessments.listAssessments(projectId, classroomId);
  }

  async batchUpsertAssessments(
    projectId: string,
    items: Parameters<AssessmentsRepository["batchUpsertAssessments"]>[1],
    assessedBy?: string,
  ) {
    return this.assessments.batchUpsertAssessments(projectId, items, assessedBy);
  }

  async getStudentNotes(projectId: string, studentId: string) {
    return this.assessments.getStudentNotes(projectId, studentId);
  }

  async upsertStudentNotes(
    projectId: string,
    studentId: string,
    processNotes: string,
    userId?: string,
  ) {
    return this.assessments.upsertStudentNotes(
      projectId,
      studentId,
      processNotes,
      userId,
    );
  }

  async getStudentReportData(projectId: string, studentId: string) {
    return this.assessments.getStudentReportData(projectId, studentId);
  }
}

export const p5raRepository = new P5raRepository();

