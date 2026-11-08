import { z } from "zod";
import { ROLES } from "../constants.js";

export const LoginSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(128, "Password terlalu panjang"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token wajib diisi"),
});
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  role: z.enum(ROLES),
  teacherId: z.string().uuid().nullable().optional(),
  isActive: z.boolean(),
  lastLogin: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export const LoginResponseSchema = z.object({
  user: AuthUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
});
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

export const LogoutResponseSchema = z.object({
  message: z.string(),
});
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

export const AuthPayloadSchema = z.object({
  sub: z.string().uuid(),
  username: z.string(),
  role: z.enum(ROLES),
  teacherId: z.string().uuid().nullable().optional(),
});
export type AuthPayload = z.infer<typeof AuthPayloadSchema>;
