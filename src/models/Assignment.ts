import { Schema, model, Document, Types } from "mongoose";

export interface IAttachment {
  filename: string;
  url: string;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  class_grade: string;
  instructions?: string;
  attachments?: IAttachment[];
  due_date: string; // store as YYYY-MM-DD string
  allow_submission_online: boolean;
  created_by: Types.ObjectId; // tutor user id
  createdAt?: Date;
  updatedAt?: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true }
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    class_grade: { type: String, required: true },
    instructions: { type: String, default: "" },
    attachments: { type: [AttachmentSchema], default: [] },
    due_date: { type: String, required: true },
    allow_submission_online: { type: Boolean, default: false },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

// Index due_date if you need queries by due date
AssignmentSchema.index({ due_date: 1 });

export default model<IAssignment>("Assignment", AssignmentSchema);
