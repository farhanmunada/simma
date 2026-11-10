import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import { lettersQueryKeys } from "./letters.api";
import type {
  OutgoingLetter,
  GenerateStudentActiveLetterInput,
  GenerateTeacherDutyLetterInput,
  GenerateParentInvitationLetterInput,
} from "../types";

export const useGenerateStudentLetter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateStudentActiveLetterInput) =>
      apiClient<{ success: boolean; data: OutgoingLetter }>(
        API_ENDPOINTS.LETTERS.GENERATE_STUDENT_ACTIVE,
        { method: "POST", body: JSON.stringify(data) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lettersQueryKeys.all });
    },
  });
};

export const useGenerateStudentBehaviorLetter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateStudentActiveLetterInput) =>
      apiClient<{ success: boolean; data: OutgoingLetter }>(
        API_ENDPOINTS.LETTERS.GENERATE_STUDENT_BEHAVIOR,
        { method: "POST", body: JSON.stringify(data) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lettersQueryKeys.all });
    },
  });
};

export const useGenerateTeacherLetter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateTeacherDutyLetterInput) =>
      apiClient<{ success: boolean; data: OutgoingLetter }>(
        API_ENDPOINTS.LETTERS.GENERATE_TEACHER,
        { method: "POST", body: JSON.stringify(data) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lettersQueryKeys.all });
    },
  });
};

export const useGenerateInvitationLetter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateParentInvitationLetterInput) =>
      apiClient<{ success: boolean; data: OutgoingLetter }>(
        API_ENDPOINTS.LETTERS.GENERATE_INVITATION,
        { method: "POST", body: JSON.stringify(data) }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lettersQueryKeys.all });
    },
  });
};

export const useVerifyLetter = (hash: string) =>
  useQuery({
    queryKey: lettersQueryKeys.verify(hash),
    queryFn: () =>
      apiClient<{ success: boolean; data: OutgoingLetter }>(
        API_ENDPOINTS.LETTERS.VERIFY(hash)
      ),
    enabled: Boolean(hash),
  });
