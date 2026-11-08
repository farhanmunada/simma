import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import type {
  PpdbApplicant,
  PpdbApplicantsResponse,
  PpdbStats,
  PpdbPublicInfo,
  PpdbDocument,
  RegisterApplicantInput,
  UpdateApplicantStatusInput,
  CheckStatusQueryParams,
  PpdbRegisterAccountInput,
  PpdbLoginInput,
  UpdateApplicantFormInput,
  VerifyDocumentInput,
} from "../types";

export interface PpdbQueryParams {
  search?: string;
  status?: string;
  track?: string;
  major?: string;
  academicYearId?: string;
  page?: number;
  limit?: number;
}

// 1. Calon Siswa Authentication & Portal Hooks
export const useRegisterAccount = () => {
  return useMutation({
    mutationFn: (data: PpdbRegisterAccountInput) =>
      apiClient<{
        applicant: PpdbApplicant;
        token: string;
      }>("/ppdb/portal/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
};

export const useLoginCalonSiswa = () => {
  return useMutation({
    mutationFn: (data: PpdbLoginInput) =>
      apiClient<{
        applicant: PpdbApplicant;
        token: string;
      }>("/ppdb/portal/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
};

export const useMyApplication = () => {
  return useQuery<PpdbApplicant>({
    queryKey: ["ppdb", "portal", "me"],
    queryFn: () => apiClient<PpdbApplicant>("/ppdb/portal/me"),
  });
};

export const useUpdateMyApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateApplicantFormInput) =>
      apiClient<PpdbApplicant>("/ppdb/portal/me", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ppdb", "portal", "me"] });
    },
  });
};

export const useFinalizeMyApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient<PpdbApplicant>("/ppdb/portal/me/finalize", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ppdb", "portal", "me"] });
    },
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, documentType }: { file: File; documentType: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      return apiClient<PpdbDocument>("/ppdb/portal/me/documents", {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ppdb", "portal", "me"] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) =>
      apiClient<{ message: string }>(`/ppdb/portal/me/documents/${documentId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ppdb", "portal", "me"] });
    },
  });
};

// 2. Public API Hooks
export const usePpdbPublicInfo = () => {
  return useQuery<PpdbPublicInfo>({
    queryKey: ["ppdb", "public-info"],
    queryFn: () => apiClient<PpdbPublicInfo>("/ppdb/public-info"),
    staleTime: 1000 * 60 * 10,
  });
};

export const useRegisterApplicant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterApplicantInput) =>
      apiClient<PpdbApplicant>("/ppdb/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ppdb", "applicants"] });
      queryClient.invalidateQueries({ queryKey: ["ppdb", "stats"] });
    },
  });
};

export const useCheckPpdbStatus = () => {
  return useMutation({
    mutationFn: (input: CheckStatusQueryParams) =>
      apiClient<PpdbApplicant>("/ppdb/check-status", {
        params: {
          registrationNumber: input.registrationNumber,
          nikOrNisn: input.nikOrNisn,
        },
      }),
  });
};

// 2. Internal Staff API Hooks
export const usePpdbStats = () => {
  return useQuery<PpdbStats>({
    queryKey: ["ppdb", "stats"],
    queryFn: () => apiClient<PpdbStats>("/ppdb/stats"),
  });
};

export const usePpdbApplicants = (params: PpdbQueryParams = {}) => {
  return useQuery<PpdbApplicantsResponse>({
    queryKey: ["ppdb", "applicants", params],
    queryFn: () =>
      apiClient<PpdbApplicantsResponse>("/ppdb/applicants", {
        params: {
          search: params.search,
          status: params.status,
          track: params.track,
          major: params.major,
          academicYearId: params.academicYearId,
          page: params.page,
          limit: params.limit,
        },
      }),
  });
};

export const usePpdbApplicant = (id: string | undefined) => {
  return useQuery<PpdbApplicant>({
    queryKey: ["ppdb", "applicants", id],
    queryFn: () => {
      if (!id) throw new Error("ID pendaftar diperlukan");
      return apiClient<PpdbApplicant>(`/ppdb/applicants/${id}`);
    },
    enabled: Boolean(id),
  });
};

export const useVerifyDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      documentId,
      data,
    }: {
      documentId: string;
      data: VerifyDocumentInput;
    }) =>
      apiClient<PpdbDocument>(`/ppdb/documents/${documentId}/verify`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ppdb", "applicants"] });
    },
  });
};

export const useUpdateApplicantStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateApplicantStatusInput;
    }) =>
      apiClient<PpdbApplicant>(`/ppdb/applicants/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ppdb", "applicants"] });
      queryClient.invalidateQueries({ queryKey: ["ppdb", "stats"] });
    },
  });
};

export const useEnrollApplicant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ studentId: string; message: string }>(
        `/ppdb/applicants/${id}/enroll`,
        {
          method: "POST",
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ppdb", "applicants"] });
      queryClient.invalidateQueries({ queryKey: ["ppdb", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useDeleteApplicant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`/ppdb/applicants/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ppdb", "applicants"] });
      queryClient.invalidateQueries({ queryKey: ["ppdb", "stats"] });
    },
  });
};
