import { FastifyInstance } from "fastify";
import * as AuthController from "../controllers/auth.controller";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/auth/signup", AuthController.signup);
  app.post("/auth/login", AuthController.login);
}
