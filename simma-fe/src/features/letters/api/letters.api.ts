import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type {
  LetterClassification,
  IncomingLetter,
  Disposition,
  OutgoingLetter,
  ExpeditionBook,
  LettersStats,
  LetterQueryParams,
  PaginatedResponse,
  CreateIncomingLetterInput,
  UpdateIncomingLetterStatusInput,
  CreateDispositionInput,
  UpdateDispositionStatusInput,
  CreateOutgoingLetterInput,
  UpdateOutgoingLetterStatusInput,
  GenerateStudentActiveLetterInput,
  GenerateTeacherDutyLetterInput,
  GenerateParentInvitationLetterInput,
  CreateExpeditionBookInput,
  CreateClassificationInput,
} from "../types";

export const lettersQueryKeys = {
  all: ["letters"] as const,
  stats: () => [...lettersQueryKeys.all, "stats"] as const,
  classifications: (search?: string) =>
    [...lettersQueryKeys.all, "classifications", { search }] as const,
  incoming: (params?: LetterQueryParams) =>
    [...lettersQueryKeys.all, "incoming", params] as const,
  incomingDetail: (id: string) =>
    [...lettersQueryKeys.all, "incoming", id] as const,
  dispositions: (params?: { incomingLetterId?: string; status?: string }) =>
    [...lettersQueryKeys.all, "dispositions", params] as const,
  outgoing: (params?: LetterQueryParams) =>
    [...lettersQueryKeys.all, "outgoing", params] as const,
  outgoingDetail: (id: string) =>
    [...lettersQueryKeys.all, "outgoing", id] as const,
  expeditions: (params?: { page?: number; limit?: number }) =>
    [...lettersQueryKeys.all, "expeditions", params] as const,
  verify: (hash: string) =>
    [...lettersQueryKeys.all, "verify", hash] as const,
};

const buildQueryString = (params?: Record<string, unknown>): string => {
  if (!params) return "";
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });
  const str = query.toString();
  return str ? `?${str}` : "";
};

// 1. Dashboard Stats & Master Klasifikasi
export const getLettersStats = () =>
  apiClient<{ success: boolean; data: LettersStats }>(
    `${API_ENDPOINTS.LETTERS.INCOMING}/../stats`
  );

export const useLettersStats = () =>
  useQuery({
    queryKey: lettersQueryKeys.stats(),
    queryFn: async () => {
      const res = await apiClient<{ success: boolean; data: LettersStats }>(
        "/letters/stats"
      );
      return res.data;
    },
  });

export const getClassifications = (search?: string) =>
  apiClient<{ success: boolean; data: LetterClassification[] }>(
    `${API_ENDPOINTS.LETTERS.CLASSIFICATIONS}${buildQueryString({ search })}`
  );

export const useClassifications = (search?: string) =>
  useQuery({
    queryKey: lettersQueryKeys.classifications(search),
    queryFn: async () => {
      const res = await getClassifications(search);
      return res.data;
    },
  });

export const useSeedClassifications = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient<{ success: boolean; count: number }>(
        `${API_ENDPOINTS.LETTERS.CLASSIFICATIONS}/seed`,
        { method: "POST" }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lettersQueryKeys.all });
    },
  });
};

export const useCreateClassification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClassificationInput) =>
      apiClient<{ success: boolean; data: LetterClassification }>(
        API_ENDPOINTS.LETTERS.CLASSIFICATIONS,
        { method: "POST", body: JSON.stringify(data) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lettersQueryKeys.all });
    },
  });
};

// 2. Agenda Surat Masuk
export const getIncomingLetters = (params?: LetterQueryParams) =>
  apiClient<{ success: boolean; data: IncomingLetter[]; meta: PaginatedResponse<IncomingLetter>["meta"] }>(
    `${API_ENDPOINTS.LETTERS.INCOMING}${buildQueryString(params as Record<string, unknown>)}`
  );

export const useIncomingLetters = (params?: LetterQueryParams) =>
  useQuery({
    queryKey: lettersQueryKeys.incoming(params),
    queryFn: () => getIncomingLetters(params),
  });

