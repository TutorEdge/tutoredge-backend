import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function signJwt(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJwt(token: string) {
  return jwt.verify(token, JWT_SECRET) as any;
}
