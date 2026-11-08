import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type {
  AttendanceStudent,
  AttendanceTeacher,
  StudentAttendanceSummary,
  TeacherAttendanceSummary,
  ClassroomDailyAttendance,
  RecordStudentAttendanceDto,
  UpdateStudentAttendanceDto,
  BulkStudentAttendanceDto,
  StudentAttendanceQueryParams,
  PaginatedStudentAttendancesResponse,
  RecordTeacherAttendanceDto,
  UpdateTeacherAttendanceDto,
  BulkTeacherAttendanceDto,
  TeacherAttendanceQueryParams,
  PaginatedTeacherAttendancesResponse,
} from "../types";

export function cleanEndpoint(ep: string): string {
  if (ep.startsWith("/api/v1/")) {
    return ep.replace("/api/v1", "");
  }
  return ep;
}

function extractSingle<T>(res: unknown): T {
  if (res && typeof res === "object") {
    const payload = res as { data?: unknown };
    if (payload.data !== undefined && payload.data !== null && typeof payload.data === "object" && !Array.isArray(payload.data)) {
      return payload.data as T;
    }
  }
  return res as T;
}

function extractList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const payload = res as { data?: unknown };
    if (Array.isArray(payload.data)) return payload.data as T[];
  }
  return [];
}

function extractPaginatedStudent(res: unknown): PaginatedStudentAttendancesResponse {
  if (res && typeof res === "object") {
    const payload = res as { data?: unknown; total?: number; page?: number; limit?: number };
    if (Array.isArray(payload.data)) {
      return {
        data: payload.data as AttendanceStudent[],
        total: payload.total ?? payload.data.length,
        page: payload.page ?? 1,
        limit: payload.limit ?? payload.data.length,
      };
    }
  }
  if (Array.isArray(res)) {
    return {
      data: res as AttendanceStudent[],
      total: res.length,
      page: 1,
      limit: res.length,
    };
  }
  return { data: [], total: 0, page: 1, limit: 20 };
}

function extractPaginatedTeacher(res: unknown): PaginatedTeacherAttendancesResponse {
  if (res && typeof res === "object") {
    const payload = res as { data?: unknown; total?: number; page?: number; limit?: number };
    if (Array.isArray(payload.data)) {
      return {
        data: payload.data as AttendanceTeacher[],
        total: payload.total ?? payload.data.length,
        page: payload.page ?? 1,
        limit: payload.limit ?? payload.data.length,
      };
    }
  }
  if (Array.isArray(res)) {
    return {
      data: res as AttendanceTeacher[],
      total: res.length,
      page: 1,
      limit: res.length,
    };
  }
  return { data: [], total: 0, page: 1, limit: 20 };
}

// ----------------------------------------------------
// 1. CLASSROOM ATTENDANCE & BULK STUDENT
// ----------------------------------------------------

export async function getClassroomAttendance(
  classId: string,
  date: string
): Promise<ClassroomDailyAttendance> {
  const res = await apiClient<unknown>(
    cleanEndpoint(`/api/v1/attendance/classroom/${classId}/date/${date}`)
  );
  return extractSingle<ClassroomDailyAttendance>(res);
}

