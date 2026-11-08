import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type {
  AcademicYear,
  CreateAcademicYearDto,
  Semester,
  CreateSemesterDto,
  Classroom,
  CreateClassroomDto,
  Subject,
  CreateSubjectDto,
  Teacher,
  CreateTeacherDto,
  QueryFilterParams,
} from "../types";

// Helper request wrapper to handle /settings and /setup endpoints seamlessly
async function settingsRequest<T>(
  endpoint: string,
  options: Parameters<typeof apiClient>[1] = {}
): Promise<T> {
  try {
    return await apiClient<T>(endpoint, options);
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    if (err?.statusCode === 404 && endpoint.includes("/settings/")) {
      const fallbackEndpoint = endpoint.replace("/settings/", "/setup/");
      return await apiClient<T>(fallbackEndpoint, options);
    }
    throw error;
  }
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
    if (payload.data && typeof payload.data === "object") {
      return payload.data as T;
    }
  }
  return res as T;
}

// ----------------------------------------------------
// 1. ACADEMIC YEARS
// ----------------------------------------------------
export async function getAcademicYears(params?: QueryFilterParams): Promise<AcademicYear[]> {
  const res = await settingsRequest<unknown>("/settings/academic-years", {
    params: params as Record<string, string | number | boolean | undefined | null>,
  });
  return extractList<AcademicYear>(res);
}

export async function getAcademicYearById(id: string): Promise<AcademicYear> {
  const res = await settingsRequest<unknown>(`/settings/academic-years/${id}`);
  return extractSingle<AcademicYear>(res);
}

export async function createAcademicYear(data: CreateAcademicYearDto): Promise<AcademicYear> {
  const res = await settingsRequest<unknown>("/settings/academic-years", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<AcademicYear>(res);
}

export async function patchAcademicYearStatus(id: string, isActive: boolean = true): Promise<AcademicYear> {
  try {
    const res = await settingsRequest<unknown>(`/settings/academic-years/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
    return extractSingle<AcademicYear>(res);
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    if (err?.statusCode === 404) {
      try {
        const res = await settingsRequest<unknown>(`/settings/academic-years/${id}/set-active`, {
          method: "PATCH",
        });
        return extractSingle<AcademicYear>(res);
      } catch {
        const res = await settingsRequest<unknown>(`/settings/academic-years/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ isActive }),
        });
        return extractSingle<AcademicYear>(res);
      }
    }
    throw error;
  }
}

// ----------------------------------------------------
// 2. SEMESTERS
// ----------------------------------------------------
export async function getSemesters(params?: QueryFilterParams): Promise<Semester[]> {
  const res = await settingsRequest<unknown>("/settings/semesters", {
    params: params as Record<string, string | number | boolean | undefined | null>,
  });
  return extractList<Semester>(res);
}

export async function getSemesterById(id: string): Promise<Semester> {
  const res = await settingsRequest<unknown>(`/settings/semesters/${id}`);
  return extractSingle<Semester>(res);
}

export async function createSemester(data: CreateSemesterDto): Promise<Semester> {
  const res = await settingsRequest<unknown>("/settings/semesters", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<Semester>(res);
}

export async function patchSemesterStatus(id: string, isActive: boolean = true): Promise<Semester> {
  try {
    const res = await settingsRequest<unknown>(`/settings/semesters/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
    return extractSingle<Semester>(res);
  } catch (error: unknown) {
    const err = error as { statusCode?: number };
    if (err?.statusCode === 404) {
      try {
        const res = await settingsRequest<unknown>(`/settings/semesters/${id}/set-active`, {
          method: "PATCH",
        });
        return extractSingle<Semester>(res);
      } catch {
        const res = await settingsRequest<unknown>(`/settings/semesters/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ isActive }),
        });
        return extractSingle<Semester>(res);
      }
    }
    throw error;
  }
}

// ----------------------------------------------------
// 3. CLASSROOMS
// ----------------------------------------------------
export async function getClassrooms(params?: QueryFilterParams): Promise<Classroom[]> {
  const res = await settingsRequest<unknown>("/settings/classrooms", {
    params: params as Record<string, string | number | boolean | undefined | null>,
  });
  return extractList<Classroom>(res);
}

