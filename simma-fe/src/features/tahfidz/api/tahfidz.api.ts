import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type {
  TahfidzRecord,
  CreateTahfidzRecordDto,
  UpdateTahfidzRecordDto,
  TahfidzQueryParams,
  TasmiExam,
  CreateTasmiExamDto,
  UpdateTasmiExamDto,
  TasmiQueryParams,
  StudentTahfidzProgress,
  StudentTahfidzHistory,
  PaginatedResult,
} from "../types";

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
  return { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } };
}

// ----------------------------------------------------
// 1. TAHFIDZ RECORDS (SETORAN HARIAN)
// ----------------------------------------------------

export async function getTahfidzRecords(
  params?: TahfidzQueryParams
): Promise<PaginatedResult<TahfidzRecord>> {
  const res = await apiClient<unknown>(cleanEndpoint("/api/v1/tahfidz"), {
    params: params as Record<string, string | number | boolean | undefined | null>,
  });
  return extractPaginated<TahfidzRecord>(res);
}

export async function getTahfidzRecordById(id: string): Promise<TahfidzRecord> {
  const res = await apiClient<unknown>(cleanEndpoint(`/api/v1/tahfidz/${id}`));
  return extractSingle<TahfidzRecord>(res);
}

export async function createTahfidzRecord(
  data: CreateTahfidzRecordDto
): Promise<TahfidzRecord> {
  const res = await apiClient<unknown>(cleanEndpoint("/api/v1/tahfidz"), {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<TahfidzRecord>(res);
}

export async function updateTahfidzRecord(
  id: string,
  data: UpdateTahfidzRecordDto
): Promise<TahfidzRecord> {
  const res = await apiClient<unknown>(cleanEndpoint(`/api/v1/tahfidz/${id}`), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return extractSingle<TahfidzRecord>(res);
}

export async function deleteTahfidzRecord(id: string): Promise<void> {
  await apiClient<void>(cleanEndpoint(`/api/v1/tahfidz/${id}`), {
    method: "DELETE",
  });
}

// ----------------------------------------------------
// 2. STUDENT TAHFIDZ HISTORY & PROGRESS
// ----------------------------------------------------

export async function getStudentTahfidzHistory(
  studentId: string
): Promise<StudentTahfidzHistory> {
  const res = await apiClient<unknown>(
    cleanEndpoint(`/api/v1/tahfidz/student/${studentId}`)
  );
  return extractSingle<StudentTahfidzHistory>(res);
}

export async function getStudentTahfidzProgress(
  studentId: string
): Promise<StudentTahfidzProgress> {
  const res = await apiClient<unknown>(
    cleanEndpoint(`/api/v1/tahfidz/student/${studentId}/progress`)
  );
  return extractSingle<StudentTahfidzProgress>(res);
}

// ----------------------------------------------------
// 3. TASMI' EXAMS (UJIAN TASMI')
// ----------------------------------------------------

export async function getTasmiExams(
  params?: TasmiQueryParams
): Promise<PaginatedResult<TasmiExam>> {
  const res = await apiClient<unknown>(cleanEndpoint("/api/v1/tahfidz/tasmi"), {
    params: params as Record<string, string | number | boolean | undefined | null>,
  });
  return extractPaginated<TasmiExam>(res);
}

export async function getTasmiExamById(id: string): Promise<TasmiExam> {
  const res = await apiClient<unknown>(
    cleanEndpoint(`/api/v1/tahfidz/tasmi/${id}`)
  );
  return extractSingle<TasmiExam>(res);
}

export async function createTasmiExam(
  data: CreateTasmiExamDto
): Promise<TasmiExam> {
  const res = await apiClient<unknown>(cleanEndpoint("/api/v1/tahfidz/tasmi"), {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<TasmiExam>(res);
}

export async function updateTasmiExam(
  id: string,
  data: UpdateTasmiExamDto
): Promise<TasmiExam> {
  const res = await apiClient<unknown>(
    cleanEndpoint(`/api/v1/tahfidz/tasmi/${id}`),
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
  return extractSingle<TasmiExam>(res);
}

export async function deleteTasmiExam(id: string): Promise<void> {
  await apiClient<void>(cleanEndpoint(`/api/v1/tahfidz/tasmi/${id}`), {
    method: "DELETE",
  });
}

// ----------------------------------------------------
// TANSTACK QUERY HOOKS
// ----------------------------------------------------

export const tahfidzQueryKeys = {
  all: ["tahfidz"] as const,
  records: (params?: TahfidzQueryParams) =>
    [...tahfidzQueryKeys.all, "records", params] as const,
  recordDetail: (id: string) =>
    [...tahfidzQueryKeys.all, "record", id] as const,
  studentHistory: (studentId: string) =>
    [...tahfidzQueryKeys.all, "student-history", studentId] as const,
  studentProgress: (studentId: string) =>
    [...tahfidzQueryKeys.all, "student-progress", studentId] as const,
  tasmiList: (params?: TasmiQueryParams) =>
    [...tahfidzQueryKeys.all, "tasmi", params] as const,
  tasmiDetail: (id: string) =>
    [...tahfidzQueryKeys.all, "tasmi-detail", id] as const,
};

export function useTahfidzRecords(params?: TahfidzQueryParams) {
  return useQuery({
    queryKey: tahfidzQueryKeys.records(params),
    queryFn: () => getTahfidzRecords(params),
  });
}

export function useTahfidzRecordById(id: string) {
  return useQuery({
    queryKey: tahfidzQueryKeys.recordDetail(id),
    queryFn: () => getTahfidzRecordById(id),
    enabled: Boolean(id),
  });
}

export function useCreateTahfidzRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTahfidzRecordDto) => createTahfidzRecord(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...tahfidzQueryKeys.all, "records"] });
      if (variables.studentId) {
        queryClient.invalidateQueries({
          queryKey: tahfidzQueryKeys.studentProgress(variables.studentId),
        });
        queryClient.invalidateQueries({
          queryKey: tahfidzQueryKeys.studentHistory(variables.studentId),
        });
      }
    },
  });
}

