import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import type { Role } from "@simma/shared";

// Base columns reused across tables
// All tables: id (UUID v7), created_at, updated_at

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<Role>().notNull(),
  teacherId: uuid("teacher_id"), // FK to teachers — set after teachers table exists
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
