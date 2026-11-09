import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type {
  AttendanceStudent,
  AttendanceTeacher,
  RecordStudentAttendanceDto,
  RecordStudentAttendanceDto as CreateAttendanceStudentDto,
  BulkStudentAttendanceDto,
  UpdateStudentAttendanceDto,
  UpdateStudentAttendanceDto as UpdateAttendanceStudentDto,
  RecordTeacherAttendanceDto,
  RecordTeacherAttendanceDto as CreateAttendanceTeacherDto,
  BulkTeacherAttendanceDto,
  UpdateTeacherAttendanceDto,
  UpdateTeacherAttendanceDto as UpdateAttendanceTeacherDto,
  StudentAttendanceQueryParams,
  TeacherAttendanceQueryParams,
  StudentAttendanceSummary,
  TeacherAttendanceSummary,
  ClassroomDailyAttendance,
} from "../types";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const cleanEndpoint = (endpoint: string): string =>
  endpoint.startsWith("/api/v1/") ? endpoint.replace("/api/v1", "") : endpoint;

function extractData<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in (res as Record<string, unknown>)) {
    const val = (res as { data: unknown }).data;
    if (val !== undefined && val !== null) return val as T;
  }
  return res as T;
}

function extractPaginated<T>(res: unknown): PaginatedResult<T> {
  if (res && typeof res === "object") {
    const p = res as {
      data?: unknown;
      total?: number;
      page?: number;
      limit?: number;
      meta?: { total?: number; page?: number; limit?: number };
    };
    if (Array.isArray(p.data)) {
      return {
        data: p.data as T[],
        total: p.total ?? p.meta?.total ?? p.data.length,
        page: p.page ?? p.meta?.page ?? 1,
        limit: p.limit ?? p.meta?.limit ?? p.data.length,
      };
    }
  }
  if (Array.isArray(res)) return { data: res as T[], total: res.length, page: 1, limit: res.length };
  return { data: [], total: 0, page: 1, limit: 20 };
}

export const attendanceQueryKeys = {
  all: ["attendance"] as const,
  students: () => [...attendanceQueryKeys.all, "students"] as const,
  studentList: (params?: StudentAttendanceQueryParams) => [...attendanceQueryKeys.students(), "list", params] as const,
  studentDetail: (id: string) => [...attendanceQueryKeys.students(), "detail", id] as const,
  classroomDaily: (classId: string, date: string) => [...attendanceQueryKeys.students(), "classroom", classId, date] as const,
  studentSummary: (id: string, params?: { startDate?: string; endDate?: string }) => [...attendanceQueryKeys.students(), "summary", id, params] as const,
  teachers: () => [...attendanceQueryKeys.all, "teachers"] as const,
  teacherList: (params?: TeacherAttendanceQueryParams) => [...attendanceQueryKeys.teachers(), "list", params] as const,
  teacherDetail: (id: string) => [...attendanceQueryKeys.teachers(), "detail", id] as const,
  teacherDaily: (date: string) => [...attendanceQueryKeys.teachers(), "daily", date] as const,
  teacherSummary: (id: string, params?: { startDate?: string; endDate?: string }) => [...attendanceQueryKeys.teachers(), "summary", id, params] as const,
};

// --- Student Attendance API ---

export async function getStudentAttendances(params?: StudentAttendanceQueryParams): Promise<PaginatedResult<AttendanceStudent>> {
  const res = await apiClient<unknown>(API_ENDPOINTS.ATTENDANCE.STUDENTS, { params: params as Record<string, string | number> });
  return extractPaginated<AttendanceStudent>(res);
}

export async function getStudentAttendanceById(id: string): Promise<AttendanceStudent> {
  const res = await apiClient<unknown>(API_ENDPOINTS.ATTENDANCE.STUDENT_DETAIL(id));
  return extractData<AttendanceStudent>(res);
}

