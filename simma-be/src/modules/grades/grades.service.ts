import {
  NotFoundError,
  ValidationError,
} from "../../core/errors/index.js";
import { GradesRepository, gradesRepository } from "./grades.repository.js";
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
  UpdateStudentGradeInput,
  BatchUpsertGradesInput,
  StudentGradeQueryParams,
  CreateSemesterGradeInput,
  UpdateSemesterGradeInput,
  CalculateSemesterGradeInput,
  SemesterGradeQueryParams,
} from "./grades.schema.js";
import { calculateLetterGrade } from "@simma/shared";
import type { PaginatedResponse } from "@simma/shared";

export class GradesService {
  constructor(private readonly repo: GradesRepository = gradesRepository) {}

  // --- Assessments ---

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

  // --- Student Grades ---

  async getStudentGradeById(id: string): Promise<StudentGrade> {
    const grade = await this.repo.findStudentGradeById(id);
    if (!grade) {
      throw new NotFoundError("Nilai siswa", id);
    }
    return grade;
  }

  async createStudentGrade(input: CreateStudentGradeInput): Promise<StudentGrade> {
    await this.getAssessmentById(input.assessmentId);

    return this.repo.upsertStudentGrade({
      assessmentId: input.assessmentId,
      studentId: input.studentId,
      score: input.score,
      feedback: input.feedback ?? null,
    });
  }

  async batchUpsertGrades(input: BatchUpsertGradesInput): Promise<StudentGrade[]> {
    await this.getAssessmentById(input.assessmentId);

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
    await this.getAssessmentById(assessmentId);
    return this.repo.findStudentGradesByAssessmentId(assessmentId);
  }

  // --- Semester Grades ---

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

export const gradesService = new GradesService();
