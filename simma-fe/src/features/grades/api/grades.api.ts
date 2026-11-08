import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
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
import { normalizeAssessmentType } from "../types";

function cleanEndpoint(ep: string): string {
  if (ep.startsWith("/api/v1/")) {
    return ep.replace("/api/v1", "");
  }
  return ep;
}

function extractList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const payload = res as { data?: unknown };
    if (Array.isArray(payload.data)) return payload.data as T[];
  }
  return [];
}

function extractSingle<T>(res: unknown): T {
  if (res && typeof res === "object") {
    const payload = res as { data?: unknown };
    if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
      return payload.data as T;
    }
  }
  return res as T;
}

function extractPaginated<T>(res: unknown): PaginatedResult<T> {
  if (Array.isArray(res)) {
    return {
      data: res,
      meta: { page: 1, limit: res.length, total: res.length, totalPages: 1 },
    };
  }
  if (res && typeof res === "object") {
    const obj = res as { data?: unknown; meta?: PaginatedResult<T>["meta"] };
    const list = Array.isArray(obj.data) ? (obj.data as T[]) : [];
    return {
      data: list,
      meta: obj.meta,
    };
  }
  return { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } };
}

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

  const res = await apiClient<unknown>(cleanEndpoint("/api/v1/grades/assessments"), {
    params: queryParams,
  });
  return extractPaginated<Assessment>(res);
}

export async function getAssessmentById(id: string): Promise<Assessment> {
  const res = await apiClient<unknown>(cleanEndpoint(`/api/v1/grades/assessments/${id}`));
  return extractSingle<Assessment>(res);
}

export async function createAssessment(data: CreateAssessmentDto): Promise<Assessment> {
  const payload = {
    ...data,
    type: normalizeAssessmentType(data.type),
    maxScore: data.maxScore ?? 100,
    weight: data.weight ?? 1,
  };
  const res = await apiClient<unknown>(cleanEndpoint("/api/v1/grades/assessments"), {
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
  const res = await apiClient<unknown>(cleanEndpoint(`/api/v1/grades/assessments/${id}`), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return extractSingle<Assessment>(res);
}

export async function deleteAssessment(id: string): Promise<void> {
  await apiClient<unknown>(cleanEndpoint(`/api/v1/grades/assessments/${id}`), {
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
    cleanEndpoint(`/api/v1/grades/assessments/${assessmentId}/grades`)
  );
  return extractList<StudentGrade>(res);
}

export async function batchUpsertGrades(
  data: BatchUpsertGradesDto
): Promise<StudentGrade[]> {
  const res = await apiClient<unknown>(cleanEndpoint("/api/v1/grades/batch"), {
    method: "POST",
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

  const res = await apiClient<unknown>(cleanEndpoint("/api/v1/grades/semester"), {
    params: queryParams,
  });
  return extractPaginated<SemesterGrade>(res);
}

export async function calculateSemesterGrades(
  data: CalculateSemesterGradesDto
): Promise<BatchCalculationResponse> {
  const res = await apiClient<unknown>(cleanEndpoint("/api/v1/grades/semester/calculate"), {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<BatchCalculationResponse>(res);
}

export async function upsertSemesterGrade(
  data: CreateSemesterGradeDto
): Promise<SemesterGrade> {
  const res = await apiClient<unknown>(cleanEndpoint("/api/v1/grades/semester"), {
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

// ----------------------------------------------------
// 5. HELPER REFERENCE DATA HOOKS
// ----------------------------------------------------

export interface ReferenceItem {
  id: string;
  name?: string;
  code?: string;
  title?: string;
  fullName?: string;
  nisn?: string;
  nis?: string;
}

export function useClassroomsReference() {
  return useQuery({
    queryKey: ["reference", "classrooms"],
    queryFn: async () => {
      const res = await apiClient<unknown>("/settings/classrooms");
      return extractList<ReferenceItem>(res);
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useSubjectsReference() {
  return useQuery({
    queryKey: ["reference", "subjects"],
    queryFn: async () => {
      const res = await apiClient<unknown>("/settings/subjects");
      return extractList<ReferenceItem>(res);
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useSemestersReference() {
  return useQuery({
    queryKey: ["reference", "semesters"],
    queryFn: async () => {
      const res = await apiClient<unknown>("/settings/semesters");
      return extractList<ReferenceItem>(res);
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useAcademicYearsReference() {
  return useQuery({
    queryKey: ["reference", "academic-years"],
    queryFn: async () => {
      const res = await apiClient<unknown>("/settings/academic-years");
      return extractList<ReferenceItem>(res);
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useStudentsByClass(classroomId?: string) {
  return useQuery({
    queryKey: ["reference", "students-by-class", classroomId],
    queryFn: async () => {
      if (!classroomId) return [];
      const res = await apiClient<unknown>("/students", {
        params: { classroomId, limit: 100 },
      });
      return extractList<ReferenceItem>(res);
    },
    enabled: Boolean(classroomId),
  });
}
