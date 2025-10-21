import { FastifyInstance } from "fastify";
import { ParentController } from "../controllers/parent.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth";

const parentController = new ParentController();

export default async function parentRoutes(app: FastifyInstance) {
  app.get("/parent/tutors", (req, reply) => parentController.getTutors(req, reply));

  // Admin: GET /parent/requests
  app.get(
    "/parent/requests",
    {
      preHandler: [authMiddleware, roleMiddleware(["admin"])],
      schema: {
        tags: ["Admin"],
        summary: "Fetch parent-tutor requests (latest or all with filters)",
        querystring: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["latest", "all"], default: "latest" },
            status: { type: "string", enum: ["pending", "assigned", "completed", "cancelled"] },
            subject: { type: "string" },
            limit: { type: "integer", minimum: 1, default: 5 }
          }
        },
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                parentId: { type: "string" },
                parent: { type: "object", nullable: true },
                academicNeeds: { type: "array", items: { type: "string" } },
                scheduling: { type: "array", items: { type: "string" } },
                location: { type: "string" },
                urgency: { type: "string" },
                status: { type: "string" },
                createdAt: { type: "string", format: "date-time" }
              }
            }
          }
        }
      }
    },
    (req, reply) => parentController.getParentRequests(req, reply)
  );
}
