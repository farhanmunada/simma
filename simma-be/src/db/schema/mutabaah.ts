import {
  pgTable,
  uuid,
  text,
  timestamp,
  date,
  integer,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { students } from "./students";
import { users } from "./users";
import type {
  MutabaahActivityCategory,
  MutabaahEntryStatus,
  MutabaahUzurType,
} from "@simma/shared";

export const mutabaahActivities = pgTable("mutabaah_activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  category: text("category").$type<MutabaahActivityCategory>().notNull(),
  targetCount: integer("target_count").notNull().default(1),
  unit: text("unit").notNull().default("kali"),
  weight: integer("weight").notNull().default(1),
  isMandatory: boolean("is_mandatory").notNull().default(true),
  genderSpecific: text("gender_specific").notNull().default("all"), // 'all' | 'L' | 'P'
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const mutabaahDailyEntries = pgTable(
  "mutabaah_daily_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => mutabaahActivities.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    status: text("status").$type<MutabaahEntryStatus>().notNull().default("terlaksana"),
    volume: integer("volume").notNull().default(1),
    score: integer("score").notNull().default(100),
    notes: text("notes"),
    recordedBy: uuid("recorded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("mutabaah_daily_entries_student_activity_date_idx").on(
      table.studentId,
      table.activityId,
      table.date,
    ),
  ],
);

export const mutabaahUzurRecords = pgTable("mutabaah_uzur_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  uzurType: text("uzur_type").$type<MutabaahUzurType>().notNull().default("haidh"),
  notes: text("notes"),
  recordedBy: uuid("recorded_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type MutabaahActivity = typeof mutabaahActivities.$inferSelect;
export type NewMutabaahActivity = typeof mutabaahActivities.$inferInsert;

export type MutabaahDailyEntry = typeof mutabaahDailyEntries.$inferSelect;
export type NewMutabaahDailyEntry = typeof mutabaahDailyEntries.$inferInsert;

export type MutabaahUzurRecord = typeof mutabaahUzurRecords.$inferSelect;
export type NewMutabaahUzurRecord = typeof mutabaahUzurRecords.$inferInsert;