export async function bulkRecordStudents(
  data: BulkStudentAttendanceDto
): Promise<AttendanceStudent[]> {
  const res = await apiClient<unknown>(cleanEndpoint("/api/v1/attendance/bulk"), {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractList<AttendanceStudent>(res);
}

export async function getStudentSummary(
  studentId: string,
  params?: { startDate?: string; endDate?: string }
): Promise<StudentAttendanceSummary> {
  const res = await apiClient<unknown>(
    cleanEndpoint(`/api/v1/attendance/student/${studentId}/summary`),
    {
      params: params as Record<string, string | number | boolean | undefined | null>,
    }
  );
  return extractSingle<StudentAttendanceSummary>(res);
}

export async function getStudentAttendances(
  params?: StudentAttendanceQueryParams
): Promise<PaginatedStudentAttendancesResponse> {
  const res = await apiClient<unknown>(cleanEndpoint("/api/v1/attendance/students"), {
    params: params as Record<string, string | number | boolean | undefined | null>,
  });
  return extractPaginatedStudent(res);
}

export async function getStudentAttendanceById(id: string): Promise<AttendanceStudent> {
  const res = await apiClient<unknown>(cleanEndpoint(`/api/v1/attendance/students/${id}`));
  return extractSingle<AttendanceStudent>(res);
}

export async function recordStudentAttendance(
  data: RecordStudentAttendanceDto
): Promise<AttendanceStudent> {
  const res = await apiClient<unknown>(cleanEndpoint("/api/v1/attendance/students"), {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<AttendanceStudent>(res);
}

export async function updateStudentAttendance(
  id: string,
  data: UpdateStudentAttendanceDto
): Promise<AttendanceStudent> {
  const res = await apiClient<unknown>(cleanEndpoint(`/api/v1/attendance/students/${id}`), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return extractSingle<AttendanceStudent>(res);
}

export async function deleteStudentAttendance(id: string): Promise<void> {
  await apiClient<void>(cleanEndpoint(`/api/v1/attendance/students/${id}`), {
    method: "DELETE",
  });
}

// ----------------------------------------------------
// 2. TEACHER ATTENDANCE & BULK TEACHER
// ----------------------------------------------------

export async function getTeacherAttendances(
  params?: TeacherAttendanceQueryParams
): Promise<PaginatedTeacherAttendancesResponse> {
  const res = await apiClient<unknown>(cleanEndpoint("/api/v1/attendance/teachers"), {
    params: params as Record<string, string | number | boolean | undefined | null>,
  });
  return extractPaginatedTeacher(res);
}

export async function getTeacherDailyAttendance(
  date: string
): Promise<PaginatedTeacherAttendancesResponse> {
  return getTeacherAttendances({ date });
}

export async function bulkRecordTeachers(
  data: BulkTeacherAttendanceDto
): Promise<AttendanceTeacher[]> {
  const res = await apiClient<unknown>(
    cleanEndpoint("/api/v1/attendance/teachers/bulk"),
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  return extractList<AttendanceTeacher>(res);
}

export async function getTeacherSummary(
  teacherId: string,
  params?: { startDate?: string; endDate?: string }
): Promise<TeacherAttendanceSummary> {
  const res = await apiClient<unknown>(
    cleanEndpoint(`/api/v1/attendance/teacher/${teacherId}/summary`),
    {
      params: params as Record<string, string | number | boolean | undefined | null>,
    }
  );
  return extractSingle<TeacherAttendanceSummary>(res);
}

export async function getTeacherAttendanceById(id: string): Promise<AttendanceTeacher> {
  const res = await apiClient<unknown>(cleanEndpoint(`/api/v1/attendance/teachers/${id}`));
  return extractSingle<AttendanceTeacher>(res);
}

export async function recordTeacherAttendance(
  data: RecordTeacherAttendanceDto
): Promise<AttendanceTeacher> {
  const res = await apiClient<unknown>(cleanEndpoint("/api/v1/attendance/teachers"), {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<AttendanceTeacher>(res);
}

export async function updateTeacherAttendance(
  id: string,
  data: UpdateTeacherAttendanceDto
): Promise<AttendanceTeacher> {
  const res = await apiClient<unknown>(cleanEndpoint(`/api/v1/attendance/teachers/${id}`), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return extractSingle<AttendanceTeacher>(res);
}

export async function deleteTeacherAttendance(id: string): Promise<void> {
  await apiClient<void>(cleanEndpoint(`/api/v1/attendance/teachers/${id}`), {
    method: "DELETE",
  });
}

// ----------------------------------------------------
// QUERY KEYS
// ----------------------------------------------------

export const attendanceQueryKeys = {
  all: ["attendance"] as const,
  classroom: (classId: string, date: string) =>
    [...attendanceQueryKeys.all, "classroom", classId, date] as const,
  students: () => [...attendanceQueryKeys.all, "students"] as const,
  studentsList: (params?: StudentAttendanceQueryParams) =>
    [...attendanceQueryKeys.students(), "list", params] as const,
  studentDetail: (id: string) =>
    [...attendanceQueryKeys.students(), "detail", id] as const,
  studentSummary: (studentId: string, params?: { startDate?: string; endDate?: string }) =>
    [...attendanceQueryKeys.students(), "summary", studentId, params] as const,
  teachers: () => [...attendanceQueryKeys.all, "teachers"] as const,
  teachersList: (params?: TeacherAttendanceQueryParams) =>
    [...attendanceQueryKeys.teachers(), "list", params] as const,
  teacherDetail: (id: string) =>
    [...attendanceQueryKeys.teachers(), "detail", id] as const,
  teacherSummary: (teacherId: string, params?: { startDate?: string; endDate?: string }) =>
    [...attendanceQueryKeys.teachers(), "summary", teacherId, params] as const,
};

// ----------------------------------------------------
// HOOKS
// ----------------------------------------------------

export function useClassroomAttendance(
  classId?: string,
  date?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: attendanceQueryKeys.classroom(classId || "", date || ""),
    queryFn: () => getClassroomAttendance(classId!, date!),
    enabled: Boolean(classId && date && (options?.enabled ?? true)),
  });
}

export function useStudentSummary(
  studentId?: string,
  params?: { startDate?: string; endDate?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: attendanceQueryKeys.studentSummary(studentId || "", params),
    queryFn: () => getStudentSummary(studentId!, params),
    enabled: Boolean(studentId && (options?.enabled ?? true)),
  });
}

export function useStudentAttendances(params?: StudentAttendanceQueryParams) {
  return useQuery({
    queryKey: attendanceQueryKeys.studentsList(params),
    queryFn: () => getStudentAttendances(params),
  });
}

export function useStudentAttendanceById(id?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: attendanceQueryKeys.studentDetail(id || ""),
    queryFn: () => getStudentAttendanceById(id!),
    enabled: Boolean(id && (options?.enabled ?? true)),
  });
}

export function useBulkRecordStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkRecordStudents,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.classroom(variables.classroomId, variables.date),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.students(),
      });
    },
  });
}

