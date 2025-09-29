import { FastifyInstance } from "fastify";
import * as AuthController from "../controllers/auth.controller";
import { forgotPassword, resetPassword } from "../controllers/auth.controller";

export default async function authRoutes(app: FastifyInstance) {
  // Signup
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

  // Login
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

  // Forgot Password
  app.post("/auth/forgot-password", {
    schema: {
      tags: ["Auth"],
      body: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    handler: AuthController.forgotPassword,
  });

  // Reset Password
  app.post("/auth/reset-password/:token", {
    schema: {
      tags: ["Auth"],
      body: {
        type: "object",
        required: ["password"],
        properties: {
          password: { type: "string" },
        },
      },
      params: {
        type: "object",
        required: ["token"],
        properties: {
          token: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
    handler: AuthController.resetPassword,
  });
}
