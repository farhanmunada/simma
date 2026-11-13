import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type {
  FacilityAsset,
  FacilityLoan,
  FacilityMaintenanceTicket,
  FacilityStats,
  CreateFacilityAssetInput,
  UpdateFacilityAssetInput,
  CreateFacilityLoanInput,
  ReturnFacilityLoanInput,
  CreateFacilityMaintenanceTicketInput,
  UpdateFacilityMaintenanceTicketInput,
  QueryFacilityAssetsInput,
} from "../types";

export const FACILITY_QUERY_KEYS = {
  stats: ["facilities", "stats"] as const,
  assets: (filters?: QueryFacilityAssetsInput) =>
    ["facilities", "assets", filters] as const,
  assetDetail: (id: string) => ["facilities", "assets", "detail", id] as const,
  scan: (token: string) => ["facilities", "scan", token] as const,
  loans: (filters?: Record<string, string | number | boolean>) =>
    ["facilities", "loans", filters] as const,
  maintenance: (filters?: Record<string, string | number | boolean>) =>
    ["facilities", "maintenance", filters] as const,
};

// --- Stats ---
export function useFacilityStats() {
  return useQuery({
    queryKey: FACILITY_QUERY_KEYS.stats,
    queryFn: async () => {
      const res = await apiClient<{ data: FacilityStats }>(
        API_ENDPOINTS.FACILITIES.STATS,
      );
      return res.data;
    },
  });
}

// --- Assets ---
export function useFacilityAssets(filters?: QueryFacilityAssetsInput) {
  return useQuery({
    queryKey: FACILITY_QUERY_KEYS.assets(filters),
    queryFn: async () => {
      const res = await apiClient<{ data: FacilityAsset[] }>(
        API_ENDPOINTS.FACILITIES.ASSETS,
        {
          params: filters as Record<string, string | number | boolean>,
        },
      );
      return res.data;
    },
  });
}

export function useFacilityAssetDetail(id?: string) {
  return useQuery({
    queryKey: FACILITY_QUERY_KEYS.assetDetail(id ?? ""),
    queryFn: async () => {
      const res = await apiClient<{ data: FacilityAsset }>(
        API_ENDPOINTS.FACILITIES.ASSET_DETAIL(id!),
      );
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useFacilityScan(token?: string) {
  return useQuery({
    queryKey: FACILITY_QUERY_KEYS.scan(token ?? ""),
    queryFn: async () => {
      const res = await apiClient<{ data: FacilityAsset }>(
        API_ENDPOINTS.FACILITIES.SCAN(token!),
      );
      return res.data;
    },
    enabled: Boolean(token),
  });
}

export function useCreateFacilityAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFacilityAssetInput) =>
      apiClient<{ data: FacilityAsset }>(API_ENDPOINTS.FACILITIES.ASSETS, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });
}

export function useUpdateFacilityAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFacilityAssetInput }) =>
      apiClient<{ data: FacilityAsset }>(
        API_ENDPOINTS.FACILITIES.ASSET_DETAIL(id),
        {
          method: "PATCH",
          body: JSON.stringify(data),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });
}

export function useDeleteFacilityAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(
        API_ENDPOINTS.FACILITIES.ASSET_DETAIL(id),
        {
          method: "DELETE",
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });
}

export function useUploadFacilityImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiClient<{ data: { url: string; fileName: string } }>(
        API_ENDPOINTS.FACILITIES.UPLOAD_IMAGE,
        {
          method: "POST",
          body: formData,
        },
      );
      return res.data;
    },
  });
}

// --- Loans ---
export function useFacilityLoans(
  filters?: Record<string, string | number | boolean>,
) {
  return useQuery({
    queryKey: FACILITY_QUERY_KEYS.loans(filters),
    queryFn: async () => {
      const res = await apiClient<{ data: FacilityLoan[] }>(
        API_ENDPOINTS.FACILITIES.LOANS,
        {
          params: filters,
        },
      );
      return res.data;
    },
  });
}

export function useCreateFacilityLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFacilityLoanInput) =>
      apiClient<{ data: FacilityLoan }>(API_ENDPOINTS.FACILITIES.LOANS, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });
}

export function useReturnFacilityLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnFacilityLoanInput }) =>
      apiClient<{ data: FacilityLoan }>(
        API_ENDPOINTS.FACILITIES.LOAN_RETURN(id),
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });
}

// --- Maintenance Tickets ---
export function useFacilityMaintenanceTickets(
  filters?: Record<string, string | number | boolean>,
) {
  return useQuery({
    queryKey: FACILITY_QUERY_KEYS.maintenance(filters),
    queryFn: async () => {
      const res = await apiClient<{ data: FacilityMaintenanceTicket[] }>(
        API_ENDPOINTS.FACILITIES.MAINTENANCE,
        {
          params: filters,
        },
      );
      return res.data;
    },
  });
}

export function useCreateFacilityMaintenanceTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFacilityMaintenanceTicketInput) =>
      apiClient<{ data: FacilityMaintenanceTicket }>(
        API_ENDPOINTS.FACILITIES.MAINTENANCE,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });
}

export function useUpdateFacilityMaintenanceTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFacilityMaintenanceTicketInput;
    }) =>
      apiClient<{ data: FacilityMaintenanceTicket }>(
        API_ENDPOINTS.FACILITIES.MAINTENANCE_DETAIL(id),
        {
          method: "PATCH",
          body: JSON.stringify(data),
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });
}
