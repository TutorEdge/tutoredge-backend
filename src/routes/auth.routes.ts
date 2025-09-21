import { FastifyInstance } from "fastify";
import * as AuthController from "../controllers/auth.controller";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/auth/signup", {
    schema: {
      tags: ["Auth"],
      body: {
        type: "object",
        required: ["firstName", "lastName", "email", "phone", "password", "confirmPassword"],
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          password: { type: "string" },
          confirmPassword: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            token: { type: "string" },
          },
        },
      },
    },
    handler: AuthController.signup,
  });

  app.post("/auth/login", {
    schema: {
      tags: ["Auth"],
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            token: { type: "string" },
          },
        },
      },
    },
    handler: AuthController.login,
  });
}
