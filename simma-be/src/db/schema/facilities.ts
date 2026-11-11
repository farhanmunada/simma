import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import type {
  FacilityCategory,
  FacilityCondition,
  FacilityAssetStatus,
  FacilityBorrowerType,
  FacilityLoanStatus,
  FacilityMaintenancePriority,
  FacilityMaintenanceStatus,
} from "@simma/shared";

export const facilityAssets = pgTable(
  "facility_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    category: text("category").$type<FacilityCategory>().notNull(),
    condition: text("condition")
      .$type<FacilityCondition>()
      .notNull()
      .default("BAIK"),
    location: text("location"),
    purchaseDate: text("purchase_date"),
    sourceOfFund: text("source_of_fund"),
    qrCodeToken: text("qr_code_token").notNull().unique(),
    status: text("status")
      .$type<FacilityAssetStatus>()
      .notNull()
      .default("TERSEDIA"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("facility_assets_code_idx").on(table.code),
    index("facility_assets_category_idx").on(table.category),
    index("facility_assets_status_idx").on(table.status),
    index("facility_assets_qr_idx").on(table.qrCodeToken),
  ],
);

export const facilityLoans = pgTable(
  "facility_loans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => facilityAssets.id, { onDelete: "cascade" }),
    borrowerName: text("borrower_name").notNull(),
    borrowerType: text("borrower_type")
      .$type<FacilityBorrowerType>()
      .notNull(),
    loanDate: text("loan_date").notNull(),
    dueDate: text("due_date").notNull(),
    returnDate: text("return_date"),
    status: text("status")
      .$type<FacilityLoanStatus>()
      .notNull()
      .default("DIPINJAM"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("facility_loans_asset_idx").on(table.assetId),
    index("facility_loans_status_idx").on(table.status),
    index("facility_loans_date_idx").on(table.loanDate),
  ],
);

export const facilityMaintenanceTickets = pgTable(
  "facility_maintenance_tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => facilityAssets.id, { onDelete: "cascade" }),
    reporterId: uuid("reporter_id").references(() => users.id, {
      onDelete: "set null",
    }),
    reporterName: text("reporter_name"),
    title: text("title").notNull(),
    description: text("description").notNull(),
    priority: text("priority")
      .$type<FacilityMaintenancePriority>()
      .notNull()
      .default("SEDANG"),
    status: text("status")
      .$type<FacilityMaintenanceStatus>()
      .notNull()
      .default("MENUNGGU"),
    cost: integer("cost").notNull().default(0),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("facility_tickets_asset_idx").on(table.assetId),
    index("facility_tickets_status_idx").on(table.status),
    index("facility_tickets_priority_idx").on(table.priority),
  ],
);

export type FacilityAssetRow = typeof facilityAssets.$inferSelect;
export type NewFacilityAssetRow = typeof facilityAssets.$inferInsert;
export type FacilityLoanRow = typeof facilityLoans.$inferSelect;
export type NewFacilityLoanRow = typeof facilityLoans.$inferInsert;
export type FacilityMaintenanceTicketRow =
  typeof facilityMaintenanceTickets.$inferSelect;
export type NewFacilityMaintenanceTicketRow =
  typeof facilityMaintenanceTickets.$inferInsert;
