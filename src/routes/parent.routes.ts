import { FastifyInstance } from "fastify";
import { ParentController } from "../controllers/parent.controller";

const parentController = new ParentController();

export default async function parentRoutes(app: FastifyInstance) {
  app.get("/parent/tutors", (req, reply) => parentController.getTutors(req, reply));
}
