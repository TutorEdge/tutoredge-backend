import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  async adminLogin(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { username, password } = req.body as any;
      const result = await authService.loginAdmin(username, password);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  }

  async parentSignup(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = await authService.signupParent(req.body as any);
      return reply.code(201).send(user);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  }

  async parentLogin(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = req.body as any;
      const result = await authService.loginParent(email, password);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  }

  async tutorSignup(req: FastifyRequest, reply: FastifyReply) {
    try {
      const user = await authService.signupTutor(req.body as any);
      return reply.code(201).send(user);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  }

  async tutorLogin(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = req.body as any;
      const result = await authService.loginTutor(email, password);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  }
}
