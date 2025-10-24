import Assignment from "../models/Assignment";

export class TutorService {
  // other tutor related methods...

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
}
