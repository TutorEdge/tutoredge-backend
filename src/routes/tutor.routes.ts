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

  // delete assignment
  app.delete(
    "/tutor/delete-assignment/:id",
    {
      preHandler: [authMiddleware, roleMiddleware(["tutor"])],
      schema: {
        tags: ["Tutor"],
        summary: "Delete an assignment (tutor only)",
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
              deleted_assignment_id: { type: "string" }
            }
          },
          404: { type: "object", properties: { error: { type: "string" } } },
          403: { type: "object", properties: { error: { type: "string" } } }
        }
      }
    },
    (req, reply) => tutorController.deleteAssignment(req, reply)
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
              quiz: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  subject: { type: "string" },
                  class_grade: { type: "string" },
                  description: { type: "string" },
                  questions_count: { type: "number" },
                  created_at: { type: "string" }
                }
              }
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


  //upload study material
  app.post(
    "/tutor/upload-study-material",
    {
      preHandler: [authMiddleware, roleMiddleware(["tutor"])],
      schema: {
        tags: ["Tutor"],
        summary: "Upload study material (multipart/form-data)",
        consumes: ["multipart/form-data"],
        body: { type: "object" }, // multipart - validation done in controller
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: { type: "object" }
            }
          },
          400: { type: "object" },
          403: { type: "object" }
        }
      }
    },
    (req, reply) => tutorController.uploadStudyMaterial(req, reply)
  );


    // Get all quizzes created by tutor
  app.get(
    "/tutor/quizzes", // or "/tutor/quizzes/" if you want trailing slash
    {
      preHandler: [authMiddleware, roleMiddleware(["tutor"])],
      schema: {
        tags: ["Tutor"],
        summary: "Get all quizzes created by tutor",
        querystring: {
          type: "object",
          properties: {
            subject: { type: "string" },
            class_grade: { type: "string" },
            page: { type: "number" },
            limit: { type: "number" }
          }
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    subject: { type: "string" },
                    class_grade: { type: "string" },
                    due_date: { type: ["string", "null"] },
                    total_questions: { type: "number" },
                    status: { type: "string" }
                  }
                }
              }
            }
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" }
            }
          }
        }
      }
    },
    (req, reply) => tutorController.getTutorQuizzes(req, reply)
  );
}
