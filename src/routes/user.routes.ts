import { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/auth";
import * as UserController from "../controllers/user.controller";

export default async function userRoutes(app: FastifyInstance) {
  app.get("/user/profile", { preHandler: [authMiddleware] }, UserController.profile);
}
