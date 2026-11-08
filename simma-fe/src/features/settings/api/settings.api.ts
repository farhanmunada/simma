import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type {
  AcademicYear,
  CreateAcademicYearDto,
  UpdateAcademicYearDto,
  Semester,
  CreateSemesterDto,
  UpdateSemesterDto,
  Classroom,
  CreateClassroomDto,
  UpdateClassroomDto,
  Subject,
  CreateSubjectDto,
  UpdateSubjectDto,
  Teacher,
  CreateTeacherDto,
  UpdateTeacherDto,
  QueryFilterParams,
} from "../types";

// Helper request wrapper to target /setup endpoints
async function settingsRequest<T>(
  endpoint: string,
  options: Parameters<typeof apiClient>[1] = {}
): Promise<T> {
  const target = endpoint.startsWith("/setup/")
    ? endpoint
    : endpoint.replace("/settings/", "/setup/");
  return await apiClient<T>(target, options);
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
  const endpoint = isActive
    ? `/setup/academic-years/${id}/set-active`
    : `/setup/academic-years/${id}`;
  const options = isActive
    ? { method: "PATCH" }
    : { method: "PATCH", body: JSON.stringify({ isActive: false }) };
  const res = await settingsRequest<unknown>(endpoint, options);
  return extractSingle<AcademicYear>(res);
}

export async function updateAcademicYear(
  id: string,
  data: UpdateAcademicYearDto
): Promise<AcademicYear> {
  const res = await settingsRequest<unknown>(`/settings/academic-years/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return extractSingle<AcademicYear>(res);
}

export async function deleteAcademicYear(id: string): Promise<{ success: boolean }> {
  return await settingsRequest<{ success: boolean }>(`/settings/academic-years/${id}`, {
    method: "DELETE",
  });
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
  const endpoint = isActive
    ? `/setup/semesters/${id}/set-active`
    : `/setup/semesters/${id}`;
  const options = isActive
    ? { method: "PATCH" }
    : { method: "PATCH", body: JSON.stringify({ isActive: false }) };
  const res = await settingsRequest<unknown>(endpoint, options);
  return extractSingle<Semester>(res);
}

export async function updateSemester(
  id: string,
  data: UpdateSemesterDto
): Promise<Semester> {
  const res = await settingsRequest<unknown>(`/settings/semesters/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return extractSingle<Semester>(res);
}

export async function deleteSemester(id: string): Promise<{ success: boolean }> {
  return await settingsRequest<{ success: boolean }>(`/settings/semesters/${id}`, {
    method: "DELETE",
  });
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

export async function updateClassroom(
  id: string,
  data: UpdateClassroomDto
): Promise<Classroom> {
  const res = await settingsRequest<unknown>(`/settings/classrooms/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return extractSingle<Classroom>(res);
}

export async function deleteClassroom(id: string): Promise<{ success: boolean }> {
  return await settingsRequest<{ success: boolean }>(`/settings/classrooms/${id}`, {
    method: "DELETE",
  });
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

export async function updateSubject(
  id: string,
  data: UpdateSubjectDto
): Promise<Subject> {
  const res = await settingsRequest<unknown>(`/settings/subjects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return extractSingle<Subject>(res);
}

export async function deleteSubject(id: string): Promise<{ success: boolean }> {
  return await settingsRequest<{ success: boolean }>(`/settings/subjects/${id}`, {
    method: "DELETE",
  });
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

export async function updateTeacher(
  id: string,
  data: UpdateTeacherDto
): Promise<Teacher> {
  const res = await settingsRequest<unknown>(`/settings/teachers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return extractSingle<Teacher>(res);
}

export async function deleteTeacher(id: string): Promise<{ success: boolean }> {
  return await settingsRequest<{ success: boolean }>(`/settings/teachers/${id}`, {
    method: "DELETE",
  });
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

export function useUpdateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAcademicYearDto }) =>
      updateAcademicYear(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
  });
}

export function useDeleteAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAcademicYear(id),
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

export function useUpdateSemester() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSemesterDto }) =>
      updateSemester(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["semesters"] });
    },
  });
}

export function useDeleteSemester() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSemester(id),
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

export function useUpdateClassroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClassroomDto }) =>
      updateClassroom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
    },
  });
}

export function useDeleteClassroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClassroom(id),
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

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubjectDto }) =>
      updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubject(id),
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

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeacherDto }) =>
      updateTeacher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}
