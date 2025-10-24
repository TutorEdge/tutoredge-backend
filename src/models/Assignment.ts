import { Schema, model, Document, Types } from "mongoose";

export interface IAssignment extends Document {
  title: string;
  subject: string;
  class_grade: string;
  instructions?: string;
  attachment_url?: string;
  attachment_name?: string;
  due_date: string; // store as YYYY-MM-DD string
  allow_submission_online: boolean;
  created_by: Types.ObjectId; // tutor user id
  createdAt?: Date;
  updatedAt?: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    class_grade: { type: String, required: true },
    instructions: { type: String, default: "" },
    attachment_url: { type: String, default: "" },
    attachment_name: { type: String, default: "" },
    due_date: { type: String, required: true },
    allow_submission_online: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

// Index due_date if you need queries by due date
AssignmentSchema.index({ due_date: 1 });

export default model<IAssignment>("Assignment", AssignmentSchema);
