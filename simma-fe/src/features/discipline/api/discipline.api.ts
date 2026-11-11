import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type {
  DisciplineRuleItem,
  StudentInfractionItem,
  CounselingSessionItem,
  ParentSummonItem,
  StudentDisciplineSummaryItem,
} from "../types";
import type {
  CreateDisciplineRuleInput,
  UpdateDisciplineRuleInput,
  CreateStudentInfractionInput,
  UpdateInfractionApprovalInput,
  QueryStudentInfractionsInput,
  CreateCounselingSessionInput,
  UpdateCounselingSessionInput,
  CreateParentSummonInput,
  UpdateParentSummonInput,
} from "@simma/shared";

export const DISCIPLINE_QUERY_KEYS = {
  rules: ["discipline", "rules"] as const,
  infractions: (params?: Record<string, unknown>) => ["discipline", "infractions", params] as const,
  leaderboard: (params?: Record<string, unknown>) => ["discipline", "leaderboard", params] as const,
  studentProfile: (studentId: string) => ["discipline", "student", studentId] as const,
  counseling: (params?: Record<string, unknown>) => ["discipline", "counseling", params] as const,
  summons: (params?: Record<string, unknown>) => ["discipline", "summons", params] as const,
};

// --- Rules ---
export function useDisciplineRules(params?: { type?: string; category?: string }) {
  return useQuery({
    queryKey: [...DISCIPLINE_QUERY_KEYS.rules, params],
    queryFn: () =>
      apiClient<DisciplineRuleItem[]>(API_ENDPOINTS.DISCIPLINE.RULES, {
        params: params as Record<string, string>,
      }),
  });
}

export function useCreateDisciplineRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDisciplineRuleInput) =>
      apiClient<DisciplineRuleItem>(API_ENDPOINTS.DISCIPLINE.RULES, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCIPLINE_QUERY_KEYS.rules });
    },
  });
}

export function useUpdateDisciplineRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDisciplineRuleInput }) =>
      apiClient<DisciplineRuleItem>(API_ENDPOINTS.DISCIPLINE.RULE_DETAIL(id), {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCIPLINE_QUERY_KEYS.rules });
    },
  });
}

export function useDeleteDisciplineRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(API_ENDPOINTS.DISCIPLINE.RULE_DETAIL(id), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCIPLINE_QUERY_KEYS.rules });
    },
  });
}

// --- Infractions ---
export function useStudentInfractions(params?: QueryStudentInfractionsInput) {
  return useQuery({
    queryKey: DISCIPLINE_QUERY_KEYS.infractions(params as any),
    queryFn: () =>
      apiClient<StudentInfractionItem[]>(API_ENDPOINTS.DISCIPLINE.INFRACTIONS, {
        params: params as Record<string, string | number | boolean>,
      }),
  });
}

export function useCreateStudentInfraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudentInfractionInput) =>
      apiClient<{ data: StudentInfractionItem; message: string }>(API_ENDPOINTS.DISCIPLINE.INFRACTIONS, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discipline"] });
    },
  });
}

export function useUpdateInfractionApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInfractionApprovalInput }) =>
      apiClient<StudentInfractionItem>(API_ENDPOINTS.DISCIPLINE.INFRACTION_APPROVAL(id), {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discipline"] });
    },
  });
}

export function useDeleteStudentInfraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(API_ENDPOINTS.DISCIPLINE.INFRACTION_DETAIL(id), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discipline"] });
    },
  });
}

// --- Leaderboard & Profile ---
export function useDisciplineLeaderboard(params?: {
  classroomId?: string;
  type?: "points_highest" | "merits_highest";
  limit?: number;
}) {
  return useQuery({
    queryKey: DISCIPLINE_QUERY_KEYS.leaderboard(params),
    queryFn: () =>
      apiClient<StudentDisciplineSummaryItem[]>(API_ENDPOINTS.DISCIPLINE.LEADERBOARD, {
        params: params as Record<string, string | number>,
      }),
  });
}

export function useStudentDisciplineProfile(studentId: string) {
  return useQuery({
    queryKey: DISCIPLINE_QUERY_KEYS.studentProfile(studentId),
    queryFn: () =>
      apiClient<any>(API_ENDPOINTS.DISCIPLINE.STUDENT_PROFILE(studentId)),
    enabled: !!studentId,
  });
}

// --- Counseling ---
export function useCounselingSessions(params?: {
  studentId?: string;
  counselorId?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: DISCIPLINE_QUERY_KEYS.counseling(params),
    queryFn: () =>
      apiClient<CounselingSessionItem[]>(API_ENDPOINTS.DISCIPLINE.COUNSELING, {
        params: params as Record<string, string>,
      }),
  });
}

export function useCreateCounselingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCounselingSessionInput) =>
      apiClient<CounselingSessionItem>(API_ENDPOINTS.DISCIPLINE.COUNSELING, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discipline", "counseling"] });
    },
  });
}

export function useUpdateCounselingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCounselingSessionInput }) =>
      apiClient<CounselingSessionItem>(API_ENDPOINTS.DISCIPLINE.COUNSELING_DETAIL(id), {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discipline", "counseling"] });
    },
  });
}

export function useDeleteCounselingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(API_ENDPOINTS.DISCIPLINE.COUNSELING_DETAIL(id), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discipline", "counseling"] });
    },
  });
}

// --- Parent Summons ---
export function useParentSummons(params?: { studentId?: string; status?: string }) {
  return useQuery({
    queryKey: DISCIPLINE_QUERY_KEYS.summons(params),
    queryFn: () =>
      apiClient<ParentSummonItem[]>(API_ENDPOINTS.DISCIPLINE.SUMMONS, {
        params: params as Record<string, string>,
      }),
  });
}

export function useCreateParentSummon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateParentSummonInput) =>
      apiClient<ParentSummonItem>(API_ENDPOINTS.DISCIPLINE.SUMMONS, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discipline", "summons"] });
    },
  });
}

export function useUpdateParentSummon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateParentSummonInput }) =>
      apiClient<ParentSummonItem>(API_ENDPOINTS.DISCIPLINE.SUMMON_DETAIL(id), {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discipline", "summons"] });
    },
  });
}

export async function downloadSummonPdf(id: string, letterNumber: string): Promise<void> {
  const blob = await apiClient<Blob>(API_ENDPOINTS.DISCIPLINE.SUMMON_PDF(id), {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Surat-Panggilan-${letterNumber.replace(/[/\\?%*:|"<>]/g, "-")}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
