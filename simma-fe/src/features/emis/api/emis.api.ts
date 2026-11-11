import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type {
  EmisAuditResponse,
  EmisBapRecord,
  EmisExportType,
  EmisExportFormat,
} from "../types";
import type { EmisBapCreateInput, EmisBapApprovalInput } from "@simma/shared";

export const EMIS_QUERY_KEYS = {
  audit: ["emis", "audit"] as const,
  bapList: ["emis", "bap", "list"] as const,
  bapDetail: (id: string) => ["emis", "bap", "detail", id] as const,
};

export function useEmisAudit() {
  return useQuery({
    queryKey: EMIS_QUERY_KEYS.audit,
    queryFn: () => apiClient<EmisAuditResponse>(API_ENDPOINTS.EMIS.AUDIT),
  });
}

export function useEmisBapList() {
  return useQuery({
    queryKey: EMIS_QUERY_KEYS.bapList,
    queryFn: () => apiClient<{ data: EmisBapRecord[] }>(API_ENDPOINTS.EMIS.BAP_LIST),
  });
}

export function useEmisBapDetail(id?: string) {
  return useQuery({
    queryKey: EMIS_QUERY_KEYS.bapDetail(id ?? ""),
    queryFn: () => apiClient<EmisBapRecord>(API_ENDPOINTS.EMIS.BAP_DETAIL(id!)),
    enabled: Boolean(id),
  });
}

export function useCreateBapDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EmisBapCreateInput) =>
      apiClient<EmisBapRecord>(API_ENDPOINTS.EMIS.BAP_CREATE, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emis"] });
    },
  });
}

export function useApproveBap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EmisBapApprovalInput }) =>
      apiClient<EmisBapRecord>(API_ENDPOINTS.EMIS.BAP_APPROVE(id), {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emis"] });
    },
  });
}

export async function downloadEmisExport(
  type: EmisExportType,
  format: EmisExportFormat = "csv"
): Promise<void> {
  const endpointMap: Record<EmisExportType, string> = {
    students: API_ENDPOINTS.EMIS.EXPORT_STUDENTS,
    teachers: API_ENDPOINTS.EMIS.EXPORT_TEACHERS,
    classrooms: API_ENDPOINTS.EMIS.EXPORT_CLASSROOMS,
    institution: API_ENDPOINTS.EMIS.EXPORT_INSTITUTION,
    bundle: API_ENDPOINTS.EMIS.EXPORT_BUNDLE,
  };

  const endpoint = endpointMap[type];
  const blob = await apiClient<Blob>(endpoint, {
    params: { format },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const ext = format === "json" ? "json" : "csv";
  a.download = `EMIS-4.0-${type}-${new Date().toISOString().slice(0, 10)}.${ext}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function downloadBapPdf(id: string, bapNumber: string): Promise<void> {
  const blob = await apiClient<Blob>(API_ENDPOINTS.EMIS.BAP_PDF(id), {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const sanitized = bapNumber.replace(/[/\\?%*:|"<>]/g, "-");
  a.download = `${sanitized}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
