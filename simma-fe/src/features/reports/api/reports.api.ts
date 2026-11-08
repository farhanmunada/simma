import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type {
  StudentReportCard,
  ClassroomLegger,
  StudentReportNotes,
  ReportCardQueryParams,
  LeggerQueryParams,
  ReportNotesBodyInput,
} from "../types";

function cleanEndpoint(ep: string): string {
  if (ep.startsWith("/api/v1/")) {
    return ep.replace("/api/v1", "");
  }
  return ep;
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

// ----------------------------------------------------
// Query Keys
// ----------------------------------------------------
export const reportsQueryKeys = {
  all: ["reports"] as const,
  student: (studentId?: string, semesterId?: string, params?: ReportCardQueryParams) =>
    ["reports", "student", studentId, semesterId, params] as const,
  legger: (classroomId?: string, semesterId?: string, params?: LeggerQueryParams) =>
    ["reports", "legger", classroomId, semesterId, params] as const,
};

// ----------------------------------------------------
// Raw API Functions
// ----------------------------------------------------

/**
 * Fetch Student Report Card data
 * GET /api/v1/reports/student/:studentId/semester/:semesterId
 */
export async function getStudentReportCard(
  studentId: string,
  semesterId: string,
  params?: ReportCardQueryParams
): Promise<StudentReportCard> {
  const queryParams: Record<string, string | number | boolean | undefined | null> = {};
  if (params) {
    if (params.includeTahfidz !== undefined) queryParams.includeTahfidz = params.includeTahfidz;
    if (params.includeAttendance !== undefined) queryParams.includeAttendance = params.includeAttendance;
  }

  const endpoint = cleanEndpoint(`/api/v1/reports/student/${studentId}/semester/${semesterId}`);
  const res = await apiClient<unknown>(endpoint, {
    params: queryParams,
  });
  return extractSingle<StudentReportCard>(res);
}

/**
 * Fetch PDF Report Card as Blob
 * GET /api/v1/reports/student/:studentId/semester/:semesterId/pdf
 */
export async function getStudentReportPdf(
  studentId: string,
  semesterId: string
): Promise<Blob> {
  const endpoint = cleanEndpoint(`/api/v1/reports/student/${studentId}/semester/${semesterId}/pdf`);
  const res = await apiClient<Blob>(endpoint, {
    responseType: "blob",
  });
  return res;
}

/**
 * Download Student Report PDF directly to local disk
 */
export async function downloadStudentReportPdf(
  studentId: string,
  semesterId: string,
  filename?: string
): Promise<void> {
  const blob = await getStudentReportPdf(studentId, semesterId);
  const downloadUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = filename || `rapor-${studentId}-${semesterId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(downloadUrl);
}

/**
 * Fetch Classroom Legger
 * GET /api/v1/reports/classroom/:classroomId/semester/:semesterId/legger
 */
export async function getClassroomLegger(
  classroomId: string,
  semesterId: string,
  params?: LeggerQueryParams
): Promise<ClassroomLegger> {
  const queryParams: Record<string, string | number | boolean | undefined | null> = {};
  if (params) {
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.order) queryParams.order = params.order;
  }

  const endpoint = cleanEndpoint(`/api/v1/reports/classroom/${classroomId}/semester/${semesterId}/legger`);
  const res = await apiClient<unknown>(endpoint, {
    params: queryParams,
  });
  return extractSingle<ClassroomLegger>(res);
}

/**
 * Save Student Notes, Attitudes, Extracurriculars, & Achievements
 * POST /api/v1/reports/student/:studentId/notes
 */
export async function saveStudentNotes(
  studentId: string,
  data: ReportNotesBodyInput
): Promise<StudentReportNotes> {
  const endpoint = cleanEndpoint(`/api/v1/reports/student/${studentId}/notes`);
  const res = await apiClient<unknown>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<StudentReportNotes>(res);
}

// ----------------------------------------------------
// TanStack Query Hooks
// ----------------------------------------------------

export function useStudentReportCard(
  studentId?: string,
  semesterId?: string,
  params?: ReportCardQueryParams
) {
  return useQuery({
    queryKey: reportsQueryKeys.student(studentId, semesterId, params),
    queryFn: () => {
      if (!studentId || !semesterId) {
        throw new Error("Student ID dan Semester ID wajib dipilih");
      }
      return getStudentReportCard(studentId, semesterId, params);
    },
    enabled: Boolean(studentId && semesterId),
  });
}

export function useClassroomLegger(
  classroomId?: string,
  semesterId?: string,
  params?: LeggerQueryParams
) {
  return useQuery({
    queryKey: reportsQueryKeys.legger(classroomId, semesterId, params),
    queryFn: () => {
      if (!classroomId || !semesterId) {
        throw new Error("Kelas dan Semester wajib dipilih");
      }
      return getClassroomLegger(classroomId, semesterId, params);
    },
    enabled: Boolean(classroomId && semesterId),
  });
}

export function useDownloadReportPdf() {
  return useMutation({
    mutationFn: async ({
      studentId,
      semesterId,
      filename,
    }: {
      studentId: string;
      semesterId: string;
      filename?: string;
    }) => {
      return downloadStudentReportPdf(studentId, semesterId, filename);
    },
  });
}

export function useSaveStudentNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      data,
    }: {
      studentId: string;
      data: ReportNotesBodyInput;
    }) => {
      return saveStudentNotes(studentId, data);
    },
    onSuccess: (_, variables) => {
      // Invalidate student report queries
      queryClient.invalidateQueries({
        queryKey: ["reports", "student", variables.studentId],
      });
      queryClient.invalidateQueries({
        queryKey: reportsQueryKeys.all,
      });
    },
  });
}
