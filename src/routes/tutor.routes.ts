import { FastifyInstance } from "fastify";
import { TutorController } from "../controllers/tutor.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth";

const tutorController = new TutorController();

export default async function tutorRoutes(app: FastifyInstance) {
  app.post(
    "/tutor/create-assignment",
    {
      preHandler: [authMiddleware, roleMiddleware(["tutor"])],
      // Note: multipart body validation needs manual checks in controller.
      schema: {
        tags: ["Tutor"],
        summary: "Create assignment (multipart/form-data)",
        consumes: ["multipart/form-data"],
        // querystring/body schema omitted because multipart
        response: {
          201: {
            type: "object",
            properties: {
              message: { type: "string" },
              assignment: { type: "object" }
            }
          }
        }
      }
    },
    (req, reply) => tutorController.createAssignment(req, reply)
  );
}
