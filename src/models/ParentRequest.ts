import { Schema, model, Document } from "mongoose";

export interface IParentRequest extends Document {
  parentId: string;
  academicNeeds: string[];
  scheduling: string[];
  location: string;
  urgency: "within_24_hours" | "within_3_days" | "within_a_week";
  status?: "pending" | "assigned" | "completed" | "cancelled";
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
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "completed", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

ParentRequestSchema.index({ status: 1 });
ParentRequestSchema.index({ academicNeeds: 1 });
ParentRequestSchema.index({ createdAt: -1 });

export default model<IParentRequest>("ParentRequest", ParentRequestSchema);
