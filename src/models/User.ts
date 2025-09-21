import mongoose, { Schema, Document } from "mongoose";

export type Role = "Student" | "Tutor" | "Parent" | "Admin";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Student", "Tutor", "Parent", "Admin"],
      default: "Student",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