export async function getClassroomById(id: string): Promise<Classroom> {
  const res = await settingsRequest<unknown>(`/settings/classrooms/${id}`);
  return extractSingle<Classroom>(res);
}

export async function createClassroom(data: CreateClassroomDto): Promise<Classroom> {
  const res = await settingsRequest<unknown>("/settings/classrooms", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<Classroom>(res);
}

// ----------------------------------------------------
// 4. SUBJECTS
// ----------------------------------------------------
export async function getSubjects(params?: QueryFilterParams): Promise<Subject[]> {
  const res = await settingsRequest<unknown>("/settings/subjects", {
    params: params as Record<string, string | number | boolean | undefined | null>,
  });
  return extractList<Subject>(res);
}

export async function getSubjectById(id: string): Promise<Subject> {
  const res = await settingsRequest<unknown>(`/settings/subjects/${id}`);
  return extractSingle<Subject>(res);
}

export async function createSubject(data: CreateSubjectDto): Promise<Subject> {
  const res = await settingsRequest<unknown>("/settings/subjects", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<Subject>(res);
}

// ----------------------------------------------------
// 5. TEACHERS
// ----------------------------------------------------
export async function getTeachers(params?: QueryFilterParams): Promise<Teacher[]> {
  const res = await settingsRequest<unknown>("/settings/teachers", {
    params: params as Record<string, string | number | boolean | undefined | null>,
  });
  return extractList<Teacher>(res);
}

export async function getTeacherById(id: string): Promise<Teacher> {
  const res = await settingsRequest<unknown>(`/settings/teachers/${id}`);
  return extractSingle<Teacher>(res);
}

export async function createTeacher(data: CreateTeacherDto): Promise<Teacher> {
  const res = await settingsRequest<unknown>("/settings/teachers", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<Teacher>(res);
}

// ----------------------------------------------------
// TANSTACK QUERY HOOKS
// ----------------------------------------------------

export function useAcademicYears(params?: QueryFilterParams) {
  return useQuery({
    queryKey: ["academic-years", params],
    queryFn: () => getAcademicYears(params),
  });
}

export function useAcademicYear(id: string) {
  return useQuery({
    queryKey: ["academic-years", id],
    queryFn: () => getAcademicYearById(id),
    enabled: Boolean(id),
  });
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAcademicYearDto) => createAcademicYear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
  });
}

export function usePatchAcademicYearStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive?: boolean }) =>
      patchAcademicYearStatus(id, isActive ?? true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
  });
}

export function useSemesters(params?: QueryFilterParams) {
  return useQuery({
    queryKey: ["semesters", params],
    queryFn: () => getSemesters(params),
  });
}

export function useSemester(id: string) {
  return useQuery({
    queryKey: ["semesters", id],
    queryFn: () => getSemesterById(id),
    enabled: Boolean(id),
  });
}

export function useCreateSemester() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSemesterDto) => createSemester(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
  });
}

export function usePatchSemesterStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive?: boolean }) =>
      patchSemesterStatus(id, isActive ?? true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
  });
}

export function useClassrooms(params?: QueryFilterParams) {
  return useQuery({
    queryKey: ["classrooms", params],
    queryFn: () => getClassrooms(params),
  });
}

export function useClassroom(id: string) {
  return useQuery({
    queryKey: ["classrooms", id],
    queryFn: () => getClassroomById(id),
    enabled: Boolean(id),
  });
}

export function useCreateClassroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClassroomDto) => createClassroom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
    },
  });
}

export function useSubjects(params?: QueryFilterParams) {
  return useQuery({
    queryKey: ["subjects", params],
    queryFn: () => getSubjects(params),
  });
}

export function useSubject(id: string) {
  return useQuery({
    queryKey: ["subjects", id],
    queryFn: () => getSubjectById(id),
    enabled: Boolean(id),
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubjectDto) => createSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useTeachers(params?: QueryFilterParams) {
  return useQuery({
    queryKey: ["teachers", params],
    queryFn: () => getTeachers(params),
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: ["teachers", id],
    queryFn: () => getTeacherById(id),
    enabled: Boolean(id),
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeacherDto) => createTeacher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}
