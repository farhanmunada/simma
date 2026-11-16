import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type {
  ExtracurricularItem,
  ExtracurricularMemberItem,
  ExtracurricularGradeItem,
  ExtracurricularStats,
  CreateExtracurricularInput,
  UpdateExtracurricularInput,
  CreateExtracurricularMemberInput,
  UpdateExtracurricularMemberInput,
  UpsertExtracurricularGradeInput,
  BatchUpsertExtracurricularGradesInput,
} from "../types";

export const EXTRACURRICULAR_QUERY_KEYS = {
  stats: ["extracurricular", "stats"] as const,
  list: (params?: Record<string, any>) => ["extracurricular", "list", params] as const,
  detail: (id: string) => ["extracurricular", "detail", id] as const,
  members: (params?: Record<string, any>) => ["extracurricular", "members", params] as const,
  grades: (params?: Record<string, any>) => ["extracurricular", "grades", params] as const,
  studentGrades: (studentId: string, params?: Record<string, any>) =>
    ["extracurricular", "studentGrades", studentId, params] as const,
};

export function useExtracurricularStats() {
  return useQuery({
    queryKey: EXTRACURRICULAR_QUERY_KEYS.stats,
    queryFn: () => apiClient<{ data: ExtracurricularStats }>(API_ENDPOINTS.EXTRACURRICULAR.STATS),
  });
}

export function useExtracurriculars(params?: Record<string, any>) {
  return useQuery({
    queryKey: EXTRACURRICULAR_QUERY_KEYS.list(params),
    queryFn: () =>
      apiClient<{ data: ExtracurricularItem[] }>(API_ENDPOINTS.EXTRACURRICULAR.LIST, {
        params,
      }),
  });
}

export function useExtracurricularDetail(id?: string) {
  return useQuery({
    queryKey: EXTRACURRICULAR_QUERY_KEYS.detail(id ?? ""),
    queryFn: () =>
      apiClient<{ data: ExtracurricularItem }>(API_ENDPOINTS.EXTRACURRICULAR.DETAIL(id!)),
    enabled: Boolean(id),
  });
}

export function useCreateExtracurricular() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExtracurricularInput) =>
      apiClient<{ data: ExtracurricularItem }>(API_ENDPOINTS.EXTRACURRICULAR.LIST, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extracurricular"] });
    },
  });
}

export function useUpdateExtracurricular() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExtracurricularInput }) =>
      apiClient<{ data: ExtracurricularItem }>(API_ENDPOINTS.EXTRACURRICULAR.DETAIL(id), {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extracurricular"] });
    },
  });
}

export function useDeleteExtracurricular() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(API_ENDPOINTS.EXTRACURRICULAR.DETAIL(id), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extracurricular"] });
    },
  });
}

export function useExtracurricularMembers(params?: Record<string, any>) {
  return useQuery({
    queryKey: EXTRACURRICULAR_QUERY_KEYS.members(params),
    queryFn: () =>
      apiClient<{ data: ExtracurricularMemberItem[] }>(API_ENDPOINTS.EXTRACURRICULAR.MEMBERS, {
        params,
      }),
  });
}

export function useRegisterExtracurricularMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExtracurricularMemberInput) =>
      apiClient<{ data: ExtracurricularMemberItem }>(API_ENDPOINTS.EXTRACURRICULAR.MEMBERS, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extracurricular"] });
    },
  });
}

export function useUpdateExtracurricularMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExtracurricularMemberInput }) =>
      apiClient<{ data: ExtracurricularMemberItem }>(API_ENDPOINTS.EXTRACURRICULAR.MEMBER_DETAIL(id), {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extracurricular"] });
    },
  });
}

export function useDeleteExtracurricularMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(API_ENDPOINTS.EXTRACURRICULAR.MEMBER_DETAIL(id), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extracurricular"] });
    },
  });
}

export function useExtracurricularGrades(params?: Record<string, any>) {
  return useQuery({
    queryKey: EXTRACURRICULAR_QUERY_KEYS.grades(params),
    queryFn: () =>
      apiClient<{ data: ExtracurricularGradeItem[] }>(API_ENDPOINTS.EXTRACURRICULAR.GRADES, {
        params,
      }),
  });
}

export function useUpsertExtracurricularGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpsertExtracurricularGradeInput) =>
      apiClient<{ data: ExtracurricularGradeItem }>(API_ENDPOINTS.EXTRACURRICULAR.GRADES, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extracurricular"] });
    },
  });
}

export function useBatchUpsertExtracurricularGrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BatchUpsertExtracurricularGradesInput) =>
      apiClient<{ data: ExtracurricularGradeItem[] }>(API_ENDPOINTS.EXTRACURRICULAR.GRADES_BATCH, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extracurricular"] });
    },
  });
}
