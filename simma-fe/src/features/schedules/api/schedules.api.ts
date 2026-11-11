import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type {
  ScheduleRoomItem,
  ScheduleTimeSlotItem,
  ScheduleItem,
  ScheduleMatrixView,
  CollisionResult,
  ScheduleFormData,
  BatchScheduleFormData,
  ScheduleViewType,
} from "../types";
import type { DayOfWeek } from "@simma/shared";

export const SCHEDULE_QUERY_KEYS = {
  rooms: ["schedules", "rooms"] as const,
  timeSlots: ["schedules", "timeSlots"] as const,
  list: (params?: Record<string, unknown>) => ["schedules", "list", params] as const,
  matrix: (viewType: ScheduleViewType, targetId?: string, academicYearId?: string, semesterId?: string) =>
    ["schedules", "matrix", viewType, targetId, academicYearId, semesterId] as const,
};

// Rooms API
export function useScheduleRooms(params?: { roomType?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: [...SCHEDULE_QUERY_KEYS.rooms, params],
    queryFn: () =>
      apiClient<ScheduleRoomItem[]>(API_ENDPOINTS.SCHEDULES.ROOMS, {
        params: params as Record<string, string | number | boolean>,
      }),
  });
}

export function useCreateScheduleRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ScheduleRoomItem>) =>
      apiClient<ScheduleRoomItem>(API_ENDPOINTS.SCHEDULES.ROOMS, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.rooms });
    },
  });
}

export function useUpdateScheduleRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ScheduleRoomItem> }) =>
      apiClient<ScheduleRoomItem>(API_ENDPOINTS.SCHEDULES.ROOM_DETAIL(id), {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.rooms });
    },
  });
}

export function useDeleteScheduleRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(API_ENDPOINTS.SCHEDULES.ROOM_DETAIL(id), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.rooms });
    },
  });
}

// Time Slots API
export function useScheduleTimeSlots(params?: { dayOfWeek?: DayOfWeek; sessionType?: string }) {
  return useQuery({
    queryKey: [...SCHEDULE_QUERY_KEYS.timeSlots, params],
    queryFn: () =>
      apiClient<ScheduleTimeSlotItem[]>(API_ENDPOINTS.SCHEDULES.TIME_SLOTS, {
        params: params as Record<string, string | number | boolean>,
      }),
  });
}

export function useCreateScheduleTimeSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ScheduleTimeSlotItem>) =>
      apiClient<ScheduleTimeSlotItem>(API_ENDPOINTS.SCHEDULES.TIME_SLOTS, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.timeSlots });
    },
  });
}

export function useUpdateScheduleTimeSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ScheduleTimeSlotItem> }) =>
      apiClient<ScheduleTimeSlotItem>(API_ENDPOINTS.SCHEDULES.TIME_SLOT_DETAIL(id), {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.timeSlots });
    },
  });
}

export function useDeleteScheduleTimeSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(API_ENDPOINTS.SCHEDULES.TIME_SLOT_DETAIL(id), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_QUERY_KEYS.timeSlots });
    },
  });
}

// Matrix & Schedule Query
export function useScheduleMatrix(
  viewType: ScheduleViewType,
  targetId?: string,
  academicYearId?: string,
  semesterId?: string,
) {
  return useQuery({
    queryKey: SCHEDULE_QUERY_KEYS.matrix(viewType, targetId, academicYearId, semesterId),
    queryFn: () =>
      apiClient<ScheduleMatrixView>(API_ENDPOINTS.SCHEDULES.MATRIX, {
        params: {
          viewType,
          targetId: targetId || "",
          academicYearId,
          semesterId,
        },
      }),
    enabled: Boolean(targetId),
  });
}

export function useCheckScheduleCollision() {
  return useMutation({
    mutationFn: (data: {
      scheduleId?: string;
      dayOfWeek: DayOfWeek;
      timeSlotId: string;
      teacherId: string;
      roomId?: string;
      classroomId: string;
      academicYearId?: string;
      semesterId?: string;
    }) =>
      apiClient<CollisionResult>(API_ENDPOINTS.SCHEDULES.CHECK_COLLISION, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ScheduleFormData) =>
      apiClient<ScheduleItem>(API_ENDPOINTS.SCHEDULES.LIST, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ScheduleFormData> }) =>
      apiClient<ScheduleItem>(API_ENDPOINTS.SCHEDULES.DETAIL(id), {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(API_ENDPOINTS.SCHEDULES.DETAIL(id), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export function useCreateBatchSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BatchScheduleFormData) =>
      apiClient<{ message: string; count: number }>(API_ENDPOINTS.SCHEDULES.BATCH, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
}

export async function exportSchedulePdf(params: {
  viewType: ScheduleViewType;
  targetId: string;
  academicYearId?: string;
  semesterId?: string;
}): Promise<Blob> {
  return apiClient<Blob>(API_ENDPOINTS.SCHEDULES.EXPORT_PDF, {
    params: {
      viewType: params.viewType,
      targetId: params.targetId,
      academicYearId: params.academicYearId,
      semesterId: params.semesterId,
    },
    responseType: "blob",
  });
}
