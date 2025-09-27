import User from "../models/User";
import { hashPassword, comparePassword } from "../utils/hash";
import { signToken } from "../utils/jwt";
import { sendEmail } from "../utils/sendEmail";

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const VERIFICATION_MINUTES = process.env.VERIFICATION_CODE_EXP_MINUTES
  ? parseInt(process.env.VERIFICATION_CODE_EXP_MINUTES)
  : 10;

export const signup = async (data: any) => {
  const { firstName, lastName, email, phone, password } = data;

  const existing = await User.findOne({ email });
  if (existing) throw new Error("User already exists");

  const hashed = await hashPassword(password);

  const verificationCode = generateCode();
  const verificationExpiry = new Date(Date.now() + VERIFICATION_MINUTES * 60 * 1000);

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password: hashed,
    role: "Student", // default role
    isVerified: false,
    verificationCode,
    verificationExpiry,
  });

   await sendEmail(
    email,
    "Your verification code",
    `Your verification code is ${verificationCode}. It expires in ${VERIFICATION_MINUTES} minutes.`
  );

  console.log(`Verification code for ${email}: ${verificationCode}`);
   return { message: "Please verify your email." };
};

export const verifyEmail = async (email: string, code: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (!user.verificationCode || !user.verificationExpiry) {
    throw new Error("No verification code found. Please request a new code.");
  }

  const now = new Date();
  if (user.verificationCode !== code || user.verificationExpiry < now) {
    throw new Error("Invalid or expired verification code");
  }

  user.isVerified = true;
  user.verificationCode = null;
  user.verificationExpiry = null;
  await user.save();

  return { message: "Email verified successfully!" };
};

export const login = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const match = await comparePassword(password, user.password);
  if (!match) throw new Error("Invalid credentials");
  
  if (!user.isVerified) {
    throw new Error("Please verify your email before logging in");
  }

  return { token: signToken({ id: user._id, role: user.role }) };
};
