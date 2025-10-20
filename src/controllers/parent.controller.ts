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

  //Admin panel
  async getParentRequests(req: FastifyRequest, reply: FastifyReply) {
    try {
      // ensure admin access is enforced in route preHandler
      const { type, status, subject, limit } = req.query as any;

      const result = await parentService.getParentRequests({ type, status, subject, limit });
      return reply.send(result);
    } catch (err: any) {
      console.error("getParentRequests error:", err);
      // return 400 for validation errors
      if (err.message && (err.message.includes("Invalid") || err.message.includes("allowed"))) {
        return reply.status(400).send({ error: err.message });
      }
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  }
}
