import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import { extractList } from "../utils/extractors";

export interface ReferenceItem {
  id: string;
  name?: string;
  code?: string;
  title?: string;
  fullName?: string;
  nisn?: string;
  nis?: string;
}

export function useClassroomsReference() {
  return useQuery({
    queryKey: ["reference", "classrooms"],
    queryFn: async () => {
      const res = await apiClient<unknown>(API_ENDPOINTS.SETUP.CLASSROOMS);
      return extractList<ReferenceItem>(res);
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useSubjectsReference() {
  return useQuery({
    queryKey: ["reference", "subjects"],
    queryFn: async () => {
      const res = await apiClient<unknown>(API_ENDPOINTS.SETUP.SUBJECTS);
      return extractList<ReferenceItem>(res);
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useSemestersReference() {
  return useQuery({
    queryKey: ["reference", "semesters"],
    queryFn: async () => {
      const res = await apiClient<unknown>(API_ENDPOINTS.SETUP.SEMESTERS);
      return extractList<ReferenceItem>(res);
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useAcademicYearsReference() {
  return useQuery({
    queryKey: ["reference", "academic-years"],
    queryFn: async () => {
      const res = await apiClient<unknown>(API_ENDPOINTS.SETUP.ACADEMIC_YEARS);
      return extractList<ReferenceItem>(res);
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useStudentsByClass(classroomId?: string) {
  return useQuery({
    queryKey: ["reference", "students-by-class", classroomId],
    queryFn: async () => {
      if (!classroomId) return [];
      const res = await apiClient<unknown>(API_ENDPOINTS.STUDENTS.LIST, {
        params: { classroomId, limit: 100 },
      });
      return extractList<ReferenceItem>(res);
    },
    enabled: Boolean(classroomId),
  });
}
