import {
  NotFoundError,
  ValidationError,
} from "../../../core/errors/index.js";
import type { GradesRepository } from "../grades.repository.js";
import type {
  SemesterGrade,
  BatchCalculationResponse,
} from "../grades.types.js";
import type {
  CreateSemesterGradeInput,
  UpdateSemesterGradeInput,
  SemesterGradeQueryParams,
  CalculateSemesterGradeInput,
} from "../grades.schema.js";
import { calculateLetterGrade } from "@simma/shared";
import type { PaginatedResponse } from "@simma/shared";

export class SemesterGradesService {
  constructor(private readonly repo: GradesRepository) {}

  async getSemesterGradeById(id: string): Promise<SemesterGrade> {
    const grade = await this.repo.findSemesterGradeById(id);
    if (!grade) {
      throw new NotFoundError("Nilai semester", id);
    }
    return grade;
  }

  async createOrUpsertSemesterGrade(
    input: CreateSemesterGradeInput,
  ): Promise<SemesterGrade> {
    const letterGrade =
      input.letterGrade ?? calculateLetterGrade(input.finalScore);

    return this.repo.upsertSemesterGrade({
      studentId: input.studentId,
      classroomId: input.classroomId,
      subjectId: input.subjectId,
      semesterId: input.semesterId,
      finalScore: input.finalScore,
      letterGrade,
    });
  }

  async updateSemesterGrade(
    id: string,
    input: UpdateSemesterGradeInput,
  ): Promise<SemesterGrade> {
    await this.getSemesterGradeById(id);

    let letterGrade = input.letterGrade;
    if (input.finalScore !== undefined && !letterGrade) {
      letterGrade = calculateLetterGrade(input.finalScore);
    }

    const updated = await this.repo.updateSemesterGrade(id, {
      ...(input.finalScore !== undefined && { finalScore: input.finalScore }),
      ...(letterGrade !== undefined && { letterGrade }),
    });

    if (!updated) {
      throw new NotFoundError("Nilai semester", id);
    }
    return updated;
  }

  async deleteSemesterGrade(id: string): Promise<void> {
    await this.getSemesterGradeById(id);
    const deleted = await this.repo.deleteSemesterGrade(id);
    if (!deleted) {
      throw new NotFoundError("Nilai semester", id);
    }
  }

  async getSemesterGrades(
    query: SemesterGradeQueryParams,
  ): Promise<PaginatedResponse<SemesterGrade>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const { data, total } = await this.repo.findSemesterGrades(query);

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

  async calculateSemesterGrades(
    input: CalculateSemesterGradeInput,
  ): Promise<BatchCalculationResponse> {
    const rawScores = await this.repo.findAssessmentScoresForClassroomSubject(
      input.classroomId,
      input.subjectId,
      input.semesterId,
    );

    if (rawScores.length === 0) {
      return { calculatedCount: 0, grades: [] };
    }

    // Group scores per student and calculate weighted average
    const studentMap = new Map<
      string,
      { totalWeightedScore: number; totalWeight: number }
    >();

    for (const item of rawScores) {
      const current = studentMap.get(item.studentId) ?? {
        totalWeightedScore: 0,
        totalWeight: 0,
      };

      const max = item.maxScore > 0 ? item.maxScore : 100;
      const normalizedScore = (item.score / max) * 100;
      const weight = item.weight > 0 ? item.weight : 1;

      current.totalWeightedScore += normalizedScore * weight;
      current.totalWeight += weight;

      studentMap.set(item.studentId, current);
    }

    const results: SemesterGrade[] = [];

    for (const [studentId, data] of studentMap.entries()) {
      const finalScore =
        data.totalWeight > 0
          ? Math.round((data.totalWeightedScore / data.totalWeight) * 100) / 100
          : 0;

      const letterGrade = calculateLetterGrade(finalScore);

      const saved = await this.repo.upsertSemesterGrade({
        studentId,
        classroomId: input.classroomId,
        subjectId: input.subjectId,
        semesterId: input.semesterId,
        finalScore,
        letterGrade,
      });

      results.push(saved);
    }

    return {
      calculatedCount: results.length,
      grades: results,
    };
  }
}
