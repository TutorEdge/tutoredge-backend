import { FastifyReply, FastifyRequest } from "fastify";
import { verifyToken } from "../utils/jwt";

export const authMiddleware = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return reply.status(401).send({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as any;
    (req as any).user = decoded; // Attach to request
  } catch (err) {
    reply.status(401).send({ message: "Invalid token" });
  }
};
