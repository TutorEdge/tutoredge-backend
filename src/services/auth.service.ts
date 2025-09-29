import User from "../models/User";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";
import crypto from "crypto";
import { sendResetEmail } from "../utils/email";



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

//Forgot Password Service
export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  //Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendResetEmail(email, resetLink);
};

export const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) throw new Error("Invalid or expired token");

  const hashed = await hashPassword(newPassword);

  user.password = hashed;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};