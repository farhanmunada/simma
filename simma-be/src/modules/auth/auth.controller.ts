import type { FastifyRequest, FastifyReply } from "fastify";
import { LoginSchema, RefreshTokenSchema } from "./auth.schema.js";
import { authService, AuthService } from "./auth.service.js";
import { UnauthorizedError, ValidationError } from "../../core/errors/app-error.js";
import type { LoginInput, RefreshTokenInput } from "./auth.types.js";

export class AuthController {
  constructor(private service: AuthService = authService) {}

  login = async (
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply,
  ) => {
    const parseResult = LoginSchema.safeParse(request.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message ?? "Validasi input gagal";
      throw new ValidationError(firstError);
    }
    const result = await this.service.login(parseResult.data);
    return reply.status(200).send(result);
  };

  refresh = async (
    request: FastifyRequest<{ Body: RefreshTokenInput }>,
    reply: FastifyReply,
  ) => {
    const parseResult = RefreshTokenSchema.safeParse(request.body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message ?? "Validasi input gagal";
      throw new ValidationError(firstError);
    }
    const result = await this.service.refresh(parseResult.data.refreshToken);
    return reply.status(200).send(result);
  };

  logout = async (
    request: FastifyRequest<{ Body?: { refreshToken?: string } }>,
    reply: FastifyReply,
  ) => {
    let token = request.body?.refreshToken;
    if (!token && request.headers.authorization?.startsWith("Bearer ")) {
      token = request.headers.authorization.slice(7).trim();
    }

    const result = await this.service.logout(token);
    return reply.status(200).send(result);
  };

  getMe = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user?.sub) {
      throw new UnauthorizedError("Autentikasi diperlukan");
    }

    const user = await this.service.getMe(request.user.sub);
    return reply.status(200).send({ data: user });
  };
}

export const authController = new AuthController();
