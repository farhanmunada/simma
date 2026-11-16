import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
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
      }>(API_ENDPOINTS.PPDB.PORTAL_REGISTER, {
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
      }>(API_ENDPOINTS.PPDB.PORTAL_LOGIN, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
};

export const useMyApplication = () => {
  return useQuery<PpdbApplicant>({
    queryKey: ["ppdb", "portal", "me"],
    queryFn: () => apiClient<PpdbApplicant>(API_ENDPOINTS.PPDB.PORTAL_ME),
  });
};

export const useUpdateMyApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateApplicantFormInput) =>
      apiClient<PpdbApplicant>(API_ENDPOINTS.PPDB.PORTAL_UPDATE, {
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
      apiClient<PpdbApplicant>(API_ENDPOINTS.PPDB.PORTAL_FINALIZE, {
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

      return apiClient<PpdbDocument>(API_ENDPOINTS.PPDB.PORTAL_DOCUMENTS, {
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
      apiClient<{ message: string }>(API_ENDPOINTS.PPDB.PORTAL_DOCUMENT_DELETE(documentId), {
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
    queryFn: () => apiClient<PpdbPublicInfo>(API_ENDPOINTS.PPDB.PUBLIC_INFO),
    staleTime: 1000 * 60 * 10,
  });
};

export const useRegisterApplicant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterApplicantInput) =>
      apiClient<PpdbApplicant>(API_ENDPOINTS.PPDB.REGISTER_ACCOUNT, {
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
      apiClient<PpdbApplicant>(API_ENDPOINTS.PPDB.CHECK_STATUS, {
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
    queryFn: () => apiClient<PpdbStats>(API_ENDPOINTS.PPDB.STATS),
  });
};

export const usePpdbApplicants = (params: PpdbQueryParams = {}) => {
  return useQuery<PpdbApplicantsResponse>({
    queryKey: ["ppdb", "applicants", params],
    queryFn: () =>
      apiClient<PpdbApplicantsResponse>(API_ENDPOINTS.PPDB.APPLICANTS, {
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
      return apiClient<PpdbApplicant>(API_ENDPOINTS.PPDB.APPLICANT_DETAIL(id));
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
      apiClient<PpdbDocument>(API_ENDPOINTS.PPDB.DOCUMENT_VERIFY(documentId), {
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
      apiClient<PpdbApplicant>(API_ENDPOINTS.PPDB.APPLICANT_STATUS(id), {
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
        API_ENDPOINTS.PPDB.APPLICANT_ENROLL(id),
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
      apiClient<void>(API_ENDPOINTS.PPDB.APPLICANT_DELETE(id), {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ppdb", "applicants"] });
      queryClient.invalidateQueries({ queryKey: ["ppdb", "stats"] });
    },
  });
};
