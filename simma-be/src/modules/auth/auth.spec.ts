import { describe, it, expect, beforeEach, vi } from "vitest";
import bcrypt from "bcrypt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

// Set environment variables before any module loads
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://simma:simma@localhost:5432/simma_test";
process.env.JWT_ACCESS_SECRET = "test-jwt-access-secret-minimum-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-minimum-32-chars-long";
process.env.JWT_ACCESS_EXPIRY = "15m";
process.env.JWT_REFRESH_EXPIRY = "7d";

import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeToken,
  clearRevokedTokens,
} from "../../core/auth/jwt.js";
import { authenticate, requireRoles } from "../../core/auth/auth.middleware.js";
import { UnauthorizedError, ForbiddenError, NotFoundError } from "../../core/errors/app-error.js";
import { AuthService } from "./auth.service.js";
import { authRepository } from "./auth.repository.js";
import { buildApp } from "../../app.js";
import type { UserRecord } from "./auth.types.js";

const mockUser: UserRecord = {
  id: "018f3a2c-1234-7000-8000-000000000001",
  username: "testguru",
  passwordHash: "",
  role: "guru_mapel",
  teacherId: null,
  isActive: true,
  lastLogin: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("JWT Core", () => {
  beforeEach(() => {
    clearRevokedTokens();
  });

  it("should sign and verify valid access token", async () => {
    const payload = {
      sub: mockUser.id,
      username: mockUser.username,
      role: mockUser.role,
      teacherId: null,
    };

    const token = await signAccessToken(payload);
    expect(typeof token).toBe("string");

    const verified = await verifyAccessToken(token);
    expect(verified.sub).toBe(mockUser.id);
    expect(verified.username).toBe(mockUser.username);
    expect(verified.role).toBe(mockUser.role);
  });

  it("should sign and verify valid refresh token", async () => {
    const payload = {
      sub: mockUser.id,
      username: mockUser.username,
      role: mockUser.role,
      teacherId: null,
    };

    const token = await signRefreshToken(payload);
    expect(typeof token).toBe("string");

    const verified = await verifyRefreshToken(token);
    expect(verified.sub).toBe(mockUser.id);
  });

  it("should reject revoked token", async () => {
    const payload = {
      sub: mockUser.id,
      username: mockUser.username,
      role: mockUser.role,
    };

    const token = await signAccessToken(payload);
    revokeToken(token);

    await expect(verifyAccessToken(token)).rejects.toThrow(UnauthorizedError);
  });

  it("should reject invalid token string", async () => {
    await expect(verifyAccessToken("invalid.token.here")).rejects.toThrow(UnauthorizedError);
  });
});

describe("Auth Middleware", () => {
  it("should throw UnauthorizedError when Authorization header is missing", async () => {
    const req = { headers: {} } as FastifyRequest;
    const rep = {} as FastifyReply;

    await expect(authenticate(req, rep)).rejects.toThrow(UnauthorizedError);
  });

  it("should throw UnauthorizedError when Bearer prefix is missing", async () => {
    const req = { headers: { authorization: "Basic 123" } } as FastifyRequest;
    const rep = {} as FastifyReply;

    await expect(authenticate(req, rep)).rejects.toThrow(UnauthorizedError);
  });

  it("should attach user to request when token is valid", async () => {
    const token = await signAccessToken({
      sub: mockUser.id,
      username: mockUser.username,
      role: mockUser.role,
    });

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as FastifyRequest;
    const rep = {} as FastifyReply;

    await authenticate(req, rep);
    expect(req.user).toBeDefined();
    expect(req.user?.sub).toBe(mockUser.id);
  });

  it("should allow super_admin on any required role", async () => {
    const req = {
      user: {
        sub: "admin-id",
        username: "admin",
        role: "super_admin",
      },
    } as unknown as FastifyRequest;
    const rep = {} as FastifyReply;

    const check = requireRoles("guru_mapel", "wali_kelas");
    await expect(check(req, rep)).resolves.toBeUndefined();
  });

  it("should allow user with matching role", async () => {
    const req = {
      user: {
        sub: mockUser.id,
        username: mockUser.username,
        role: "guru_mapel",
      },
    } as unknown as FastifyRequest;
    const rep = {} as FastifyReply;

    const check = requireRoles("guru_mapel");
    await expect(check(req, rep)).resolves.toBeUndefined();
  });

  it("should reject user without matching role", async () => {
    const req = {
      user: {
        sub: mockUser.id,
        username: mockUser.username,
        role: "guru_mapel",
      },
    } as unknown as FastifyRequest;
    const rep = {} as FastifyReply;

    const check = requireRoles("kepala_madrasah");
    await expect(check(req, rep)).rejects.toThrow(ForbiddenError);
  });
});

describe("AuthService", () => {
  let mockRepo: typeof authRepository;
  let service: AuthService;

  beforeEach(async () => {
    clearRevokedTokens();
    const passwordHash = await bcrypt.hash("password123", 10);
    const userInDb: UserRecord = {
      ...mockUser,
      passwordHash,
    };

    mockRepo = {
      findByUsername: vi.fn(async (username: string) =>
        username === "testguru" ? userInDb : null,
      ),
      findById: vi.fn(async (id: string) =>
        id === userInDb.id ? userInDb : null,
      ),
      updateLastLogin: vi.fn(async () => {}),
    };

    service = new AuthService(mockRepo);
  });

  it("should successfully login with valid credentials", async () => {
    const result = await service.login({
      username: "testguru",
      password: "password123",
    });

    expect(result.user.username).toBe("testguru");
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(mockRepo.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
  });

  it("should reject login with wrong password", async () => {
    await expect(
      service.login({ username: "testguru", password: "wrongpassword" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("should reject login with non-existent username", async () => {
    await expect(
      service.login({ username: "unknown", password: "password123" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("should reject login when user is inactive", async () => {
    mockRepo.findByUsername = vi.fn(async () => ({
      ...mockUser,
      isActive: false,
      passwordHash: await bcrypt.hash("password123", 10),
    }));

    await expect(
      service.login({ username: "testguru", password: "password123" }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it("should refresh access token with valid refresh token", async () => {
    const refreshToken = await signRefreshToken({
      sub: mockUser.id,
      username: mockUser.username,
      role: mockUser.role,
    });

    const result = await service.refresh(refreshToken);
    expect(result.accessToken).toBeDefined();
  });

  it("should logout and revoke token", async () => {
    const token = await signAccessToken({
      sub: mockUser.id,
      username: mockUser.username,
      role: mockUser.role,
    });

    const res = await service.logout(token);
    expect(res.message).toBe("Logout berhasil");

    await expect(verifyAccessToken(token)).rejects.toThrow(UnauthorizedError);
  });

  it("should return sanitized profile for getMe", async () => {
    const user = await service.getMe(mockUser.id);
    expect(user.username).toBe(mockUser.username);
    expect((user as Record<string, unknown>).passwordHash).toBeUndefined();
  });

  it("should throw NotFoundError if getMe user does not exist", async () => {
    mockRepo.findById = vi.fn(async () => null);
    await expect(service.getMe("non-existent-id")).rejects.toThrow(NotFoundError);
  });
});

describe("Auth HTTP Endpoints (Integration)", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    clearRevokedTokens();
    const passwordHash = await bcrypt.hash("password123", 10);
    const userInDb: UserRecord = {
      ...mockUser,
      passwordHash,
    };

    vi.spyOn(authRepository, "findByUsername").mockImplementation(
      async (username: string) => (username === "testguru" ? userInDb : null),
    );
    vi.spyOn(authRepository, "findById").mockImplementation(
      async (id: string) => (id === userInDb.id ? userInDb : null),
    );
    vi.spyOn(authRepository, "updateLastLogin").mockImplementation(async () => {});

    app = await buildApp();
  });

  it("POST /api/v1/auth/login with valid body should return 200", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        username: "testguru",
        password: "password123",
      },
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.body);
    expect(json.accessToken).toBeDefined();
    expect(json.refreshToken).toBeDefined();
    expect(json.user.username).toBe("testguru");
  });

  it("POST /api/v1/auth/login with wrong credentials should return 401", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        username: "testguru",
        password: "wrongpassword",
      },
    });

    expect(response.statusCode).toBe(401);
    const json = JSON.parse(response.body);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("POST /api/v1/auth/login with invalid payload should return 400", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      payload: {
        username: "a", // too short (< 3)
        password: "123", // too short (< 6)
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it("POST /api/v1/auth/refresh should return new accessToken", async () => {
    const refreshToken = await signRefreshToken({
      sub: mockUser.id,
      username: mockUser.username,
      role: mockUser.role,
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/refresh",
      payload: {
        refreshToken,
      },
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.body);
    expect(json.accessToken).toBeDefined();
  });

  it("POST /api/v1/auth/logout should return 200", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/logout",
      payload: {
        refreshToken: "sample-token",
      },
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.body);
    expect(json.message).toBe("Logout berhasil");
  });

  it("GET /api/v1/auth/me should return 401 without Bearer token", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
    });

    expect(response.statusCode).toBe(401);
    const json = JSON.parse(response.body);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("GET /api/v1/auth/me should return 200 and profile with valid Bearer token", async () => {
    const token = await signAccessToken({
      sub: mockUser.id,
      username: mockUser.username,
      role: mockUser.role,
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/auth/me",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.body);
    expect(json.data.username).toBe(mockUser.username);
    expect(json.data.role).toBe(mockUser.role);
  });
});
