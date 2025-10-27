import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuestion {
  _id?: Types.ObjectId;
  question: string;
  options: string[];
  correct_answer: string;
  type?: string;
}

export interface IQuiz extends Document {
  title: string;
  subject: string;
  class_grade: string;
  description?: string;
  questions: IQuestion[];
  created_by: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correct_answer: { type: String, required: true },
    type: { type: String, default: "Multiple Choice" }
  },
);

const QuizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    class_grade: { type: String, required: true },
    description: { type: String, default: "" },
    questions: { type: [QuestionSchema], required: true },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

// indexes if needed
QuizSchema.index({ created_by: 1, subject: 1 });

export default mongoose.model<IQuiz>("Quiz", QuizSchema);
