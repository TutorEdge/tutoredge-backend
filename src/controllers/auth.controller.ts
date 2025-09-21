import { FastifyReply, FastifyRequest } from "fastify";
import * as AuthService from "../services/auth.service";

export const signup = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = await AuthService.signup(req.body);
    reply.send(result);
  } catch (err: any) {
    reply.status(400).send({ message: err.message });
  }
};

export const login = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email, password } = req.body as any;
    const result = await AuthService.login(email, password);
    reply.send(result);
  } catch (err: any) {
    reply.status(400).send({ message: err.message });
  }
};
