import { FastifyReply, FastifyRequest } from "fastify";
import User from "../models/User";

export const profile = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (req as any).user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return reply.status(404).send({ message: "User not found" });

    reply.send(user);
  } catch (err: any) {
    reply.status(500).send({ message: err.message });
  }
};