export function useRecordStudentAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordStudentAttendance,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.classroom(variables.classroomId, variables.date),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.students(),
      });
    },
  });
}

export function useUpdateStudentAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentAttendanceDto }) =>
      updateStudentAttendance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.all,
      });
    },
  });
}

export function useDeleteStudentAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStudentAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.all,
      });
    },
  });
}

export function useTeacherAttendances(params?: TeacherAttendanceQueryParams) {
  return useQuery({
    queryKey: attendanceQueryKeys.teachersList(params),
    queryFn: () => getTeacherAttendances(params),
  });
}

export function useTeacherDailyAttendance(
  date: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: attendanceQueryKeys.teachersList({ date }),
    queryFn: () => getTeacherDailyAttendance(date),
    enabled: options?.enabled ?? Boolean(date),
  });
}

export function useTeacherSummary(
  teacherId?: string,
  params?: { startDate?: string; endDate?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: attendanceQueryKeys.teacherSummary(teacherId || "", params),
    queryFn: () => getTeacherSummary(teacherId!, params),
    enabled: Boolean(teacherId && (options?.enabled ?? true)),
  });
}

export function useTeacherAttendanceById(id?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: attendanceQueryKeys.teacherDetail(id || ""),
    queryFn: () => getTeacherAttendanceById(id!),
    enabled: Boolean(id && (options?.enabled ?? true)),
  });
}

export function useBulkRecordTeachers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkRecordTeachers,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.teachers(),
      });
    },
  });
}

export function useRecordTeacherAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordTeacherAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.teachers(),
      });
    },
  });
}

export function useUpdateTeacherAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeacherAttendanceDto }) =>
      updateTeacherAttendance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.teachers(),
      });
    },
  });
}

export function useDeleteTeacherAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTeacherAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceQueryKeys.teachers(),
      });
    },
  });
}
