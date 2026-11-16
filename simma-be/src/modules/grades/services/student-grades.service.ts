import {
  NotFoundError,
  ValidationError,
} from "../../../core/errors/index.js";
import type { GradesRepository } from "../grades.repository.js";
import type { StudentGrade } from "../grades.types.js";
import type {
  CreateStudentGradeInput,
  BatchUpsertGradesInput,
  UpdateStudentGradeInput,
  StudentGradeQueryParams,
} from "../grades.schema.js";
import type { PaginatedResponse } from "@simma/shared";

export class StudentGradesService {
  constructor(private readonly repo: GradesRepository) {}

  async getStudentGradeById(id: string): Promise<StudentGrade> {
    const grade = await this.repo.findStudentGradeById(id);
    if (!grade) {
      throw new NotFoundError("Nilai siswa", id);
    }
    return grade;
  }

  async createStudentGrade(input: CreateStudentGradeInput): Promise<StudentGrade> {
    const assessment = await this.repo.findAssessmentById(input.assessmentId);
    if (!assessment) {
      throw new NotFoundError("Penilaian", input.assessmentId);
    }

    return this.repo.upsertStudentGrade({
      assessmentId: input.assessmentId,
      studentId: input.studentId,
      score: input.score,
      feedback: input.feedback ?? null,
    });
  }

  async batchUpsertGrades(input: BatchUpsertGradesInput): Promise<StudentGrade[]> {
    const assessment = await this.repo.findAssessmentById(input.assessmentId);
    if (!assessment) {
      throw new NotFoundError("Penilaian", input.assessmentId);
    }

    return this.repo.batchUpsertStudentGrades(input.assessmentId, input.grades);
  }

  async updateStudentGrade(
    id: string,
    input: UpdateStudentGradeInput,
  ): Promise<StudentGrade> {
    await this.getStudentGradeById(id);

    const updated = await this.repo.updateStudentGrade(id, {
      ...(input.score !== undefined && { score: input.score }),
      ...(input.feedback !== undefined && { feedback: input.feedback }),
    });

    if (!updated) {
      throw new NotFoundError("Nilai siswa", id);
    }
    return updated;
  }

  async deleteStudentGrade(id: string): Promise<void> {
    await this.getStudentGradeById(id);
    const deleted = await this.repo.deleteStudentGrade(id);
    if (!deleted) {
      throw new NotFoundError("Nilai siswa", id);
    }
  }

  async getStudentGrades(
    query: StudentGradeQueryParams,
  ): Promise<PaginatedResponse<StudentGrade>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const { data, total } = await this.repo.findStudentGrades(query);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getGradesByAssessmentId(assessmentId: string): Promise<StudentGrade[]> {
    const assessment = await this.repo.findAssessmentById(assessmentId);
    if (!assessment) {
      throw new NotFoundError("Penilaian", assessmentId);
    }
    return this.repo.findStudentGradesByAssessmentId(assessmentId);
  }
}
