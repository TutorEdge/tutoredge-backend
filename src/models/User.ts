import mongoose, { Schema, Document } from "mongoose";

export type Role = "Student" | "Tutor" | "Parent" | "Admin";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  role: Role;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    role: {

      type: String,
      enum: ["Student", "Tutor", "Parent", "Admin"],
      default: "Student",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