export const useCreateIncomingLetter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIncomingLetterInput) =>
      apiClient<{ success: boolean; data: IncomingLetter }>(
        API_ENDPOINTS.LETTERS.INCOMING,
        { method: "POST", body: JSON.stringify(data) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lettersQueryKeys.all });
    },
  });
};

export const useUpdateIncomingLetterStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncomingLetterStatusInput }) =>
      apiClient<{ success: boolean; data: IncomingLetter }>(
        API_ENDPOINTS.LETTERS.INCOMING_STATUS(id),
        { method: "PATCH", body: JSON.stringify(data) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lettersQueryKeys.all });
    },
  });
};

// 3. Lembar Disposisi Digital
export const getDispositions = (params?: { incomingLetterId?: string; status?: string }) =>
  apiClient<{ success: boolean; data: Disposition[] }>(
    `${API_ENDPOINTS.LETTERS.DISPOSITIONS}${buildQueryString(params as Record<string, unknown>)}`
  );

export const useDispositions = (params?: { incomingLetterId?: string; status?: string }) =>
  useQuery({
    queryKey: lettersQueryKeys.dispositions(params),
    queryFn: async () => {
      const res = await getDispositions(params);
      return res.data;
    },
  });

export const useCreateDisposition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDispositionInput) =>
      apiClient<{ success: boolean; data: Disposition }>(
        API_ENDPOINTS.LETTERS.DISPOSITIONS,
        { method: "POST", body: JSON.stringify(data) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lettersQueryKeys.all });
    },
  });
};

export const useUpdateDispositionStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDispositionStatusInput }) =>
      apiClient<{ success: boolean; data: Disposition }>(
        API_ENDPOINTS.LETTERS.DISPOSITION_STATUS(id),
        { method: "PATCH", body: JSON.stringify(data) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lettersQueryKeys.all });
    },
  });
};

// 4. Surat Keluar & Penomoran Kemenag
export const getOutgoingLetters = (params?: LetterQueryParams) =>
  apiClient<{ success: boolean; data: OutgoingLetter[]; meta: PaginatedResponse<OutgoingLetter>["meta"] }>(
    `${API_ENDPOINTS.LETTERS.OUTGOING}${buildQueryString(params as Record<string, unknown>)}`
  );

export const useOutgoingLetters = (params?: LetterQueryParams) =>
  useQuery({
    queryKey: lettersQueryKeys.outgoing(params),
    queryFn: () => getOutgoingLetters(params),
  });

export const useCreateOutgoingLetter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOutgoingLetterInput) =>
      apiClient<{ success: boolean; data: OutgoingLetter }>(
        API_ENDPOINTS.LETTERS.OUTGOING,
        { method: "POST", body: JSON.stringify(data) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lettersQueryKeys.all });
    },
  });
};

export const useUpdateOutgoingLetterStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOutgoingLetterStatusInput }) =>
      apiClient<{ success: boolean; data: OutgoingLetter }>(
        `${API_ENDPOINTS.LETTERS.OUTGOING}/${id}/status`,
        { method: "PATCH", body: JSON.stringify(data) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lettersQueryKeys.all });
    },
  });
};

// 5. Generator Surat Resmi & PDF Hooks
export {
  useGenerateStudentLetter,
  useGenerateTeacherLetter,
  useGenerateInvitationLetter,
  useVerifyLetter,
} from "./letters-generator.api";

// 6. Buku Ekspedisi
export const getExpeditions = (params?: { page?: number; limit?: number }) =>
  apiClient<{ success: boolean; data: ExpeditionBook[]; meta: PaginatedResponse<ExpeditionBook>["meta"] }>(
    `${API_ENDPOINTS.LETTERS.EXPEDITIONS}${buildQueryString(params as Record<string, unknown>)}`
  );

export const useExpeditions = (params?: { page?: number; limit?: number }) =>
  useQuery({
    queryKey: lettersQueryKeys.expeditions(params),
    queryFn: () => getExpeditions(params),
  });

export const useCreateExpedition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpeditionBookInput) =>
      apiClient<{ success: boolean; data: ExpeditionBook }>(
        API_ENDPOINTS.LETTERS.EXPEDITIONS,
        { method: "POST", body: JSON.stringify(data) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lettersQueryKeys.all });
    },
  });
};
