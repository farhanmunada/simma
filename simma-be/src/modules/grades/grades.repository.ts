import type {
  Assessment,
  NewAssessment,
  StudentGrade,
  NewStudentGrade,
  SemesterGrade,
  NewSemesterGrade,
} from "./grades.types.js";
import type {
  AssessmentQueryParams,
  StudentGradeQueryParams,
  SemesterGradeQueryParams,
} from "./grades.schema.js";
import {
  AssessmentsRepository,
  assessmentsRepository,
} from "./repositories/assessments.repository.js";
import {
  StudentGradesRepository,
  studentGradesRepository,
} from "./repositories/student-grades.repository.js";
import {
  SemesterGradesRepository,
  semesterGradesRepository,
} from "./repositories/semester-grades.repository.js";

export class GradesRepository {
  constructor(
    private readonly assessmentsRepo: AssessmentsRepository = assessmentsRepository,
    private readonly studentGradesRepo: StudentGradesRepository = studentGradesRepository,
    private readonly semesterGradesRepo: SemesterGradesRepository = semesterGradesRepository,
  ) {}

  // --- Assessments ---
  async findAssessmentById(id: string): Promise<Assessment | null> {
    return this.assessmentsRepo.findAssessmentById(id);
  }

  async createAssessment(data: NewAssessment): Promise<Assessment> {
    return this.assessmentsRepo.createAssessment(data);
  }

  async updateAssessment(
    id: string,
    data: Partial<NewAssessment>,
  ): Promise<Assessment | null> {
    return this.assessmentsRepo.updateAssessment(id, data);
  }

  async deleteAssessment(id: string): Promise<boolean> {
    return this.assessmentsRepo.deleteAssessment(id);
  }

  async hasGradesForAssessment(assessmentId: string): Promise<boolean> {
    return this.assessmentsRepo.hasGradesForAssessment(assessmentId);
  }

  async findAssessments(
    params: AssessmentQueryParams,
  ): Promise<{ data: Assessment[]; total: number }> {
    return this.assessmentsRepo.findAssessments(params);
  }

  // --- Student Grades ---
  async findStudentGradeById(id: string): Promise<StudentGrade | null> {
    return this.studentGradesRepo.findStudentGradeById(id);
  }

  async findStudentGradeByAssessmentAndStudent(
    assessmentId: string,
    studentId: string,
  ): Promise<StudentGrade | null> {
    return this.studentGradesRepo.findStudentGradeByAssessmentAndStudent(
      assessmentId,
      studentId,
    );
  }

  async createStudentGrade(data: NewStudentGrade): Promise<StudentGrade> {
    return this.studentGradesRepo.createStudentGrade(data);
  }

  async upsertStudentGrade(data: NewStudentGrade): Promise<StudentGrade> {
    return this.studentGradesRepo.upsertStudentGrade(data);
  }

  async batchUpsertStudentGrades(
    assessmentId: string,
    items: Array<{ studentId: string; score: number; feedback?: string | null }>,
  ): Promise<StudentGrade[]> {
    return this.studentGradesRepo.batchUpsertStudentGrades(assessmentId, items);
  }

  async updateStudentGrade(
    id: string,
    data: Partial<NewStudentGrade>,
  ): Promise<StudentGrade | null> {
    return this.studentGradesRepo.updateStudentGrade(id, data);
  }

  async deleteStudentGrade(id: string): Promise<boolean> {
    return this.studentGradesRepo.deleteStudentGrade(id);
  }

  async findStudentGrades(
    params: StudentGradeQueryParams,
  ): Promise<{ data: StudentGrade[]; total: number }> {
    return this.studentGradesRepo.findStudentGrades(params);
  }

  async findStudentGradesByAssessmentId(
    assessmentId: string,
  ): Promise<StudentGrade[]> {
    return this.studentGradesRepo.findStudentGradesByAssessmentId(assessmentId);
  }

  // --- Semester Grades ---
  async findSemesterGradeById(id: string): Promise<SemesterGrade | null> {
    return this.semesterGradesRepo.findSemesterGradeById(id);
  }

  async createSemesterGrade(data: NewSemesterGrade): Promise<SemesterGrade> {
    return this.semesterGradesRepo.createSemesterGrade(data);
  }

  async upsertSemesterGrade(data: NewSemesterGrade): Promise<SemesterGrade> {
    return this.semesterGradesRepo.upsertSemesterGrade(data);
  }

  async batchUpsertSemesterGrades(items: NewSemesterGrade[]): Promise<SemesterGrade[]> {
    return this.semesterGradesRepo.batchUpsertSemesterGrades(items);
  }

  async updateSemesterGrade(
    id: string,
    data: Partial<NewSemesterGrade>,
  ): Promise<SemesterGrade | null> {
    return this.semesterGradesRepo.updateSemesterGrade(id, data);
  }

  async deleteSemesterGrade(id: string): Promise<boolean> {
    return this.semesterGradesRepo.deleteSemesterGrade(id);
  }

  async findSemesterGrades(
    params: SemesterGradeQueryParams,
  ): Promise<{ data: SemesterGrade[]; total: number }> {
    return this.semesterGradesRepo.findSemesterGrades(params);
  }

  async findAssessmentScoresForClassroomSubject(
    classroomId: string,
    subjectId: string,
    semesterId: string,
  ): Promise<
    Array<{
      studentId: string;
      score: number;
      maxScore: number;
      weight: number;
    }>
  > {
    return this.semesterGradesRepo.findAssessmentScoresForClassroomSubject(
      classroomId,
      subjectId,
      semesterId,
    );
  }
}

export const gradesRepository = new GradesRepository();
