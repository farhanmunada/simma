import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type {
  P5raProjectItem,
  P5raProjectDetail,
  P5raTargetItem,
  StudentAssessmentRow,
  P5raRecapResponse,
  P5raReportViewData,
  P5raStudentAssessmentItem,
} from "../types";

export const p5raQueryKeys = {
  all: ["p5ra"] as const,
  projects: (params?: Record<string, unknown>) => ["p5ra", "projects", params] as const,
  projectDetail: (projectId: string) => ["p5ra", "project", projectId] as const,
  targets: (projectId: string) => ["p5ra", "targets", projectId] as const,
  assessments: (projectId: string, classroomId?: string) =>
    ["p5ra", "assessments", projectId, classroomId] as const,
  recap: (projectId: string, classroomId?: string) =>
    ["p5ra", "recap", projectId, classroomId] as const,
  studentReport: (projectId: string, studentId: string) =>
    ["p5ra", "student-report", projectId, studentId] as const,
};

export async function fetchP5raProjects(params?: {
  academicYearId?: string;
  semesterId?: string;
  theme?: string;
  status?: string;
}): Promise<P5raProjectItem[]> {
  const res = await apiClient<P5raProjectItem[]>(API_ENDPOINTS.P5RA.PROJECTS, {
    params,
  });
  return res ?? [];
}

export async function fetchP5raProjectDetail(projectId: string): Promise<P5raProjectDetail> {
  return apiClient<P5raProjectDetail>(API_ENDPOINTS.P5RA.PROJECT_DETAIL(projectId));
}

