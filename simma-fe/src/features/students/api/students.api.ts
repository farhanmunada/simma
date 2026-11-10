import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type {
  Student,
  CreateStudentDto,
  UpdateStudentDto,
  StudentParentDetail,
  CreateAndLinkParentDto,
  AddStudentParentDto,
  AssignClassroomDto,
  StudentQueryParams,
  PaginatedStudentsResponse,
  PaginationMeta,
} from "../types";

function extractPaginatedStudents(res: unknown): PaginatedStudentsResponse {
  if (res && typeof res === "object") {
    const payload = res as { data?: unknown; meta?: unknown };
    if (Array.isArray(payload.data)) {
      const meta = (payload.meta as PaginationMeta) || {
        page: 1,
        limit: payload.data.length,
        total: payload.data.length,
        totalPages: 1,
      };
      return {
        data: payload.data as Student[],
        meta,
      };
    }
  }
  if (Array.isArray(res)) {
    return {
      data: res as Student[],
      meta: {
        page: 1,
        limit: res.length,
        total: res.length,
        totalPages: 1,
      },
    };
  }
  return {
    data: [],
    meta: { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
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

function extractList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const payload = res as { data?: unknown };
    if (Array.isArray(payload.data)) return payload.data as T[];
  }
  return [];
}

// ----------------------------------------------------
// RAW API CALLS
// ----------------------------------------------------

export async function getStudents(
  params?: StudentQueryParams
): Promise<PaginatedStudentsResponse> {
  const res = await apiClient<unknown>(API_ENDPOINTS.STUDENTS.LIST, {
    params: params as Record<string, string | number | boolean | undefined | null>,
  });
  return extractPaginatedStudents(res);
}

export async function getStudentById(id: string): Promise<Student> {
  const res = await apiClient<unknown>(API_ENDPOINTS.STUDENTS.DETAIL(id));
  return extractSingle<Student>(res);
}

export async function createStudent(data: CreateStudentDto): Promise<Student> {
  const res = await apiClient<unknown>(API_ENDPOINTS.STUDENTS.CREATE, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<Student>(res);
}

export async function updateStudent(
  id: string,
  data: UpdateStudentDto
): Promise<Student> {
  const res = await apiClient<unknown>(API_ENDPOINTS.STUDENTS.UPDATE(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return extractSingle<Student>(res);
}

export async function deleteStudent(id: string): Promise<void> {
  await apiClient<void>(API_ENDPOINTS.STUDENTS.DELETE(id), {
    method: "DELETE",
  });
}

export async function getStudentParents(id: string): Promise<StudentParentDetail[]> {
  const res = await apiClient<unknown>(API_ENDPOINTS.STUDENTS.PARENTS(id));
  return extractList<StudentParentDetail>(res);
}

export async function createAndLinkParent(
  studentId: string,
  data: CreateAndLinkParentDto | AddStudentParentDto
): Promise<StudentParentDetail> {
  const res = await apiClient<unknown>(API_ENDPOINTS.STUDENTS.PARENTS(studentId), {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<StudentParentDetail>(res);
}

export async function assignClassroom(
  data: AssignClassroomDto
): Promise<{ assignedCount?: number }> {
  const res = await apiClient<unknown>(API_ENDPOINTS.STUDENTS.ASSIGN_CLASSROOM, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return extractSingle<{ assignedCount?: number }>(res);
}

// ----------------------------------------------------
// TANSTACK QUERY HOOKS
// ----------------------------------------------------

export const studentsQueryKeys = {
  all: ["students"] as const,
  lists: () => [...studentsQueryKeys.all, "list"] as const,
  list: (params?: StudentQueryParams) => [...studentsQueryKeys.lists(), params] as const,
  details: () => [...studentsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...studentsQueryKeys.details(), id] as const,
  parents: (id: string) => [...studentsQueryKeys.detail(id), "parents"] as const,
};

export function useStudents(params?: StudentQueryParams) {
  return useQuery({
    queryKey: studentsQueryKeys.list(params),
    queryFn: () => getStudents(params),
  });
}

export function useStudent(id?: string) {
  const isUuid = Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
  return useQuery({
    queryKey: isUuid ? studentsQueryKeys.detail(id!) : ["students", "detail", "empty"],
    queryFn: () => {
      if (!id) throw new Error("ID Siswa diperlukan");
      return getStudentById(id);
    },
    enabled: isUuid,
  });
}

export function useStudentParents(studentId?: string) {
  const isUuid = Boolean(studentId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId));
  return useQuery({
    queryKey: isUuid
      ? studentsQueryKeys.parents(studentId!)
      : ["students", "parents", "empty"],
    queryFn: () => {
      if (!studentId) throw new Error("ID Siswa diperlukan");
      return getStudentParents(studentId);
    },
    enabled: isUuid,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudentDto) => createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsQueryKeys.lists() });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentDto }) =>
      updateStudent(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: studentsQueryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: studentsQueryKeys.lists() });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsQueryKeys.lists() });
    },
  });
}

export function useCreateAndLinkParent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: string;
      data: CreateAndLinkParentDto | AddStudentParentDto;
    }) => createAndLinkParent(studentId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: studentsQueryKeys.parents(variables.studentId),
      });
      queryClient.invalidateQueries({
        queryKey: studentsQueryKeys.detail(variables.studentId),
      });
    },
  });
}

export function useAssignClassroom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AssignClassroomDto) => assignClassroom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentsQueryKeys.lists() });
    },
  });
}
