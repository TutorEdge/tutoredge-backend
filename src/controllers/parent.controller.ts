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

  // Add student
  async addStudent(req: FastifyRequest, reply: FastifyReply) {
    try {
      const body = req.body as any;
      const { full_name, class_grade } = body;

      if (!full_name || !class_grade) {
        return reply.status(400).send({ success: false, message: "Full name and class_grade are required." });
      }

      const cg = String(class_grade).trim();
      const cgRegex = /^([0-9]{1,2}(th|st|nd|rd)?(\sGrade)?|Grade\s?[0-9]{1,2}|[A-Za-z0-9\s]+)$/i;
      if (!cgRegex.test(cg)) {
        return reply.status(400).send({ success: false, message: "Invalid class_grade format." });
      }

      // ensure authenticated parent
      const user = (req as any).user;
      if (!user || user.role !== "parent") {
        return reply.status(403).send({ success: false, message: "Forbidden" });
      }

      const student = await parentService.addStudent(user.id, {
        full_name: String(full_name).trim(),
        class_grade: cg
      });

      return reply.status(201).send({
        success: true,
        message: "Student added successfully.",
        data: {
          id: student.id,
          full_name: student.full_name,
          class_grade: student.class_grade,
          parent_id: student.parent_id,
          created_at: student.createdAt
        }
      });
    } catch (err: any) {
      console.error("addStudent error:", err);
      if (err.message && err.message.includes("Invalid parent id")) {
        return reply.status(400).send({ success: false, message: "Invalid parent id." });
      }
      return reply.status(500).send({ success: false, message: "Internal Server Error" });
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
