import type {
  FeeItem,
  CreateFeeItemInput,
  UpdateFeeItemInput,
  QueryFeeItemParams,
  StudentInvoice,
  GenerateInvoicesInput,
  QueryInvoicesParams,
  ProcessPaymentInput,
  VoidPaymentInput,
  CreateDispensationInput,
  UpdateDispensationStatusInput,
  CashierSearchQuery,
  CashflowReportQuery,
  ArrearsReportQuery,
} from "@simma/shared";
import type {
  FeeItemRow,
  StudentInvoiceRow,
  PaymentTransactionRow,
  PaymentTransactionItemRow,
  DispensationRequestRow,
} from "../../db/schema/index.js";

export type {
  FeeItem,
  CreateFeeItemInput,
  UpdateFeeItemInput,
  QueryFeeItemParams,
  StudentInvoice,
  GenerateInvoicesInput,
  QueryInvoicesParams,
  ProcessPaymentInput,
  VoidPaymentInput,
  CreateDispensationInput,
  UpdateDispensationStatusInput,
  CashierSearchQuery,
  CashflowReportQuery,
  ArrearsReportQuery,
  FeeItemRow,
  StudentInvoiceRow,
  PaymentTransactionRow,
  PaymentTransactionItemRow,
  DispensationRequestRow,
};

export interface StudentCashierProfile {
  student: {
    id: string;
    fullName: string;
    nis: string | null;
    nisn: string | null;
    status: string;
    classroomName: string | null;
    classroomId: string | null;
  };
  unpaidInvoices: Array<
    StudentInvoiceRow & {
      feeName: string;
      feeCategory: string;
    }
  >;
  recentTransactions: Array<
    PaymentTransactionRow & {
      itemCount: number;
    }
  >;
  totalArrears: number;
}

export interface ReceiptPdfData {
  transaction: PaymentTransactionRow;
  student: {
    fullName: string;
    nis: string | null;
    nisn: string | null;
    classroomName: string | null;
  };
  cashierName: string;
  items: Array<{
    feeName: string;
    invoiceNumber: string;
    month?: number | null;
    year: number;
    amount: number;
  }>;
  institution: {
    name: string;
    nsm?: string | null;
    npsn?: string | null;
    address?: string | null;
  };
}
