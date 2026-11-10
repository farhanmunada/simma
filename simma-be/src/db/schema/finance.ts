import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  date,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { academicYears, classrooms } from "./setup.js";
import { students } from "./students.js";

export const feeItems = pgTable("fee_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // 'rutin' | 'non_rutin'
  category: text("category").notNull(), // 'spp' | 'asrama' | 'komite' | ...
  academicYearId: uuid("academic_year_id").references(() => academicYears.id, {
    onDelete: "set null",
  }),
  amount: integer("amount").notNull(),
  gradeLevel: integer("grade_level"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const studentInvoices = pgTable("student_invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  feeItemId: uuid("fee_item_id")
    .notNull()
    .references(() => feeItems.id, { onDelete: "cascade" }),
  classroomId: uuid("classroom_id").references(() => classrooms.id, {
    onDelete: "set null",
  }),
  month: integer("month"), // 1-12
  year: integer("year").notNull(),
  amount: integer("amount").notNull(),
  paidAmount: integer("paid_amount").notNull().default(0),
  remainingAmount: integer("remaining_amount").notNull(),
  status: text("status").notNull().default("unpaid"), // 'unpaid' | 'partial' | 'paid' | 'cancelled'
  dueDate: date("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const paymentTransactions = pgTable("payment_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  receiptNumber: text("receipt_number").notNull().unique(), // KW/YYYY/MM/XXXX
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  cashierId: uuid("cashier_id").references(() => users.id, {
    onDelete: "set null",
  }),
  paymentDate: timestamp("payment_date", { withTimezone: true })
    .notNull()
    .defaultNow(),
  paymentMethod: text("payment_method").notNull().default("tunai"), // 'tunai' | 'transfer' | 'qris'
  totalAmount: integer("total_amount").notNull(),
  receivedAmount: integer("received_amount").notNull(),
  changeAmount: integer("change_amount").notNull().default(0),
  status: text("status").notNull().default("success"), // 'success' | 'void'
  notes: text("notes"),
  voidReason: text("void_reason"),
  voidedAt: timestamp("voided_at", { withTimezone: true }),
  voidedBy: uuid("voided_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const paymentTransactionItems = pgTable("payment_transaction_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: uuid("transaction_id")
    .notNull()
    .references(() => paymentTransactions.id, { onDelete: "cascade" }),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => studentInvoices.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dispensationRequests = pgTable("dispensation_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
  approvedBy: uuid("approved_by").references(() => users.id, {
    onDelete: "set null",
  }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type FeeItemRow = typeof feeItems.$inferSelect;
export type NewFeeItemRow = typeof feeItems.$inferInsert;
export type StudentInvoiceRow = typeof studentInvoices.$inferSelect;
export type NewStudentInvoiceRow = typeof studentInvoices.$inferInsert;
export type PaymentTransactionRow = typeof paymentTransactions.$inferSelect;
export type NewPaymentTransactionRow = typeof paymentTransactions.$inferInsert;
export type PaymentTransactionItemRow = typeof paymentTransactionItems.$inferSelect;
export type NewPaymentTransactionItemRow = typeof paymentTransactionItems.$inferInsert;
export type DispensationRequestRow = typeof dispensationRequests.$inferSelect;
export type NewDispensationRequestRow = typeof dispensationRequests.$inferInsert;
