import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type {
  TeacherListItem,
  TeacherFullDetailDto,
  WorkloadSummaryDto,
  GtkStatsDto,
} from "../types";
import type {
  CreateTeacherFullInput,
  UpdateTeacherFullInput,
  CreateTeacherEducationInput,
  CreateTeacherRankInput,
  CreateTeacherDocumentInput,
  UpsertTeacherWorkloadInput,
  TeacherQueryParams,
} from "@simma/shared";

export const teacherKeys = {
  all: ["teachers"] as const,
  lists: () => [...teacherKeys.all, "list"] as const,
  list: (params: TeacherQueryParams) => [...teacherKeys.lists(), params] as const,
  details: () => [...teacherKeys.all, "detail"] as const,
  detail: (id: string) => [...teacherKeys.details(), id] as const,
  stats: () => [...teacherKeys.all, "stats"] as const,
  workloads: (params?: { academicYearId?: string; semesterId?: string }) =>
    [...teacherKeys.all, "workloads", params] as const,
};

export const useTeachersList = (params: TeacherQueryParams = {}) =>
  useQuery({
    queryKey: teacherKeys.list(params),
    queryFn: () =>
      apiClient<{ data: TeacherListItem[]; total: number }>(API_ENDPOINTS.TEACHERS.LIST, {
        params: params as Record<string, string | number | boolean>,
      }),
  });

export const useTeacherStats = () =>
  useQuery({
    queryKey: teacherKeys.stats(),
    queryFn: () =>
      apiClient<{ data: GtkStatsDto }>(API_ENDPOINTS.TEACHERS.STATS).then((r) => r.data),
  });

export const useTeacherDetail = (id: string) =>
  useQuery({
    queryKey: teacherKeys.detail(id),
    queryFn: () =>
      apiClient<{ data: TeacherFullDetailDto }>(API_ENDPOINTS.TEACHERS.DETAIL(id)).then(
        (r) => r.data
      ),
    enabled: Boolean(id),
  });

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTeacherFullInput) =>
      apiClient<{ data: TeacherFullDetailDto }>(API_ENDPOINTS.TEACHERS.CREATE, {
        method: "POST",
        body: JSON.stringify(body),
      }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all });
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateTeacherFullInput & { id: string }) =>
      apiClient<{ data: TeacherFullDetailDto }>(API_ENDPOINTS.TEACHERS.UPDATE(id), {
        method: "PATCH",
        body: JSON.stringify(body),
      }).then((r) => r.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teacherKeys.stats() });
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(API_ENDPOINTS.TEACHERS.DELETE(id), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all });
    },
  });
};

export const useAddEducation = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTeacherEducationInput) =>
      apiClient<{ data: unknown }>(API_ENDPOINTS.TEACHERS.EDUCATIONS(teacherId), {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) });
    },
  });
};

export const useDeleteEducation = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eduId: string) =>
      apiClient<void>(API_ENDPOINTS.TEACHERS.EDUCATION_DELETE(teacherId, eduId), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) });
    },
  });
};

export const useAddRank = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTeacherRankInput) =>
      apiClient<{ data: unknown }>(API_ENDPOINTS.TEACHERS.RANKS(teacherId), {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) });
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
    },
  });
};

export const useDeleteRank = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rankId: string) =>
      apiClient<void>(API_ENDPOINTS.TEACHERS.RANK_DELETE(teacherId, rankId), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) });
    },
  });
};

export const useAddDocument = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTeacherDocumentInput) =>
      apiClient<{ data: unknown }>(API_ENDPOINTS.TEACHERS.DOCUMENTS(teacherId), {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) });
    },
  });
};

export const useDeleteDocument = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) =>
      apiClient<void>(API_ENDPOINTS.TEACHERS.DOCUMENT_DELETE(teacherId, docId), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.detail(teacherId) });
    },
  });
};

export const useTeacherWorkloads = (params?: { academicYearId?: string; semesterId?: string }) =>
  useQuery({
    queryKey: teacherKeys.workloads(params),
    queryFn: () =>
      apiClient<{ data: WorkloadSummaryDto[] }>(API_ENDPOINTS.TEACHERS.WORKLOADS, {
        params: params as Record<string, string>,
      }).then((r) => r.data),
  });

export const useUpsertTeacherWorkload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpsertTeacherWorkloadInput) =>
      apiClient<{ data: unknown }>(API_ENDPOINTS.TEACHERS.WORKLOAD_UPSERT, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.workloads() });
      queryClient.invalidateQueries({ queryKey: teacherKeys.lists() });
    },
  });
};

export const fetchEmisGtkData = () =>
  apiClient<{ data: unknown[] }>(API_ENDPOINTS.TEACHERS.EMIS_EXPORT).then((r) => r.data);

