import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { students } from "./students";
import type {
  DisciplineRuleType,
  DisciplineCategory,
  SanctionLevel,
  InfractionStatus,
  CounselingSessionType,
  CounselingIssueCategory,
  CounselingStatus,
  ParentSummonStatus,
} from "@simma/shared";

export const disciplineRules = pgTable(
  "discipline_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    type: text("type").$type<DisciplineRuleType>().notNull().default("infraction"),
    category: text("category").$type<DisciplineCategory>().notNull(),
    points: integer("points").notNull(),
    description: text("description"),
    sanction: text("sanction"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("discipline_rules_type_idx").on(table.type),
    index("discipline_rules_category_idx").on(table.category),
  ],
);

export const studentInfractions = pgTable(
  "student_infractions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    ruleId: uuid("rule_id").references(() => disciplineRules.id, {
      onDelete: "set null",
    }),
    date: text("date").notNull(), // YYYY-MM-DD
    type: text("type").$type<DisciplineRuleType>().notNull().default("infraction"),
    category: text("category").$type<DisciplineCategory>().notNull(),
    points: integer("points").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    location: text("location"),
    witness: text("witness"),
    evidenceUrl: text("evidence_url"),
    reporterId: uuid("reporter_id").references(() => users.id, {
      onDelete: "set null",
    }),
    status: text("status").$type<InfractionStatus>().notNull().default("approved"),
    approvedById: uuid("approved_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("student_infractions_student_idx").on(table.studentId),
    index("student_infractions_date_idx").on(table.date),
    index("student_infractions_status_idx").on(table.status),
    index("student_infractions_type_idx").on(table.type),
  ],
);

export const counselingSessions = pgTable(
  "counseling_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    counselorId: uuid("counselor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionDate: text("session_date").notNull(),
    sessionType: text("session_type")
      .$type<CounselingSessionType>()
      .notNull()
      .default("individual"),
    issueCategory: text("issue_category")
      .$type<CounselingIssueCategory>()
      .notNull(),
    problemDescription: text("problem_description").notNull(),
    counselingNotes: text("counseling_notes"),
    actionPlan: text("action_plan"),
    status: text("status")
      .$type<CounselingStatus>()
      .notNull()
      .default("dijadwalkan"),
    followUpDate: text("follow_up_date"),
    isConfidential: boolean("is_confidential").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("counseling_sessions_student_idx").on(table.studentId),
    index("counseling_sessions_counselor_idx").on(table.counselorId),
    index("counseling_sessions_status_idx").on(table.status),
  ],
);

export const parentSummons = pgTable(
  "parent_summons",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    letterNumber: text("letter_number").notNull().unique(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    parentName: text("parent_name").notNull(),
    summonDate: text("summon_date").notNull(), // YYYY-MM-DD
    summonTime: text("summon_time").notNull(),
    location: text("location").notNull(),
    reason: text("reason").notNull(),
    sanctionLevel: text("sanction_level")
      .$type<SanctionLevel>()
      .notNull()
      .default("sp_1"),
    status: text("status")
      .$type<ParentSummonStatus>()
      .notNull()
      .default("terbit"),
    notes: text("notes"),
    issuedById: uuid("issued_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("parent_summons_student_idx").on(table.studentId),
    index("parent_summons_date_idx").on(table.summonDate),
    index("parent_summons_status_idx").on(table.status),
  ],
);

export type DisciplineRule = typeof disciplineRules.$inferSelect;
export type NewDisciplineRule = typeof disciplineRules.$inferInsert;
export type StudentInfractionRecord = typeof studentInfractions.$inferSelect;
export type NewStudentInfractionRecord = typeof studentInfractions.$inferInsert;
export type CounselingSessionRecord = typeof counselingSessions.$inferSelect;
export type NewCounselingSessionRecord = typeof counselingSessions.$inferInsert;
export type ParentSummonRecord = typeof parentSummons.$inferSelect;
export type NewParentSummonRecord = typeof parentSummons.$inferInsert;
