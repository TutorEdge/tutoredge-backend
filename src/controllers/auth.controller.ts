import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  // 🔹 Admin Login
  async adminLogin(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { username, password } = req.body as any;
      const result = await authService.loginAdmin(username, password);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  }

  // 🔹 Parent Signup
  async parentSignup(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = await authService.signupParent(req.body as any);
      return reply.code(201).send(user);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  }

  // 🔹 Parent Login
  async parentLogin(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = req.body as any;
      const result = await authService.loginParent(email, password);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  }

  // 🔹 Tutor Signup
  async tutorSignup(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = await authService.signupTutor(req.body as any);
      return reply.code(201).send(user);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  }

  // 🔹 Tutor Login
  async tutorLogin(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = req.body as any;
      const result = await authService.loginTutor(email, password);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  }

  // 🔹 Get Tutor Applications (Admin only)
  async getTutorApplications(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (req as any).user;
      if (!user) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      if (user.role !== "admin") {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const { status, limit } = req.query as { status?: string; limit?: string };
      const limitValue = limit ? parseInt(limit, 10) : 5;

      const validStatuses = ["pending", "approved", "rejected"];
      if (status && !validStatuses.includes(status)) {
        return reply.status(400).send({ error: "Invalid status value" });
      }

      if (isNaN(limitValue) || limitValue <= 0) {
        return reply.status(400).send({ error: "Invalid limit value" });
      }

      const result = await authService.getTutorApplications(status, limitValue);
      return reply.send(result);
    } catch (err: any) {
      console.error("getTutorApplications error:", err);
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  }
}
