import { FastifyReply, FastifyRequest } from "fastify";
import { ParentService } from "../services/parent.service";

const parentService = new ParentService();

export class ParentController {
  async getTutors(req: FastifyRequest, reply: FastifyReply) {
    try {
      const tutors = await parentService.searchTutors(req.query);
      return reply.send(tutors);
    } catch (err: any) {
      console.error("Error fetching tutors:", err);
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  }
}
