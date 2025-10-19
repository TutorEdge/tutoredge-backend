import User, { IUser } from "../models/User";
import { hashPassword, comparePassword } from "../utils/hash";
import { signJwt } from "../utils/jwt";
import { config } from "../config/env";
import ParentRequest from "../models/ParentRequest";

export class AuthService {
  // 🔹 Admin Login
  async loginAdmin(username: string, password: string) {
    if (
      username !== config.ADMIN_USERNAME ||
      password !== config.ADMIN_PASSWORD
    ) {
      throw new Error("Invalid username or password");
    }

    const adminUser = {
      _id: "1",
      username: config.ADMIN_USERNAME,
      role: "admin"
    };

    const token = signJwt({ id: adminUser._id, role: adminUser.role });

    return { token, user: adminUser };
  }

  // 🔹 Parent Signup
  async signupParent(data: Partial<IUser>) {
    const { fullName, email, phone, password } = data;
    const existing = await User.findOne({ email });
    if (existing) throw new Error("Email already registered");

    const hashed = await hashPassword(password!);

    const user = await User.create({
      role: "parent",
      fullName,
      email,
      phone,
      password: hashed,
    });

    return user;
  }

  async loginParent(email: string, password: string) {
    const user = await User.findOne({ role: "parent", email });
    if (!user) throw new Error("Invalid email or password");

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = signJwt({ id: user._id, role: user.role });
    return { token, user };
  }

  // 🔹 Tutor Signup
  async signupTutor(data: Partial<IUser>) {
    const { email, phone, password } = data;
    const existing = await User.findOne({ email });
    if (existing) throw new Error("Email already registered");

    const hashed = await hashPassword(password!);

    const user = await User.create({
      ...data,
      role: "tutor",
      password: hashed,
      status: "pending", // default until verified + approved
    });

    return user;
  }

  async loginTutor(email: string, password: string) {
    const user = await User.findOne({ role: "tutor", email });
    if (!user) throw new Error("Invalid email or password");

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    if (user.status !== "approved") throw new Error("Tutor not approved yet");

    const token = signJwt({ id: user._id, role: user.role });
    return { token, user };
  }


  async getTutorApplications(status?: string, limit: number = 5) {
    const validStatuses = ["pending", "approved", "rejected"];
    if (status && !validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }

    const limitValue = Number(limit) || 5;
    if (!Number.isInteger(limitValue) || limitValue <= 0) {
      throw new Error("Invalid limit");
    }

    const query: any = { role: "tutor" };
    if (status) query.status = status;

    const tutors = await User.find(query)
      .sort({ createdAt: -1 }) // latest first
      .limit(limitValue)
      .select("fullName email status createdAt")
      .lean();

    return tutors.map((t: any) => ({
      name: t.fullName,
      email: t.email,
      status: t.status,
      appliedDate:
        t.createdAt instanceof Date
          ? t.createdAt.toISOString()
          : new Date(t.createdAt).toISOString()
    }));
  }

  async createParentRequest(parentId: string, data: any) {
    const { academicNeeds, scheduling, location, urgency } = data;

    // validation
    if (!academicNeeds || !Array.isArray(academicNeeds) || academicNeeds.length === 0) {
      throw new Error("academicNeeds cannot be empty");
    }

    const validUrgencies = ["within_24_hours", "within_3_days", "within_a_week"];
    if (!validUrgencies.includes(urgency)) {
      throw new Error("Invalid urgency value");
    }

    const request = await ParentRequest.create({
      parentId,
      academicNeeds,
      scheduling,
      location,
      urgency
    });

    return request;
  }

}
