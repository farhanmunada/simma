import type { FastifyRequest, FastifyReply } from "fastify";
import type { Role } from "@simma/shared";
import { UnauthorizedError, ForbiddenError } from "../errors/app-error.js";
import { verifyAccessToken, type JwtAuthPayload } from "./jwt.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtAuthPayload;
  }
}

export function getUserAllRoles(user?: JwtAuthPayload | null): Role[] {
  if (!user) return [];
  const list = [user.role, ...(user.secondaryRoles ?? [])];
  return Array.from(new Set(list));
}

export function userHasAnyRole(
  user: JwtAuthPayload | undefined | null,
  ...roles: Role[]
): boolean {
  if (!user) return false;
  const all = getUserAllRoles(user);
  if (all.includes("super_admin")) return true;
  return roles.some((r) => all.includes(r));
}

export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Header Authorization (Bearer token) diperlukan");
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new UnauthorizedError("Token tidak ditemukan");
  }

  const payload = await verifyAccessToken(token);
  request.user = payload;
}

export function requireRoles(...allowedRoles: Role[]) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError("Autentikasi diperlukan");
    }

    if (!userHasAnyRole(request.user, ...allowedRoles)) {
      throw new ForbiddenError("Akses ditolak: role tidak memiliki izin");
    }
  };
}
