import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type {
  Assessment,
  CreateAssessmentDto,
  UpdateAssessmentDto,
  AssessmentQueryParams,
  StudentGrade,
  BatchUpsertGradesDto,
  SemesterGrade,
  CreateSemesterGradeDto,
  CalculateSemesterGradesDto,
  SemesterGradeQueryParams,
  BatchCalculationResponse,
  PaginatedResult,
} from "../types";
import { normalizeAssessmentType } from "../utils/grade-helpers";
import {
  extractList,
  extractSingle,
  extractPaginated,
} from "../utils/extractors";

export {
  useClassroomsReference,
  useSubjectsReference,
  useSemestersReference,
  useAcademicYearsReference,
  useStudentsByClass,
} from "../hooks/useGradesReferences";
export type { ReferenceItem } from "../hooks/useGradesReferences";

// ----------------------------------------------------
// 1. ASSESSMENTS API
// ----------------------------------------------------

export async function getAssessments(
  params?: AssessmentQueryParams
): Promise<PaginatedResult<Assessment>> {
  const queryParams: Record<string, string | number | boolean | undefined | null> = {};
  if (params) {
    if (params.subjectId) queryParams.subjectId = params.subjectId;
    if (params.classroomId) queryParams.classroomId = params.classroomId;
    if (params.teacherId) queryParams.teacherId = params.teacherId;
    if (params.academicYearId) queryParams.academicYearId = params.academicYearId;
    if (params.semesterId) queryParams.semesterId = params.semesterId;
    if (params.type) queryParams.type = normalizeAssessmentType(params.type);
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.limit !== undefined) queryParams.limit = params.limit;
  }

  const res = await apiClient<unknown>(API_ENDPOINTS.GRADES.ASSESSMENTS, {
    params: queryParams,
  });
  return extractPaginated<Assessment>(res);
}

export async function getAssessmentById(id: string): Promise<Assessment> {
  const res = await apiClient<unknown>(API_ENDPOINTS.GRADES.ASSESSMENT_DETAIL(id));
  return extractSingle<Assessment>(res);
}

export async function createAssessment(data: CreateAssessmentDto): Promise<Assessment> {
  const payload = {
    ...data,
    type: normalizeAssessmentType(data.type),
    maxScore: data.maxScore ?? 100,
    weight: data.weight ?? 1,
  };
  const res = await apiClient<unknown>(API_ENDPOINTS.GRADES.ASSESSMENTS, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return extractSingle<Assessment>(res);
}

export async function updateAssessment(
  id: string,
  data: UpdateAssessmentDto
): Promise<Assessment> {
  const payload = {
    ...data,
    ...(data.type ? { type: normalizeAssessmentType(data.type) } : {}),
  };
  const res = await apiClient<unknown>(API_ENDPOINTS.GRADES.ASSESSMENT_DETAIL(id), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return extractSingle<Assessment>(res);
}

export async function deleteAssessment(id: string): Promise<void> {
  await apiClient<unknown>(API_ENDPOINTS.GRADES.ASSESSMENT_DETAIL(id), {
    method: "DELETE",
  });
}

// ----------------------------------------------------
// 2. STUDENT GRADES API (PER ASSESSMENT & BATCH)
// ----------------------------------------------------

export async function getGradesByAssessmentId(
  assessmentId: string
): Promise<StudentGrade[]> {
  const res = await apiClient<unknown>(
    API_ENDPOINTS.GRADES.ASSESSMENT_GRADES(assessmentId)
  );
  return extractList<StudentGrade>(res);
}

export async function batchUpsertGrades(
  data: BatchUpsertGradesDto
): Promise<StudentGrade[]> {
  const res = await apiClient<unknown>(API_ENDPOINTS.GRADES.BATCH_UPSERT, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return extractList<StudentGrade>(res);
}

// ----------------------------------------------------
// 3. SEMESTER GRADES API
// ----------------------------------------------------

export async function getSemesterGrades(
  params?: SemesterGradeQueryParams
): Promise<PaginatedResult<SemesterGrade>> {
  const queryParams: Record<string, string | number | boolean | undefined | null> = {};
  if (params) {
    if (params.classroomId) queryParams.classroomId = params.classroomId;
    if (params.subjectId) queryParams.subjectId = params.subjectId;
    if (params.semesterId) queryParams.semesterId = params.semesterId;
    if (params.studentId) queryParams.studentId = params.studentId;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.limit !== undefined) queryParams.limit = params.limit;
  }

  const res = await apiClient<unknown>(API_ENDPOINTS.GRADES.SEMESTER, {
    params: queryParams,
  });
  return extractPaginated<SemesterGrade>(res);
}

export async function calculateSemesterGrades(
  data: CalculateSemesterGradesDto
): Promise<BatchCalculationResponse> {
  const res = await apiClient<unknown>(API_ENDPOINTS.GRADES.SEMESTER_CALCULATE, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<BatchCalculationResponse>(res);
}

export async function upsertSemesterGrade(
  data: CreateSemesterGradeDto
): Promise<SemesterGrade> {
  const res = await apiClient<unknown>(API_ENDPOINTS.GRADES.SEMESTER, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<SemesterGrade>(res);
}

// ----------------------------------------------------
// 4. REACT QUERY HOOKS
// ----------------------------------------------------

export function useAssessments(params?: AssessmentQueryParams) {
  return useQuery({
    queryKey: ["grades", "assessments", params],
    queryFn: () => getAssessments(params),
  });
}

export function useAssessmentById(id?: string) {
  return useQuery({
    queryKey: ["grades", "assessments", id],
    queryFn: () => getAssessmentById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssessmentDto) => createAssessment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades", "assessments"] });
    },
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssessmentDto }) =>
      updateAssessment(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["grades", "assessments"] });
      queryClient.invalidateQueries({ queryKey: ["grades", "assessments", vars.id] });
    },
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAssessment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades", "assessments"] });
    },
  });
}

export function useGradesByAssessmentId(assessmentId?: string) {
  return useQuery({
    queryKey: ["grades", "assessment-grades", assessmentId],
    queryFn: () => getGradesByAssessmentId(assessmentId!),
    enabled: Boolean(assessmentId),
  });
}

export function useBatchUpsertGrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BatchUpsertGradesDto) => batchUpsertGrades(data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["grades", "assessment-grades", vars.assessmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["grades", "semester"] });
    },
  });
}

export function useSemesterGrades(params?: SemesterGradeQueryParams) {
  return useQuery({
    queryKey: ["grades", "semester", params],
    queryFn: () => getSemesterGrades(params),
    enabled: Boolean(params?.classroomId || params?.subjectId || params?.semesterId),
  });
}

export function useCalculateSemesterGrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CalculateSemesterGradesDto) => calculateSemesterGrades(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades", "semester"] });
    },
  });
}

export function useUpsertSemesterGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSemesterGradeDto) => upsertSemesterGrade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades", "semester"] });
    },
  });
}
