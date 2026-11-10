import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { API_ENDPOINTS } from "../../../config/endpoints";
import type {
  FeeItemDto,
  StudentInvoiceDto,
  StudentBillingProfileDto,
  PaymentTransactionDto,
  DispensationDto,
  CashflowReportDto,
  ArrearsReportDto,
} from "../types";
import type {
  CreateFeeItemInput,
  UpdateFeeItemInput,
  GenerateInvoicesInput,
  ProcessPaymentInput,
  VoidPaymentInput,
  CreateDispensationInput,
  UpdateDispensationStatusInput,
} from "@simma/shared";

type QueryParamMap = Record<string, string | number | boolean | null | undefined>;

export const financeKeys = {
  all: ["finance"] as const,
  feeItems: (params?: QueryParamMap) => [...financeKeys.all, "feeItems", params] as const,
  feeItem: (id: string) => [...financeKeys.all, "feeItem", id] as const,
  invoices: (params?: QueryParamMap) => [...financeKeys.all, "invoices", params] as const,
  invoice: (id: string) => [...financeKeys.all, "invoice", id] as const,
  studentProfile: (studentId: string) => [...financeKeys.all, "studentProfile", studentId] as const,
  searchStudents: (q: string) => [...financeKeys.all, "searchStudents", q] as const,
  dispensations: (studentId?: string) => [...financeKeys.all, "dispensations", { studentId }] as const,
  cashflow: (params?: QueryParamMap) => [...financeKeys.all, "cashflow", params] as const,
  arrears: (params?: QueryParamMap) => [...financeKeys.all, "arrears", params] as const,
};

// Fee Items
export const useFeeItems = (params?: QueryParamMap) =>
  useQuery({
    queryKey: financeKeys.feeItems(params),
    queryFn: () => apiClient<FeeItemDto[]>(API_ENDPOINTS.FINANCE.FEE_ITEMS, { params }),
  });

export const useCreateFeeItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFeeItemInput) =>
      apiClient<FeeItemDto>(API_ENDPOINTS.FINANCE.FEE_ITEMS, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.feeItems() });
    },
  });
};

export const useUpdateFeeItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateFeeItemInput & { id: string }) =>
      apiClient<FeeItemDto>(API_ENDPOINTS.FINANCE.FEE_ITEM_DETAIL(id), {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.feeItems() });
    },
  });
};

export const useDeleteFeeItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<{ message: string }>(API_ENDPOINTS.FINANCE.FEE_ITEM_DETAIL(id), {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.feeItems() });
    },
  });
};

// Invoices
export const useInvoices = (params?: QueryParamMap) =>
  useQuery({
    queryKey: financeKeys.invoices(params),
    queryFn: () => apiClient<StudentInvoiceDto[]>(API_ENDPOINTS.FINANCE.INVOICES, { params }),
  });

export const useGenerateInvoices = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: GenerateInvoicesInput) =>
      apiClient<{ totalEligible: number; generated: number; skipped: number }>(
        API_ENDPOINTS.FINANCE.GENERATE_INVOICES,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.invoices() });
      qc.invalidateQueries({ queryKey: financeKeys.arrears() });
    },
  });
};

// Cashier POS
export const useSearchStudents = (q: string) =>
  useQuery({
    queryKey: financeKeys.searchStudents(q),
    queryFn: () =>
      apiClient<Array<{ id: string; fullName: string; nis: string | null; nisn: string | null; classroomName: string | null }>>(
        API_ENDPOINTS.FINANCE.CASHIER_SEARCH,
        { params: { q } }
      ),
    enabled: q.trim().length >= 2,
  });

export const useStudentBillingProfile = (studentId?: string) =>
  useQuery({
    queryKey: financeKeys.studentProfile(studentId ?? ""),
    queryFn: () =>
      apiClient<StudentBillingProfileDto>(API_ENDPOINTS.FINANCE.CASHIER_STUDENT_PROFILE(studentId!)),
    enabled: !!studentId,
  });

export const useProcessPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProcessPaymentInput) =>
      apiClient<PaymentTransactionDto>(API_ENDPOINTS.FINANCE.CASHIER_PAY, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: financeKeys.studentProfile(vars.studentId) });
      qc.invalidateQueries({ queryKey: financeKeys.invoices() });
      qc.invalidateQueries({ queryKey: financeKeys.cashflow() });
      qc.invalidateQueries({ queryKey: financeKeys.arrears() });
    },
  });
};

export const useVoidPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: VoidPaymentInput & { id: string }) =>
      apiClient<PaymentTransactionDto>(API_ENDPOINTS.FINANCE.CASHIER_VOID(id), {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
};

// Dispensations
export const useDispensations = (studentId?: string) =>
  useQuery({
    queryKey: financeKeys.dispensations(studentId),
    queryFn: () =>
      apiClient<DispensationDto[]>(API_ENDPOINTS.FINANCE.DISPENSATIONS, {
        params: studentId ? { studentId } : undefined,
      }),
  });

export const useCreateDispensation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDispensationInput) =>
      apiClient<DispensationDto>(API_ENDPOINTS.FINANCE.DISPENSATIONS, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.dispensations() });
    },
  });
};

export const useUpdateDispensationStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateDispensationStatusInput & { id: string }) =>
      apiClient<DispensationDto>(API_ENDPOINTS.FINANCE.DISPENSATION_STATUS(id), {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: financeKeys.dispensations() });
    },
  });
};

// Reports
export const useCashflowReport = (params?: QueryParamMap) =>
  useQuery({
    queryKey: financeKeys.cashflow(params),
    queryFn: () => apiClient<CashflowReportDto>(API_ENDPOINTS.FINANCE.REPORTS_CASHFLOW, { params }),
  });

export const useArrearsReport = (params?: QueryParamMap) =>
  useQuery({
    queryKey: financeKeys.arrears(params),
    queryFn: () => apiClient<ArrearsReportDto>(API_ENDPOINTS.FINANCE.REPORTS_ARREARS, { params }),
  });
