import jwt from "jsonwebtoken";
import { config } from "../config/env";

export const signToken = (payload: object) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "1d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwtSecret);
};
