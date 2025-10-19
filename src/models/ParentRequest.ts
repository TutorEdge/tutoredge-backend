import { Schema, model, Document } from "mongoose";

export interface IParentRequest extends Document {
  parentId: string;
  academicNeeds: string[];
  scheduling: string[];
  location: string;
  urgency: "within_24_hours" | "within_3_days" | "within_a_week";
  createdAt?: Date;
}

const ParentRequestSchema = new Schema<IParentRequest>(
  {
    parentId: { type: String, required: true },
    academicNeeds: { type: [String], required: true },
    scheduling: { type: [String], default: [] },
    location: { type: String, required: true },
    urgency: {
      type: String,
      enum: ["within_24_hours", "within_3_days", "within_a_week"],
      required: true
    }
  },
  { timestamps: true }
);

export default model<IParentRequest>("ParentRequest", ParentRequestSchema);
