import Assignment from '../models/Assignment';
import Quiz from '../models/Quiz';
import mongoose from 'mongoose';

export class TutorService {
  async createAssignment(payload: {
    title: string;
    subject: string;
    class_grade: string;
    instructions?: string;
    due_date: string;
    allow_submission_online?: boolean;
    attachments?: { filename: string; url: string }[];
    created_by: string;
  }) {
    // basic validation already done in controller; still ensure
    const assignment = await Assignment.create({
      title: payload.title,
      subject: payload.subject,
      class_grade: payload.class_grade,
      instructions: payload.instructions || '',
      attachments: payload.attachments || [],
      due_date: payload.due_date,
      allow_submission_online: !!payload.allow_submission_online,
      created_by: payload.created_by,
    });

    return assignment;
  }

  //update assignment
  async updateAssignment(
    assignmentId: string,
    tutorId: string,
    data: {
      title: string;
      subject: string;
      class_grade: string;
      instructions?: string;
      due_date: string;
      allow_submission_online: boolean;
      attachments?: { filename: string; url: string }[];
    },
  ) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    // Only owner can update
    if (assignment.created_by.toString() !== tutorId.toString()) {
      throw new Error('Forbidden');
    }

    // Update fields
    assignment.title = data.title;
    assignment.subject = data.subject;
    assignment.class_grade = data.class_grade;
    assignment.instructions = data.instructions || '';
    assignment.due_date = data.due_date;
    assignment.allow_submission_online = data.allow_submission_online;

    // Attachments: if new ones passed, replace existing
    if (data.attachments && data.attachments.length > 0) {
      assignment.attachments = data.attachments;
    }

    await assignment.save();
    return assignment;
  }

  // Quiz
  async createQuiz(payload: {
    title: string;
    subject: string;
    class_grade: string;
    description?: string;
    questions: {
      question: string;
      options: string[];
      correct_answer: string;
    }[];
    created_by: string;
  }) {
    // Basic validation at service level (controller does main checks)
    if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
      throw new Error('Questions must be a non-empty array');
    }

    // Save
    const quiz = await Quiz.create({
      title: payload.title,
      subject: payload.subject,
      class_grade: payload.class_grade,
      description: payload.description || '',
      questions: payload.questions,
      created_by: payload.created_by,
    });

    return quiz;
  }

  // update quiz
  async updateQuiz(quizId: string, tutorId: string, data: any) {
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw new Error('Invalid quiz ID');
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new Error('Quiz not found');

    // permission check
    if (String(quiz.created_by) !== String(tutorId)) {
      throw new Error('Forbidden: you are not the creator of this quiz');
    }

    // Validate basics (service-level): required metadata
    if (!data.title || !data.subject || !data.class_grade) {
      throw new Error('Missing required fields: title, subject, class_grade');
    }

    // Update metadata
    quiz.title = data.title;
    quiz.subject = data.subject;
    quiz.class_grade = data.class_grade;
    quiz.description = data.description || quiz.description;

    const incomingQuestions: any[] = Array.isArray(data.questions)
      ? data.questions
      : [];

    // If no questions provided, you may decide to reject or allow; here we allow empty array
    // Build map of incoming question ids (strings)
    const incomingIds = new Set(
      incomingQuestions
        .filter((q) => q.id || q._id)
        .map((q) => String(q.id || q._id)),
    );

    // 1) Update existing subdocs and mark which existing ids remain
    const existingQuestionIds = quiz.questions.map((q: any) => String(q._id));

    // Update or add
    for (const q of incomingQuestions) {
      if (q.id || q._id) {
        const qid = String(q.id || q._id);
        // try to find subdoc
        const subdoc = quiz.questions.find((qq: any) => String(qq._id) === qid);
        if (subdoc) {
          // validate correct_answer in options
          if (q.options && !q.options.includes(q.correct_answer)) {
            throw new Error(
              `correct_answer must be one of options for question id ${qid}`,
            );
          }
          subdoc.question = q.question ?? subdoc.question;
          subdoc.options = Array.isArray(q.options)
            ? q.options
            : subdoc.options;
          subdoc.correct_answer = q.correct_answer ?? subdoc.correct_answer;
          if (q.type) subdoc.type = q.type;
        } else {
          // subdoc with this id not found — treat as new (or throw). We'll throw to avoid silent issues.
          throw new Error(`Question with id ${qid} not found in this quiz`);
        }
      } else {
        // new question -> push
        if (
          !q.question ||
          !Array.isArray(q.options) ||
          q.options.length < 1 ||
          !q.correct_answer
        ) {
          throw new Error(
            'New questions must include question, options (non-empty), and correct_answer',
          );
        }
        if (!q.options.includes(q.correct_answer)) {
          throw new Error(
            'correct_answer must be one of options for new question',
          );
        }
        quiz.questions.push({
          _id: new mongoose.Types.ObjectId(),
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          type: q.type || 'Multiple Choice',
        });
      }
    }

    // 2) Remove deleted questions: any existing id not present in incomingIds should be removed
    for (const existingId of existingQuestionIds) {
      if (!incomingIds.has(existingId)) {
        // remove subdoc
        quiz.questions = quiz.questions.filter(
          (qq: any) => String(qq._id) !== existingId,
        );
      }
    }

    // Save and return updated quiz
    await quiz.save();
    return quiz;
  }

  // Delete quiz
  async deleteQuiz(quizId: string, tutorId: string) {
    // validate id
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      throw new Error('Invalid quiz ID');
    }

    // find quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new Error('Quiz not found');

    // ownership check
    if (String(quiz.created_by) !== String(tutorId)) {
      throw new Error('Forbidden');
    }

    // NOTE: hard delete here. For soft delete, set flag instead.
    await Quiz.findByIdAndDelete(quizId);

    // Optionally return deleted quiz summary
    return {
      id: quiz._id,
      title: quiz.title,
      subject: quiz.subject,
    };
  }
}
