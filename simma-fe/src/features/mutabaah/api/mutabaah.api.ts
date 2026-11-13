import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type {
  MutabaahActivityDto,
  ClassroomDailyChecklistResponseDto,
  MutabaahUzurRecordDto,
  StudentComplianceSummary,
  EarlyWarningAlert,
} from "../types";
import type {
  CreateMutabaahActivityInput,
  UpdateMutabaahActivityInput,
  BatchUpsertMutabaahEntriesInput,
  CreateMutabaahUzurRecordInput,
  QueryComplianceInput,
} from "@simma/shared";

export const mutabaahKeys = {
  all: ["mutabaah"] as const,
  activities: (category?: string) => [...mutabaahKeys.all, "activities", { category }] as const,
  checklist: (params: { date: string; classroomId?: string }) =>
    [...mutabaahKeys.all, "checklist", params] as const,
  uzur: (studentId?: string) => [...mutabaahKeys.all, "uzur", { studentId }] as const,
  compliance: (params: QueryComplianceInput) =>
    [...mutabaahKeys.all, "compliance", params] as const,
  earlyWarnings: (classroomId?: string) =>
    [...mutabaahKeys.all, "early-warnings", { classroomId }] as const,
};

export const useMutabaahActivities = (category?: string) =>
  useQuery({
    queryKey: mutabaahKeys.activities(category),
    queryFn: () =>
      apiClient<MutabaahActivityDto[]>(API_ENDPOINTS.MUTABAAH.ACTIVITIES, {
        params: category ? { category } : undefined,
      }),
  });

export const useCreateMutabaahActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMutabaahActivityInput) =>
      apiClient<MutabaahActivityDto>(API_ENDPOINTS.MUTABAAH.ACTIVITIES, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mutabaahKeys.activities() });
    },
  });
};

export const useUpdateMutabaahActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateMutabaahActivityInput & { id: string }) =>
      apiClient<MutabaahActivityDto>(API_ENDPOINTS.MUTABAAH.ACTIVITY_DETAIL(id), {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mutabaahKeys.activities() });
    },
  });
};

export const useDeleteMutabaahActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(API_ENDPOINTS.MUTABAAH.ACTIVITY_DETAIL(id), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mutabaahKeys.activities() });
    },
  });
};

export const useDailyChecklist = (params: { date: string; classroomId?: string }) =>
  useQuery({
    queryKey: mutabaahKeys.checklist(params),
    queryFn: () =>
      apiClient<ClassroomDailyChecklistResponseDto>(API_ENDPOINTS.MUTABAAH.CHECKLIST, {
        params,
      }),
    enabled: Boolean(params.date),
  });

export const useSaveDailyChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: BatchUpsertMutabaahEntriesInput) =>
      apiClient<{ count: number; date: string }>(API_ENDPOINTS.MUTABAAH.CHECKLIST, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: mutabaahKeys.checklist({ date: variables.date }),
      });
      queryClient.invalidateQueries({ queryKey: mutabaahKeys.all });
    },
  });
};

export const useUzurRecords = (studentId?: string) =>
  useQuery({
    queryKey: mutabaahKeys.uzur(studentId),
    queryFn: () =>
      apiClient<MutabaahUzurRecordDto[]>(API_ENDPOINTS.MUTABAAH.UZUR, {
        params: studentId ? { studentId } : undefined,
      }),
  });

export const useCreateUzurRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMutabaahUzurRecordInput) =>
      apiClient<MutabaahUzurRecordDto>(API_ENDPOINTS.MUTABAAH.UZUR, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mutabaahKeys.all });
    },
  });
};

export const useDeleteUzurRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(API_ENDPOINTS.MUTABAAH.UZUR_DETAIL(id), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mutabaahKeys.all });
    },
  });
};

export const useComplianceRecap = (params: QueryComplianceInput) =>
  useQuery({
    queryKey: mutabaahKeys.compliance(params),
    queryFn: () =>
      apiClient<StudentComplianceSummary[]>(API_ENDPOINTS.MUTABAAH.COMPLIANCE, {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          classroomId: params.classroomId,
          studentId: params.studentId,
        },
      }),
    enabled: Boolean(params.startDate && params.endDate),
  });

export const useEarlyWarnings = (classroomId?: string) =>
  useQuery({
    queryKey: mutabaahKeys.earlyWarnings(classroomId),
    queryFn: () =>
      apiClient<EarlyWarningAlert[]>(API_ENDPOINTS.MUTABAAH.EARLY_WARNINGS, {
        params: classroomId ? { classroomId } : undefined,
      }),
  });

export async function fetchMonthlyReportPdf(
  studentId: string,
  month: number,
  year: number
): Promise<Blob> {
  return apiClient<Blob>(API_ENDPOINTS.MUTABAAH.REPORT_PDF(studentId, month, year), {
    responseType: "blob",
  });
}
