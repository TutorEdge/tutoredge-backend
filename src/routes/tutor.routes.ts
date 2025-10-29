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

  //update assignment
   app.put(
    "/tutor/update-assignment/:id",
    {
      preHandler: [authMiddleware, roleMiddleware(["tutor"])],
      schema: {
        tags: ["Tutor"],
        summary: "Update an assignment (multipart/form-data)",
        consumes: ["multipart/form-data"],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"]
        }
      }
    },
    (req, reply) => tutorController.updateAssignment(req, reply)
  );

  // quiz
  app.post(
    "/tutor/create-quiz",
    {
      preHandler: [authMiddleware, roleMiddleware(["tutor"])],
      schema: {
        tags: ["Tutor"],
        summary: "Create a new quiz (JSON)",
        consumes: ["application/json"],
        body: {
          type: "object",
          required: ["title", "subject", "class_grade", "questions"],
          properties: {
            title: { type: "string" },
            subject: { type: "string" },
            class_grade: { type: "string" },
            description: { type: "string" },
            questions: {
              type: "array",
              items: {
                type: "object",
                required: ["question", "options", "correct_answer"],
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "string" }
                }
              }
            }
          }
        },
        response: {
          201: {
            type: "object",
            properties: {
              message: { type: "string" },
              quiz: { type: "object" }
            }
          }
        }
      }
    },
    (req, reply) => tutorController.createQuiz(req, reply)
  );


  // update quiz
  app.put(
    "/tutor/update-quiz/:id",
    {
      preHandler: [authMiddleware, roleMiddleware(["tutor"])],
      schema: {
        tags: ["Tutor"],
        summary: "Update quiz (edit/add/delete questions)",
        consumes: ["application/json"],
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"]
        },
        body: {
          type: "object",
          required: ["title", "subject", "class_grade"],
          properties: {
            title: { type: "string" },
            subject: { type: "string" },
            class_grade: { type: "string" },
            description: { type: "string" },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "string" },
                  type: { type: "string" }
                }
              }
            }
          }
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              quiz: { type: "object" }
            }
          }
        }
      }
    },
    (req, reply) => tutorController.updateQuiz(req, reply)
  );

  // delete quiz
  app.delete(
    "/tutor/delete-quiz/:id",
    {
      preHandler: [authMiddleware, roleMiddleware(["tutor"])],
      schema: {
        tags: ["Tutor"],
        summary: "Delete a quiz (tutor only)",
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"]
        },
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
              deleted_quiz_id: { type: "string" }
            }
          },
          404: { type: "object", properties: { error: { type: "string" } } }
        }
      }
    },
    (req, reply) => tutorController.deleteQuiz(req, reply)
  );
}
