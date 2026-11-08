import bcrypt from "bcrypt";
import type { LoginInput, AuthUser, LoginResponse, RefreshResponse, LogoutResponse } from "./auth.types.js";
import { authRepository } from "./auth.repository.js";
import { UnauthorizedError, NotFoundError } from "../../core/errors/app-error.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  revokeToken,
  type JwtAuthPayload,
} from "../../core/auth/jwt.js";
import type { UserRecord } from "./auth.types.js";

const BCRYPT_SALT_ROUNDS = 12;

export function sanitizeUser(user: UserRecord): AuthUser {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    teacherId: user.teacherId,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class AuthService {
  constructor(private repo = authRepository) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    const user = await this.repo.findByUsername(input.username);

    if (!user || !user.isActive) {
      throw new UnauthorizedError("Username atau password salah");
    }

    const isPasswordValid = await this.comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Username atau password salah");
    }

    await this.repo.updateLastLogin(user.id);

    const payload: JwtAuthPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      teacherId: user.teacherId,
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const payload = await verifyRefreshToken(refreshToken);

    const user = await this.repo.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Pengguna tidak aktif atau tidak ditemukan");
    }

    const newPayload: JwtAuthPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      teacherId: user.teacherId,
    };

    const accessToken = await signAccessToken(newPayload);

    return { accessToken };
  }

  async logout(token?: string): Promise<LogoutResponse> {
    if (token) {
      revokeToken(token);
    }
    return { message: "Logout berhasil" };
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.repo.findById(userId);
    if (!user || !user.isActive) {
      throw new NotFoundError("Pengguna", userId);
    }

    return sanitizeUser(user);
  }
}

export const authService = new AuthService();
