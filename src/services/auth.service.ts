import User from "../models/User";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";

export const signup = async (data: any) => {
  const { firstName, lastName, email, phone, password } = data;

  const existing = await User.findOne({ email });
  if (existing) throw new Error("User already exists");

  const hashed = await hashPassword(password);

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password: hashed,
    role: "Student", // default role
  });

  return { token: signToken({ id: user._id, role: user.role }) };
};

export const login = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const match = await comparePassword(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  return { token: signToken({ id: user._id, role: user.role }) };
};