export function useUpdateTahfidzRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTahfidzRecordDto }) =>
      updateTahfidzRecord(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...tahfidzQueryKeys.all, "records"] });
      queryClient.invalidateQueries({
        queryKey: tahfidzQueryKeys.recordDetail(variables.id),
      });
      if (variables.data.studentId) {
        queryClient.invalidateQueries({
          queryKey: tahfidzQueryKeys.studentProgress(variables.data.studentId),
        });
      }
    },
  });
}

export function useDeleteTahfidzRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTahfidzRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...tahfidzQueryKeys.all, "records"] });
      queryClient.invalidateQueries({ queryKey: [...tahfidzQueryKeys.all, "student-progress"] });
    },
  });
}

export function useStudentTahfidzHistory(studentId?: string) {
  return useQuery({
    queryKey: tahfidzQueryKeys.studentHistory(studentId || ""),
    queryFn: () => getStudentTahfidzHistory(studentId!),
    enabled: Boolean(studentId),
  });
}

export function useStudentTahfidzProgress(studentId?: string) {
  return useQuery({
    queryKey: tahfidzQueryKeys.studentProgress(studentId || ""),
    queryFn: () => getStudentTahfidzProgress(studentId!),
    enabled: Boolean(studentId),
  });
}

export function useTasmiExams(params?: TasmiQueryParams) {
  return useQuery({
    queryKey: tahfidzQueryKeys.tasmiList(params),
    queryFn: () => getTasmiExams(params),
  });
}

export function useTasmiExamById(id: string) {
  return useQuery({
    queryKey: tahfidzQueryKeys.tasmiDetail(id),
    queryFn: () => getTasmiExamById(id),
    enabled: Boolean(id),
  });
}

export function useCreateTasmiExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTasmiExamDto) => createTasmiExam(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...tahfidzQueryKeys.all, "tasmi"] });
      if (variables.studentId) {
        queryClient.invalidateQueries({
          queryKey: tahfidzQueryKeys.studentProgress(variables.studentId),
        });
        queryClient.invalidateQueries({
          queryKey: tahfidzQueryKeys.studentHistory(variables.studentId),
        });
      }
    },
  });
}

export function useUpdateTasmiExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTasmiExamDto }) =>
      updateTasmiExam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...tahfidzQueryKeys.all, "tasmi"] });
      queryClient.invalidateQueries({
        queryKey: tahfidzQueryKeys.tasmiDetail(variables.id),
      });
      if (variables.data.studentId) {
        queryClient.invalidateQueries({
          queryKey: tahfidzQueryKeys.studentProgress(variables.data.studentId),
        });
      }
    },
  });
}

export function useDeleteTasmiExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTasmiExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...tahfidzQueryKeys.all, "tasmi"] });
      queryClient.invalidateQueries({ queryKey: [...tahfidzQueryKeys.all, "student-progress"] });
    },
  });
}
