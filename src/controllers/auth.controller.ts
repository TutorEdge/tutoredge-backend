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


// Forgot Password
export const forgotPassword = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email } = req.body as { email: string };
    await AuthService.forgotPassword(email);
    reply.send({ message: "Password reset link sent to your email" });
  } catch (err: any) {
    reply.status(400).send({ message: err.message });
  }
};

// Reset Password
export const resetPassword = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { token } = req.params as { token: string };
    const { password } = req.body as { password: string };
    await AuthService.resetPassword(token, password);
    reply.send({ message: "Password has been reset successfully" });
  } catch (err: any) {
    reply.status(400).send({ message: err.message });
  }
};
