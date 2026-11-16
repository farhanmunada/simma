import {
  NotFoundError,
  ValidationError,
} from "../../../core/errors/index.js";
import type { GradesRepository } from "../grades.repository.js";
import type { Assessment } from "../grades.types.js";
import type {
  CreateAssessmentInput,
  UpdateAssessmentInput,
  AssessmentQueryParams,
} from "../grades.schema.js";
import type { PaginatedResponse } from "@simma/shared";

export class AssessmentsService {
  constructor(private readonly repo: GradesRepository) {}

  async getAssessmentById(id: string): Promise<Assessment> {
    const assessment = await this.repo.findAssessmentById(id);
    if (!assessment) {
      throw new NotFoundError("Penilaian", id);
    }
    return assessment;
  }

  async createAssessment(
    input: CreateAssessmentInput,
    authTeacherId?: string | null,
  ): Promise<Assessment> {
    const teacherId = input.teacherId ?? authTeacherId ?? null;

    return this.repo.createAssessment({
      subjectId: input.subjectId,
      classroomId: input.classroomId,
      teacherId,
      academicYearId: input.academicYearId,
      semesterId: input.semesterId,
      type: input.type,
      title: input.title,
      maxScore: input.maxScore,
      weight: input.weight,
    });
  }

  async updateAssessment(
    id: string,
    input: UpdateAssessmentInput,
  ): Promise<Assessment> {
    await this.getAssessmentById(id);

    const updated = await this.repo.updateAssessment(id, {
      ...(input.subjectId !== undefined && { subjectId: input.subjectId }),
      ...(input.classroomId !== undefined && { classroomId: input.classroomId }),
      ...(input.teacherId !== undefined && { teacherId: input.teacherId }),
      ...(input.academicYearId !== undefined && {
        academicYearId: input.academicYearId,
      }),
      ...(input.semesterId !== undefined && { semesterId: input.semesterId }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.title !== undefined && { title: input.title }),
      ...(input.maxScore !== undefined && { maxScore: input.maxScore }),
      ...(input.weight !== undefined && { weight: input.weight }),
    });

    if (!updated) {
      throw new NotFoundError("Penilaian", id);
    }
    return updated;
  }

  async deleteAssessment(id: string): Promise<void> {
    await this.getAssessmentById(id);

    const hasGrades = await this.repo.hasGradesForAssessment(id);
    if (hasGrades) {
      throw new ValidationError(
        "Tidak dapat menghapus penilaian yang sudah memiliki nilai siswa",
      );
    }

    const deleted = await this.repo.deleteAssessment(id);
    if (!deleted) {
      throw new NotFoundError("Penilaian", id);
    }
  }

  async getAssessments(
    query: AssessmentQueryParams,
  ): Promise<PaginatedResponse<Assessment>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { data, total } = await this.repo.findAssessments(query);

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
}
