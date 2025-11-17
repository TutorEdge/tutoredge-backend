import { Schema, model, Document, Types } from "mongoose";

export interface IStudent extends Document {
  full_name: string;
  class_grade: string;
  parent_id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    full_name: { type: String, required: true },
    class_grade: { type: String, required: true },
    parent_id: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

StudentSchema.index({ parent_id: 1 });

export default model<IStudent>("Student", StudentSchema);