export async function recordStudentAttendance(data: CreateAttendanceStudentDto): Promise<AttendanceStudent> {
  const res = await apiClient<unknown>(API_ENDPOINTS.ATTENDANCE.STUDENTS, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractData<AttendanceStudent>(res);
}

export async function bulkRecordStudents(data: BulkStudentAttendanceDto): Promise<AttendanceStudent[]> {
  const res = await apiClient<unknown>(API_ENDPOINTS.ATTENDANCE.BULK_STUDENTS, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return Array.isArray(res) ? (res as AttendanceStudent[]) : extractData<AttendanceStudent[]>(res) || [];
}

export async function updateStudentAttendance(id: string, data: UpdateAttendanceStudentDto): Promise<AttendanceStudent> {
  const res = await apiClient<unknown>(API_ENDPOINTS.ATTENDANCE.STUDENT_DETAIL(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return extractData<AttendanceStudent>(res);
}

export async function deleteStudentAttendance(id: string): Promise<boolean> {
  await apiClient<unknown>(API_ENDPOINTS.ATTENDANCE.STUDENT_DETAIL(id), { method: "DELETE" });
  return true;
}

export async function getClassroomAttendance(classId: string, date: string): Promise<ClassroomDailyAttendance> {
  const res = await apiClient<unknown>(API_ENDPOINTS.ATTENDANCE.CLASSROOM_DAILY(classId, date));
  return extractData<ClassroomDailyAttendance>(res);
}

export async function getStudentSummary(studentId: string, params?: { startDate?: string; endDate?: string }): Promise<StudentAttendanceSummary> {
  const res = await apiClient<unknown>(API_ENDPOINTS.ATTENDANCE.STUDENT_SUMMARY(studentId), { params });
  return extractData<StudentAttendanceSummary>(res);
}

// --- Teacher Attendance API ---

export async function getTeacherAttendances(params?: TeacherAttendanceQueryParams): Promise<PaginatedResult<AttendanceTeacher>> {
  const res = await apiClient<unknown>(API_ENDPOINTS.ATTENDANCE.TEACHERS, { params: params as Record<string, string | number> });
  return extractPaginated<AttendanceTeacher>(res);
}

export async function getTeacherAttendanceById(id: string): Promise<AttendanceTeacher> {
  const res = await apiClient<unknown>(API_ENDPOINTS.ATTENDANCE.TEACHER_DETAIL(id));
  return extractData<AttendanceTeacher>(res);
}

export async function recordTeacherAttendance(data: CreateAttendanceTeacherDto): Promise<AttendanceTeacher> {
  const res = await apiClient<unknown>(API_ENDPOINTS.ATTENDANCE.TEACHERS, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractData<AttendanceTeacher>(res);
}

export async function bulkRecordTeachers(data: BulkTeacherAttendanceDto): Promise<AttendanceTeacher[]> {
  const res = await apiClient<unknown>(API_ENDPOINTS.ATTENDANCE.BULK_TEACHERS, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return Array.isArray(res) ? (res as AttendanceTeacher[]) : extractData<AttendanceTeacher[]>(res) || [];
}

export async function updateTeacherAttendance(id: string, data: UpdateAttendanceTeacherDto): Promise<AttendanceTeacher> {
  const res = await apiClient<unknown>(API_ENDPOINTS.ATTENDANCE.TEACHER_DETAIL(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return extractData<AttendanceTeacher>(res);
}

export async function deleteTeacherAttendance(id: string): Promise<boolean> {
  await apiClient<unknown>(API_ENDPOINTS.ATTENDANCE.TEACHER_DETAIL(id), { method: "DELETE" });
  return true;
}

export async function getTeacherDailyAttendance(date: string): Promise<AttendanceTeacher[]> {
  const res = await getTeacherAttendances({ date });
  return res.data;
}

export async function getTeacherSummary(teacherId: string, params?: { startDate?: string; endDate?: string }): Promise<TeacherAttendanceSummary> {
  const res = await apiClient<unknown>(API_ENDPOINTS.ATTENDANCE.TEACHER_SUMMARY(teacherId), { params });
  return extractData<TeacherAttendanceSummary>(res);
}

// --- TanStack Query Hooks ---

export function useStudentAttendances(params?: StudentAttendanceQueryParams) {
  return useQuery({ queryKey: attendanceQueryKeys.studentList(params), queryFn: () => getStudentAttendances(params) });
}

export function useStudentAttendanceById(id: string) {
  return useQuery({ queryKey: attendanceQueryKeys.studentDetail(id), queryFn: () => getStudentAttendanceById(id), enabled: Boolean(id) });
}

export function useClassroomAttendance(classroomId: string, date: string) {
  return useQuery({
    queryKey: attendanceQueryKeys.classroomDaily(classroomId, date),
    queryFn: () => getClassroomAttendance(classroomId, date),
    enabled: Boolean(classroomId && date),
  });
}

export function useStudentSummary(studentId: string, params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: attendanceQueryKeys.studentSummary(studentId, params),
    queryFn: () => getStudentSummary(studentId, params),
    enabled: Boolean(studentId),
  });
}

export function useRecordStudentAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordStudentAttendance,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.students() }),
  });
}

export function useBulkRecordStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkRecordStudents,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.students() }),
  });
}

export function useUpdateStudentAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttendanceStudentDto }) => updateStudentAttendance(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.studentDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.students() });
    },
  });
}

export function useDeleteStudentAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStudentAttendance(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.students() }),
  });
}

export function useTeacherAttendances(params?: TeacherAttendanceQueryParams) {
  return useQuery({ queryKey: attendanceQueryKeys.teacherList(params), queryFn: () => getTeacherAttendances(params) });
}

export function useTeacherAttendanceById(id: string) {
  return useQuery({ queryKey: attendanceQueryKeys.teacherDetail(id), queryFn: () => getTeacherAttendanceById(id), enabled: Boolean(id) });
}

export function useTeacherDailyAttendance(date: string) {
  return useQuery({ queryKey: attendanceQueryKeys.teacherDaily(date), queryFn: () => getTeacherDailyAttendance(date), enabled: Boolean(date) });
}

export function useTeacherSummary(teacherId: string, params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: attendanceQueryKeys.teacherSummary(teacherId, params),
    queryFn: () => getTeacherSummary(teacherId, params),
    enabled: Boolean(teacherId),
  });
}

export function useRecordTeacherAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordTeacherAttendance,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.teachers() }),
  });
}

export function useBulkRecordTeachers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkRecordTeachers,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.teachers() }),
  });
}

export function useUpdateTeacherAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttendanceTeacherDto }) => updateTeacherAttendance(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.teacherDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.teachers() });
    },
  });
}

export function useDeleteTeacherAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTeacherAttendance(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attendanceQueryKeys.teachers() }),
  });
}
