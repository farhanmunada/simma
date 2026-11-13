import type {
  FeeType,
  FeeCategory,
  PaymentMethod,
  InvoiceStatus,
  TransactionStatus,
  DispensationStatus,
} from "@simma/shared";

export type {
  FeeType,
  FeeCategory,
  PaymentMethod,
  InvoiceStatus,
  TransactionStatus,
  DispensationStatus,
};

export interface FeeItemDto {
  id: string;
  name: string;
  code: string;
  type: FeeType;
  category: FeeCategory;
  academicYearId?: string | null;
  amount: number;
  gradeLevel?: number | null;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentInvoiceDto {
  id: string;
  invoiceNumber: string;
  studentId: string;
  feeItemId: string;
  classroomId?: string | null;
  month?: number | null;
  year: number;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  dueDate?: string | null;
  notes?: string | null;
  studentName?: string;
  studentNis?: string | null;
  classroomName?: string | null;
  feeName?: string;
  feeCategory?: string;
}

export interface StudentBillingProfileDto {
  student: {
    id: string;
    fullName: string;
    nis: string | null;
    nisn: string | null;
    gender: string;
    status: string;
    classroomId: string | null;
    classroomName: string | null;
  };
  unpaidInvoices: Array<{
    invoice: StudentInvoiceDto;
    feeName: string;
    feeCategory: string;
  }>;
  history: Array<{
    id: string;
    receiptNumber: string;
    paymentDate: string;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    status: TransactionStatus;
  }>;
  dispensations: Array<DispensationDto>;
  totalArrears: number;
}

export interface PaymentTransactionItemDto {
  id: string;
  transactionId: string;
  invoiceId: string;
  feeName: string;
  month?: number | null;
  year: number;
  amount: number;
  notes?: string | null;
}

export interface PaymentTransactionDto {
  id: string;
  receiptNumber: string;
  studentId: string;
  cashierId?: string | null;
  cashierName?: string;
  studentName?: string;
  studentNis?: string | null;
  classroomName?: string | null;
  totalAmount: number;
  receivedAmount: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  status: TransactionStatus;
  notes?: string | null;
  items: PaymentTransactionItemDto[];
}

export interface DispensationDto {
  id: string;
  studentId: string;
  studentName?: string;
  classroomName?: string | null;
  reason: string;
  notes?: string | null;
  status: DispensationStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
}

export interface CashflowReportDto {
  summary: {
    totalRevenue: number;
    transactionCount: number;
    byMethod: Record<string, number>;
  };
  transactions: Array<{
    id: string;
    receiptNumber: string;
    paymentDate: string;
    studentName: string;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    cashierName?: string;
  }>;
}

export interface ArrearsReportDto {
  summary: {
    totalArrears: number;
    totalUnpaidInvoices: number;
    affectedStudentsCount: number;
  };
  byClassroom: Array<{
    classroomId: string | null;
    classroomName: string;
    totalArrears: number;
    unpaidCount: number;
    studentCount: number;
  }>;
}
