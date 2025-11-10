import { FastifyInstance } from "fastify";
import StudentController from "../controllers/student.controller";
import { authMiddleware, roleMiddleware } from "../middlewares/auth";

export default async function studentRoutes(app: FastifyInstance) {
  app.get(
    "/student/assignments-quizzes",
    {
      preHandler: [authMiddleware, roleMiddleware(["student"])],
      schema: {
        tags: ["Student"],
        summary: "Get student's upcoming and completed assignments & quizzes",
        querystring: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["upcoming", "completed"] },
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, default: 10 }
          }
        },
        response: {
          200: {
            type: "object"
          }
        }
      }
    },
    (req, reply) => StudentController.getAssignmentsQuizzes(req, reply)
  );
}