export async function createP5raProject(data: {
  academicYearId: string;
  semesterId: string;
  title: string;
  theme: string;
  description: string;
  targetFase?: string;
  classroomIds?: string[];
  startDate?: string;
  endDate?: string;
}): Promise<P5raProjectItem> {
  return apiClient<P5raProjectItem>(API_ENDPOINTS.P5RA.PROJECTS, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateP5raProject(
  projectId: string,
  data: Partial<{
    title: string;
    theme: string;
    description: string;
    targetFase: string;
    status: string;
    startDate: string;
    endDate: string;
  }>
): Promise<P5raProjectItem> {
  return apiClient<P5raProjectItem>(API_ENDPOINTS.P5RA.PROJECT_DETAIL(projectId), {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteP5raProject(projectId: string): Promise<void> {
  return apiClient<void>(API_ENDPOINTS.P5RA.PROJECT_DETAIL(projectId), {
    method: "DELETE",
  });
}

export async function assignProjectClassrooms(
  projectId: string,
  classroomIds: string[]
): Promise<void> {
  return apiClient<void>(API_ENDPOINTS.P5RA.PROJECT_CLASSROOMS(projectId), {
    method: "POST",
    body: JSON.stringify({ classroomIds }),
  });
}

export async function fetchP5raTargets(projectId: string): Promise<P5raTargetItem[]> {
  return apiClient<P5raTargetItem[]>(API_ENDPOINTS.P5RA.TARGETS(projectId));
}

export async function createP5raTarget(
  projectId: string,
  data: {
    dimension: string;
    element: string;
    subElement: string;
    targetDescription: string;
    valuePra?: string;
    subValuePra?: string;
    orderIndex?: number;
  }
): Promise<P5raTargetItem> {
  return apiClient<P5raTargetItem>(API_ENDPOINTS.P5RA.TARGETS(projectId), {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteP5raTarget(projectId: string, targetId: string): Promise<void> {
  return apiClient<void>(API_ENDPOINTS.P5RA.TARGET_DETAIL(projectId, targetId), {
    method: "DELETE",
  });
}

export async function fetchP5raAssessments(
  projectId: string,
  classroomId?: string
): Promise<StudentAssessmentRow[]> {
  return apiClient<StudentAssessmentRow[]>(API_ENDPOINTS.P5RA.ASSESSMENTS(projectId), {
    params: classroomId ? { classroomId } : undefined,
  });
}

export async function saveBatchAssessments(
  projectId: string,
  items: P5raStudentAssessmentItem[]
): Promise<void> {
  return apiClient<void>(API_ENDPOINTS.P5RA.ASSESSMENTS_BATCH(projectId), {
    method: "POST",
    body: JSON.stringify({ projectId, items }),
  });
}

export async function saveStudentNotes(
  projectId: string,
  data: { studentId: string; processNotes: string }
): Promise<void> {
  return apiClient<void>(API_ENDPOINTS.P5RA.NOTES(projectId), {
    method: "POST",
    body: JSON.stringify({ projectId, ...data }),
  });
}

export async function generateStudentNotes(
  projectId: string,
  studentId: string
): Promise<{ processNotes: string }> {
  return apiClient<{ processNotes: string }>(
    API_ENDPOINTS.P5RA.NOTES_GENERATE(projectId, studentId),
    {
      method: "POST",
    }
  );
}

export async function fetchP5raRecap(
  projectId: string,
  classroomId?: string
): Promise<P5raRecapResponse> {
  return apiClient<P5raRecapResponse>(API_ENDPOINTS.P5RA.RECAP(projectId), {
    params: classroomId ? { classroomId } : undefined,
  });
}

export async function fetchStudentP5raReport(
  projectId: string,
  studentId: string
): Promise<P5raReportViewData> {
  return apiClient<P5raReportViewData>(
    API_ENDPOINTS.P5RA.STUDENT_REPORT(projectId, studentId)
  );
}

export async function downloadStudentP5raPdf(
  projectId: string,
  studentId: string
): Promise<Blob> {
  return apiClient<Blob>(API_ENDPOINTS.P5RA.STUDENT_PDF(projectId, studentId), {
    responseType: "blob",
  });
}

// ----------------------------------------------------
// React Query Hooks
// ----------------------------------------------------

export function useP5raProjects(params?: {
  academicYearId?: string;
  semesterId?: string;
  theme?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: p5raQueryKeys.projects(params),
    queryFn: () => fetchP5raProjects(params),
  });
}

export function useP5raProjectDetail(projectId: string) {
  return useQuery({
    queryKey: p5raQueryKeys.projectDetail(projectId),
    queryFn: () => fetchP5raProjectDetail(projectId),
    enabled: Boolean(projectId),
  });
}

export function useP5raTargets(projectId: string) {
  return useQuery({
    queryKey: p5raQueryKeys.targets(projectId),
    queryFn: () => fetchP5raTargets(projectId),
    enabled: Boolean(projectId),
  });
}

export function useP5raAssessments(projectId: string, classroomId?: string) {
  return useQuery({
    queryKey: p5raQueryKeys.assessments(projectId, classroomId),
    queryFn: () => fetchP5raAssessments(projectId, classroomId),
    enabled: Boolean(projectId),
  });
}

export function useP5raRecap(projectId: string, classroomId?: string) {
  return useQuery({
    queryKey: p5raQueryKeys.recap(projectId, classroomId),
    queryFn: () => fetchP5raRecap(projectId, classroomId),
    enabled: Boolean(projectId),
  });
}

export function useP5raStudentReport(projectId: string, studentId: string) {
  return useQuery({
    queryKey: p5raQueryKeys.studentReport(projectId, studentId),
    queryFn: () => fetchStudentP5raReport(projectId, studentId),
    enabled: Boolean(projectId && studentId),
  });
}

export function useCreateP5raProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createP5raProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: p5raQueryKeys.projects() });
    },
  });
}

export function useUpdateP5raProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateP5raProject>[1]) =>
      updateP5raProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: p5raQueryKeys.projects() });
      queryClient.invalidateQueries({ queryKey: p5raQueryKeys.projectDetail(projectId) });
    },
  });
}

export function useDeleteP5raProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteP5raProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: p5raQueryKeys.projects() });
    },
  });
}

export function useCreateP5raTarget(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createP5raTarget>[1]) =>
      createP5raTarget(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: p5raQueryKeys.targets(projectId) });
      queryClient.invalidateQueries({ queryKey: p5raQueryKeys.projectDetail(projectId) });
    },
  });
}

export function useDeleteP5raTarget(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetId: string) => deleteP5raTarget(projectId, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: p5raQueryKeys.targets(projectId) });
      queryClient.invalidateQueries({ queryKey: p5raQueryKeys.projectDetail(projectId) });
    },
  });
}

export function useSaveBatchAssessments(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: P5raStudentAssessmentItem[]) =>
      saveBatchAssessments(projectId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: p5raQueryKeys.assessments(projectId) });
      queryClient.invalidateQueries({ queryKey: p5raQueryKeys.recap(projectId) });
    },
  });
}

export function useSaveStudentNotes(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { studentId: string; processNotes: string }) =>
      saveStudentNotes(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: p5raQueryKeys.assessments(projectId) });
    },
  });
}
