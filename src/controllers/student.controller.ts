import { FastifyReply, FastifyRequest } from "fastify";
import StudentService from "../services/student.service";

export class StudentController {
  async getAssignmentsQuizzes(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user;
      if (!user || user.role !== "student") {
        return reply.status(403).send({ success: false, message: "Forbidden" });
      }

      // read query params
      const status = (req.query as any).status; // optional
      const page = Number((req.query as any).page) || 1;
      const limit = Number((req.query as any).limit) || 10;

      const classGrade = (user.class_grade as string) || (req.query as any).class_grade;
      if (!classGrade) {
        return reply.status(200).send({
          success: true,
          data: { upcoming: [], completed: [] },
          summary: { upcoming_count: 0, completed_count: 0 }
        });
      }

      const result = await StudentService.fetchAssignmentsAndQuizzes({
        classGrade,
        status,
        page,
        limit
      });

      return reply.status(200).send({ success: true, data: { upcoming: result.upcoming, completed: result.completed }, summary: result.summary });
    } catch (err: any) {
      console.error("getAssignmentsQuizzes error:", err);
      return reply.status(500).send({ success: false, message: "Internal Server Error" });
    }
  }
}

export default new StudentController();
