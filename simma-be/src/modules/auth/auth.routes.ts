import type { FastifyPluginAsync } from "fastify";
import { authController } from "./auth.controller.js";
import { authenticate } from "../../core/auth/auth.middleware.js";

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/login", authController.login);
  fastify.post("/refresh", authController.refresh);
  fastify.post("/logout", authController.logout);
  fastify.get("/me", { preHandler: [authenticate] }, authController.getMe);
};
