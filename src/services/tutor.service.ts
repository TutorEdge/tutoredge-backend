import Assignment from "../models/Assignment";
import Quiz from "../models/Quiz";

export class TutorService {

  async createAssignment(payload: {
    title: string;
    subject: string;
    class_grade: string;
    instructions?: string;
    attachment_url?: string;
    attachment_name?: string;
    due_date: string;
    allow_submission_online?: boolean;
    created_by: string;
  }) {
    // basic validation already done in controller; still ensure
    const assignment = await Assignment.create({
      title: payload.title,
      subject: payload.subject,
      class_grade: payload.class_grade,
      instructions: payload.instructions || "",
      attachment_url: payload.attachment_url || "",
      attachment_name: payload.attachment_name || "",
      due_date: payload.due_date,
      allow_submission_online: !!payload.allow_submission_online,
      created_by: payload.created_by
    });

    return assignment;
  }


  // Quiz
  async createQuiz(payload: {
    title: string;
    subject: string;
    class_grade: string;
    description?: string;
    questions: { question: string; options: string[]; correct_answer: string }[];
    created_by: string;
  }) {
    // Basic validation at service level (controller does main checks)
    if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
      throw new Error("Questions must be a non-empty array");
    }

    // Save
    const quiz = await Quiz.create({
      title: payload.title,
      subject: payload.subject,
      class_grade: payload.class_grade,
      description: payload.description || "",
      questions: payload.questions,
      created_by: payload.created_by
    });

    return quiz;
  }
}
