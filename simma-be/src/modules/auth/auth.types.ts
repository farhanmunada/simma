import type {
  LoginInput,
  RefreshTokenInput,
  AuthUser,
  LoginResponse,
  RefreshResponse,
  LogoutResponse,
} from "@simma/shared";
import type { users } from "../../db/schema/users.js";

export type UserRecord = typeof users.$inferSelect;
export type NewUserRecord = typeof users.$inferInsert;

export type {
  LoginInput,
  RefreshTokenInput,
  AuthUser,
  LoginResponse,
  RefreshResponse,
  LogoutResponse,
};
