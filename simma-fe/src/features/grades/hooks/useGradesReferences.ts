import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import { extractList } from "../utils/extractors";
import { useAuthStore } from "../../../stores/auth.store";
import { useMyScope } from "../../auth/api/auth.api";

const PRIVILEGED_GRADES_ROLES = [
  "super_admin",
  "operator",
  "kepala_madrasah",
  "waka_kurikulum",
  "admin_tu",
] as const;

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
  const hasRole = useAuthStore((s) => s.hasRole);
  const isPrivileged = hasRole([...PRIVILEGED_GRADES_ROLES]);
  const { data: scope } = useMyScope();

  const query = useQuery({
    queryKey: ["reference", "classrooms"],
    queryFn: async () => {
      const res = await apiClient<unknown>(API_ENDPOINTS.SETUP.CLASSROOMS);
      return extractList<ReferenceItem>(res);
    },
    staleTime: 1000 * 60 * 10,
  });

  const data = useMemo(() => {
    const items = query.data ?? [];
    if (isPrivileged || !scope) return items;
    const allowed = new Set(scope.assignedClassroomIds);
    return items.filter((item) => allowed.has(item.id));
  }, [query.data, isPrivileged, scope]);

  return { ...query, data };
}

export function useSubjectsReference() {
  const hasRole = useAuthStore((s) => s.hasRole);
  const isPrivileged = hasRole([...PRIVILEGED_GRADES_ROLES]);
  const { data: scope } = useMyScope();

  const query = useQuery({
    queryKey: ["reference", "subjects"],
    queryFn: async () => {
      const res = await apiClient<unknown>(API_ENDPOINTS.SETUP.SUBJECTS);
      return extractList<ReferenceItem>(res);
    },
    staleTime: 1000 * 60 * 10,
  });

  const data = useMemo(() => {
    const items = query.data ?? [];
    if (isPrivileged || !scope) return items;
    // Wali kelas yang tidak merangkap mapel tetap boleh melihat mapel kelasnya, guru mapel hanya mapel yg diampu
    if (scope.subjectAssignments.length === 0 && scope.homeroomClassroomIds.length > 0) {
      return items;
    }
    const allowed = new Set(scope.subjectAssignments.map((a) => a.subjectId));
    return items.filter((item) => allowed.has(item.id));
  }, [query.data, isPrivileged, scope]);

  return { ...query, data };
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
