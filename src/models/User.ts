import { Schema, model, Document } from "mongoose";

export type UserRole = "admin" | "parent" | "tutor";
export type TutorStatus = "pending" | "phone_verified" | "approved" | "rejected";

export interface IUser extends Document {
  role: UserRole;

  // Common fields
  email?: string;
  username?: string; // admin only
  password: string;
  fullName?: string;
  phone?: string;

  // Tutor fields
  subjects?: string[];
  languages?: string[];
  classesTaught?: string[];
  qualification?: string;
  college?: string;
  yearsOfExperience?: number;
  status?: TutorStatus; // only for tutors

  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ["admin", "parent", "tutor"],
      required: true
    },

    // 🔹 Admin
    username: {
      type: String,
      unique: true,
      sparse: true // allows other roles without username
    },

    // 🔹 Parent & Tutor
    email: {
      type: String,
      lowercase: true,
      unique: true,
      sparse: true
    },
    fullName: String,
    phone: String,

    // 🔹 All roles
    password: { type: String, required: true },

    // 🔹 Tutor-specific
    subjects: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    classesTaught: { type: [String], default: [] },
    qualification: String,
    college: String,
    yearsOfExperience: Number,

    // Tutor approval flow
    status: {
      type: String,
      enum: ["pending", "phone_verified", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

// 🔒 Role-based validation
UserSchema.pre("validate", function (next) {
  if (this.role === "admin") {
    if (!this.username) return next(new Error("Admin must have a username"));
  }

  if (this.role === "parent") {
    if (!this.fullName || !this.email || !this.phone) {
      return next(new Error("Parent must have fullName, email, phone"));
    }
  }

  if (this.role === "tutor") {
    if (
      !this.fullName ||
      !this.email ||
      !this.phone ||
      !this.subjects?.length ||
      !this.languages?.length ||
      !this.classesTaught?.length ||
      !this.qualification ||
      !this.college ||
      !this.yearsOfExperience
    ) {
      return next(new Error("Tutor must have all required fields"));
    }
  }

  next();
});

export default model<IUser>("User", UserSchema);
