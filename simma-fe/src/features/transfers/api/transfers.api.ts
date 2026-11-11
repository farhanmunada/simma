import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type {
  TransferItem,
  TransferStatsData,
  TransferFilterParams,
  GraduationItem,
  GraduationFilterParams,
  ClearanceDimension,
} from "../types";
import type {
  CreateTransferInInput,
  CreateTransferOutInput,
  BatchGraduationInput,
} from "@simma/shared";

export const TRANSFER_QUERY_KEYS = {
  stats: ["transfers", "stats"] as const,
  list: (params?: TransferFilterParams) => ["transfers", "list", params] as const,
  detail: (id: string) => ["transfers", "detail", id] as const,
  verify: (code: string) => ["transfers", "verify", code] as const,
  graduations: (params?: GraduationFilterParams) => ["transfers", "graduations", params] as const,
};

export function useTransferStats() {
  return useQuery({
    queryKey: TRANSFER_QUERY_KEYS.stats,
    queryFn: () => apiClient<TransferStatsData>(API_ENDPOINTS.TRANSFERS.STATS),
  });
}

export function useTransfers(params?: TransferFilterParams) {
  return useQuery({
    queryKey: TRANSFER_QUERY_KEYS.list(params),
    queryFn: () =>
      apiClient<{ data: TransferItem[]; meta: { total: number; page: number; limit: number } }>(
        API_ENDPOINTS.TRANSFERS.LIST,
        {
          params: params as Record<string, string | number | boolean>,
        }
      ),
  });
}

export function useTransferDetail(id?: string) {
  return useQuery({
    queryKey: TRANSFER_QUERY_KEYS.detail(id ?? ""),
    queryFn: () => apiClient<TransferItem>(API_ENDPOINTS.TRANSFERS.DETAIL(id!)),
    enabled: Boolean(id),
  });
}

export function useCreateTransferIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransferInInput) =>
      apiClient<TransferItem>(API_ENDPOINTS.TRANSFERS.CREATE_IN, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
    },
  });
}

export function useCreateTransferOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransferOutInput) =>
      apiClient<TransferItem>(API_ENDPOINTS.TRANSFERS.CREATE_OUT, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
    },
  });
}

export function useUpdateClearance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      dimension,
      cleared,
      notes,
    }: {
      id: string;
      dimension: ClearanceDimension;
      cleared: boolean;
      notes?: string;
    }) =>
      apiClient<TransferItem>(API_ENDPOINTS.TRANSFERS.UPDATE_CLEARANCE(id, dimension), {
        method: "PATCH",
        body: JSON.stringify({ cleared, notes }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["transfers", "list"] });
      queryClient.invalidateQueries({ queryKey: TRANSFER_QUERY_KEYS.stats });
    },
  });
}

export function useApproveTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approved, notes }: { id: string; approved: boolean; notes?: string }) =>
      apiClient<TransferItem>(API_ENDPOINTS.TRANSFERS.APPROVE(id), {
        method: "POST",
        body: JSON.stringify({ approved, notes }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["transfers", "list"] });
      queryClient.invalidateQueries({ queryKey: TRANSFER_QUERY_KEYS.stats });
    },
  });
}

export function useVerifyTransfer(code: string) {
  return useQuery({
    queryKey: TRANSFER_QUERY_KEYS.verify(code),
    queryFn: () => apiClient<TransferItem>(API_ENDPOINTS.TRANSFERS.VERIFY(code)),
    enabled: Boolean(code && code.length >= 6),
  });
}

export function useGraduations(params?: GraduationFilterParams) {
  return useQuery({
    queryKey: TRANSFER_QUERY_KEYS.graduations(params),
    queryFn: () =>
      apiClient<{ data: GraduationItem[]; meta: { total: number; page: number; limit: number } }>(
        API_ENDPOINTS.TRANSFERS.GRADUATIONS,
        {
          params: params as Record<string, string | number | boolean>,
        }
      ),
  });
}

export function useProcessGraduation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BatchGraduationInput) =>
      apiClient<{ processedCount: number }>(API_ENDPOINTS.TRANSFERS.GRADUATION_BATCH, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
    },
  });
}
