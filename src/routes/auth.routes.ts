import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth";

const authController = new AuthController();

export default async function authRoutes(fastify: FastifyInstance) {
  // Admin Login
  fastify.post(
    "/auth/admin/login",
    {
      schema: {
        tags: ["Admin"],
        summary: "Admin login",
        body: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" }
          }
        },
        response: {
          200: {
            type: "object",
            properties: {
              token: { type: "string" },
              user: { type: "object" }
            }
          }
        }
      }
    },
    authController.adminLogin
  );

  // Parent Signup
  fastify.post(
    "/auth/parent/signup",
    {
      schema: {
        tags: ["Parent"],
        summary: "Parent signup",
        body: {
          type: "object",
          required: ["fullName", "email", "phone", "password"],
          properties: {
            fullName: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            password: { type: "string" }
          }
        }
      }
    },
    authController.parentSignup
  );

  // Parent Login
  fastify.post(
    "/auth/parent/login",
    {
      schema: {
        tags: ["Parent"],
        summary: "Parent login",
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string" },
            password: { type: "string" }
          }
        }
      }
    },
    authController.parentLogin
  );

  // Tutor Signup
  fastify.post(
    "/auth/tutor/signup",
    {
      schema: {
        tags: ["Tutor"],
        summary: "Tutor signup",
        body: {
          type: "object",
          required: [
            "fullName",
            "email",
            "phone",
            "password",
            "subjects",
            "languages",
            "classesTaught",
            "qualification",
            "college",
            "yearsOfExperience"
          ],
          properties: {
            fullName: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            password: { type: "string" },
            subjects: { type: "array", items: { type: "string" } },
            languages: { type: "array", items: { type: "string" } },
            classesTaught: { type: "array", items: { type: "string" } },
            qualification: { type: "string" },
            college: { type: "string" },
            yearsOfExperience: { type: "number" }
          }
        }
      }
    },
    authController.tutorSignup
  );

  // Tutor Login
  fastify.post(
    "/auth/tutor/login",
    {
      schema: {
        tags: ["Tutor"],
        summary: "Tutor login",
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string" },
            password: { type: "string" }
          }
        }
      }
    },
    authController.tutorLogin
  );

  // tutor-applications
  fastify.get(
    "/auth/tutor-applications",
    {
      preHandler: [authMiddleware, roleMiddleware(["admin"])],
      schema: {
        tags: ["Tutor"],
        summary: "Fetch recent tutor applications",
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", default: 5, minimum: 1 },
            status: {
              type: "string",
              enum: ["pending", "approved", "rejected"]
            }
          }
        },
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" },
                status: {
                  type: "string",
                  enum: ["pending", "approved", "rejected"]
                },
                appliedDate: { type: "string", format: "date-time" }
              }
            }
          }
        }
      }
    },
    authController.getTutorApplications.bind(authController)
  );
}
