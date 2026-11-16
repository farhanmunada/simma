import { GradesRepository, gradesRepository } from "./grades.repository.js";
import { AssessmentsService } from "./services/assessments.service.js";
import { StudentGradesService } from "./services/student-grades.service.js";
import { SemesterGradesService } from "./services/semester-grades.service.js";
import type {
  Assessment,
  StudentGrade,
  SemesterGrade,
  BatchCalculationResponse,
} from "./grades.types.js";
import type {
  CreateAssessmentInput,
  UpdateAssessmentInput,
  AssessmentQueryParams,
  CreateStudentGradeInput,
  BatchUpsertGradesInput,
  UpdateStudentGradeInput,
  StudentGradeQueryParams,
  CreateSemesterGradeInput,
  UpdateSemesterGradeInput,
  SemesterGradeQueryParams,
  CalculateSemesterGradeInput,
} from "./grades.schema.js";
import type { PaginatedResponse } from "@simma/shared";

export { AssessmentsService } from "./services/assessments.service.js";
export { StudentGradesService } from "./services/student-grades.service.js";
export { SemesterGradesService } from "./services/semester-grades.service.js";

export class GradesService {
  private readonly assessmentsService: AssessmentsService;
  private readonly studentGradesService: StudentGradesService;
  private readonly semesterGradesService: SemesterGradesService;

  constructor(private readonly repo: GradesRepository = gradesRepository) {
    this.assessmentsService = new AssessmentsService(this.repo);
    this.studentGradesService = new StudentGradesService(this.repo);
    this.semesterGradesService = new SemesterGradesService(this.repo);
  }

  // ---------------------------------------------------------------------------
  // Assessments
  // ---------------------------------------------------------------------------

  async getAssessmentById(id: string): Promise<Assessment> {
    return this.assessmentsService.getAssessmentById(id);
  }

  async createAssessment(
    input: CreateAssessmentInput,
    authTeacherId?: string | null,
  ): Promise<Assessment> {
    return this.assessmentsService.createAssessment(input, authTeacherId);
  }

  async updateAssessment(
    id: string,
    input: UpdateAssessmentInput,
  ): Promise<Assessment> {
    return this.assessmentsService.updateAssessment(id, input);
  }

  async deleteAssessment(id: string): Promise<void> {
    return this.assessmentsService.deleteAssessment(id);
  }

  async getAssessments(
    query: AssessmentQueryParams,
  ): Promise<PaginatedResponse<Assessment>> {
    return this.assessmentsService.getAssessments(query);
  }

  // ---------------------------------------------------------------------------
  // Student Grades
  // ---------------------------------------------------------------------------

  async getStudentGradeById(id: string): Promise<StudentGrade> {
    return this.studentGradesService.getStudentGradeById(id);
  }

  async createStudentGrade(input: CreateStudentGradeInput): Promise<StudentGrade> {
    return this.studentGradesService.createStudentGrade(input);
  }

  async batchUpsertGrades(input: BatchUpsertGradesInput): Promise<StudentGrade[]> {
    return this.studentGradesService.batchUpsertGrades(input);
  }

  async updateStudentGrade(
    id: string,
    input: UpdateStudentGradeInput,
  ): Promise<StudentGrade> {
    return this.studentGradesService.updateStudentGrade(id, input);
  }

  async deleteStudentGrade(id: string): Promise<void> {
    return this.studentGradesService.deleteStudentGrade(id);
  }

  async getStudentGrades(
    query: StudentGradeQueryParams,
  ): Promise<PaginatedResponse<StudentGrade>> {
    return this.studentGradesService.getStudentGrades(query);
  }

  async getGradesByAssessmentId(assessmentId: string): Promise<StudentGrade[]> {
    return this.studentGradesService.getGradesByAssessmentId(assessmentId);
  }

  // ---------------------------------------------------------------------------
  // Semester Grades
  // ---------------------------------------------------------------------------

  async getSemesterGradeById(id: string): Promise<SemesterGrade> {
    return this.semesterGradesService.getSemesterGradeById(id);
  }

  async createOrUpsertSemesterGrade(
    input: CreateSemesterGradeInput,
  ): Promise<SemesterGrade> {
    return this.semesterGradesService.createOrUpsertSemesterGrade(input);
  }

  async updateSemesterGrade(
    id: string,
    input: UpdateSemesterGradeInput,
  ): Promise<SemesterGrade> {
    return this.semesterGradesService.updateSemesterGrade(id, input);
  }

  async deleteSemesterGrade(id: string): Promise<void> {
    return this.semesterGradesService.deleteSemesterGrade(id);
  }

  async getSemesterGrades(
    query: SemesterGradeQueryParams,
  ): Promise<PaginatedResponse<SemesterGrade>> {
    return this.semesterGradesService.getSemesterGrades(query);
  }

  async calculateSemesterGrades(
    input: CalculateSemesterGradeInput,
  ): Promise<BatchCalculationResponse> {
    return this.semesterGradesService.calculateSemesterGrades(input);
  }
}

export const gradesService = new GradesService();
