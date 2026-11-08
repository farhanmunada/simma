import type { FastifyRequest, FastifyReply } from "fastify";
import type { Role } from "@simma/shared";
import { UnauthorizedError, ForbiddenError } from "../errors/app-error.js";
import { verifyAccessToken, type JwtAuthPayload } from "./jwt.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtAuthPayload;
  }
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

    if (request.user.role === "super_admin") {
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw new ForbiddenError("Akses ditolak: role tidak memiliki izin");
    }
  };
}
