import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@simma/shared";
import { getEnv } from "../config/env.js";
import { UnauthorizedError } from "../errors/app-error.js";

export interface JwtAuthPayload {
  sub: string;
  username: string;
  role: Role;
  teacherId?: string | null;
}

const revokedTokens = new Set<string>();

export function revokeToken(token: string): void {
  revokedTokens.add(token);
}

export function isTokenRevoked(token: string): boolean {
  return revokedTokens.has(token);
}

export function clearRevokedTokens(): void {
  revokedTokens.clear();
}

function getSecretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(payload: JwtAuthPayload): Promise<string> {
  const env = getEnv();
  const secret = getSecretKey(env.JWT_ACCESS_SECRET);

  return new SignJWT({
    username: payload.username,
    role: payload.role,
    teacherId: payload.teacherId ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRY)
    .sign(secret);
}

export async function signRefreshToken(payload: JwtAuthPayload): Promise<string> {
  const env = getEnv();
  const secret = getSecretKey(env.JWT_REFRESH_SECRET);

  return new SignJWT({
    username: payload.username,
    role: payload.role,
    teacherId: payload.teacherId ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(env.JWT_REFRESH_EXPIRY)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<JwtAuthPayload> {
  if (isTokenRevoked(token)) {
    throw new UnauthorizedError("Token telah dicabut");
  }

  const env = getEnv();
  const secret = getSecretKey(env.JWT_ACCESS_SECRET);

  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub || typeof payload.sub !== "string") {
      throw new UnauthorizedError("Token tidak valid: sub missing");
    }

    return {
      sub: payload.sub,
      username: (payload.username as string) || "",
      role: payload.role as Role,
      teacherId: (payload.teacherId as string | null | undefined) ?? null,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError("Token tidak valid atau sudah kadaluarsa");
  }
}

export async function verifyRefreshToken(token: string): Promise<JwtAuthPayload> {
  if (isTokenRevoked(token)) {
    throw new UnauthorizedError("Token telah dicabut");
  }

  const env = getEnv();
  const secret = getSecretKey(env.JWT_REFRESH_SECRET);

  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub || typeof payload.sub !== "string") {
      throw new UnauthorizedError("Refresh token tidak valid: sub missing");
    }

    return {
      sub: payload.sub,
      username: (payload.username as string) || "",
      role: payload.role as Role,
      teacherId: (payload.teacherId as string | null | undefined) ?? null,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError("Refresh token tidak valid atau sudah kadaluarsa");
  }
}
