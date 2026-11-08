import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "./app-error.js";

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    return reply
      .status(error.statusCode)
      .send({ error: { code: error.code, message: error.message } });
  }

  // Zod validation error (from fastify schema validation)
  if (error.validation) {
    return reply.status(400).send({
      error: {
        code: "VALIDATION_ERROR",
        message: error.message,
      },
    });
  }

  // Unexpected error — log full stack, return generic
  request.log.error(error);
  return reply.status(500).send({
    error: {
      code: "INTERNAL_ERROR",
      message: "Terjadi kesalahan sistem",
    },
  });
}
