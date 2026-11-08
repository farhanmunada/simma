import { z } from "zod";

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
