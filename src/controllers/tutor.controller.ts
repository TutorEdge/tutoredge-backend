import { FastifyReply, FastifyRequest } from 'fastify';
import { TutorService } from '../services/tutor.service';
import { saveFile } from '../utils/upload';
import { MultipartValue, MultipartFile } from '@fastify/multipart';

const tutorService = new TutorService();

export class TutorController {
  async createAssignment(req: FastifyRequest, reply: FastifyReply) {
    try {
      // Fastify multipart parsing
      if (req.isMultipart()) {
        const mp = await req.multipart();
        // handle file upload here
      } else {
        return reply
          .status(400)
          .send({ error: 'Request is not multipart/form-data' });
      }

      // We will use request.body fields if client uses fields + file
      // fastify-multipart supports parsing via parts iterator:
      const parts = req.parts ? req.parts() : null;

      // Simpler approach: use req.saveRequestFiles or use parts iterator.
      // We'll use parts iterator to accept both fields and file.
      const fields: Record<string, any> = {};
      let fileBuffer: Buffer | null = null;
      let fileName = '';
      let fileMime = '';

      if ((req as any).isMultipart && (req as any).parts) {
        for await (const part of req.parts()) {
          if (part.type === 'file') {
            // read stream into buffer
            const chunks: Buffer[] = [];
            for await (const chunk of part.file)
              chunks.push(Buffer.from(chunk));
            fileBuffer = Buffer.concat(chunks);
            fileName = part.filename || '';
            fileMime = part.mimetype || '';
          } else {
            // field
            fields[part.fieldname] = part.value;
          }
        }
      } else {
        // not multipart — fallback to JSON body
        Object.assign(fields, req.body as any);
      }

      // Required fields validation
      const title = fields.title?.trim();
      const subject = fields.subject?.trim();
      const class_grade = fields.class_grade?.trim();
      const due_date = fields.due_date?.trim();
      const allow_submission_online =
        fields.allow_submission_online === 'true' ||
        fields.allow_submission_online === true;

      if (!title || !subject || !class_grade || !due_date) {
        return reply
          .status(400)
          .send({
            error:
              'Missing required fields: title, subject, class_grade, due_date',
          });
      }

      // Validate due_date format YYYY-MM-DD (simple check)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
        return reply
          .status(400)
          .send({ error: 'due_date must be in YYYY-MM-DD format' });
      }

      // File validation if provided
      let attachment_url = '';
      let attachment_name = '';

      if (fileBuffer) {
        const allowed = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
        ];
        if (!allowed.includes(fileMime)) {
          return reply.status(400).send({ error: 'Invalid file type' });
        }
        if (fileBuffer.length > 10 * 1024 * 1024) {
          return reply.status(400).send({ error: 'File too large (max 10MB)' });
        }

        const saved = await saveFile(fileBuffer, fileName, fileMime);
        attachment_url = saved.url;
        attachment_name = saved.filename;
      }

      // user from middleware
      const user = (req as any).user;
      if (!user || user.role !== 'tutor') {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const assignment = await tutorService.createAssignment({
        title,
        subject,
        class_grade,
        instructions: fields.instructions || '',
        attachment_url,
        attachment_name,
        due_date,
        allow_submission_online,
        created_by: user.id,
      });

      return reply.status(201).send({
        message: 'Assignment created successfully',
        assignment: {
          id: assignment._id,
          title: assignment.title,
          subject: assignment.subject,
          class_grade: assignment.class_grade,
          instructions: assignment.instructions,
          attachment_url: assignment.attachment_url,
          due_date: assignment.due_date,
          allow_submission_online: assignment.allow_submission_online,
          created_at: assignment.createdAt,
        },
      });
    } catch (err: any) {
      console.error('createAssignment error:', err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  }

  // Quiz
async createQuiz(req: FastifyRequest, reply: FastifyReply) {
  try {
    const body = req.body as any;
    const { title, subject, class_grade, description, questions } = body;

    //  1. Validate required fields
    if (!title || !subject || !class_grade || !questions) {
      return reply
        .status(400)
        .send({
          error: "Missing required fields: title, subject, class_grade, questions",
        });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return reply
        .status(400)
        .send({ error: "questions must be a non-empty array" });
    }

    //  2. Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (
        !q ||
        typeof q.question !== "string" ||
        !Array.isArray(q.options) ||
        q.options.length < 2 ||
        typeof q.correct_answer !== "string"
      ) {
        return reply
          .status(400)
          .send({ error: `Invalid question at index ${i}` });
      }
      if (!q.options.includes(q.correct_answer)) {
        return reply
          .status(400)
          .send({
            error: `correct_answer must be one of options for question index ${i}`,
          });
      }
    }

    //  3. Ensure tutor
    const user = (req as any).user;
    if (!user || user.role !== "tutor") {
      return reply.status(403).send({ error: "Forbidden" });
    }

    //  4. Create quiz
    const quizDoc = await tutorService.createQuiz({
      title,
      subject,
      class_grade,
      description,
      questions,
      created_by: user.id,
    });

    // 5. Convert mongoose document to plain JS object
    const quiz = quizDoc;

    // 6. Send clean response
    return reply.status(201).send({
      message: "Quiz created successfully",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        class_grade: quiz.class_grade,
        description: quiz.description,
        questions_count: quiz.questions?.length || 0,
        created_at: quiz.createdAt,
      },
    });
  } catch (err: any) {
    console.error("createQuiz error:", err);
    if (err.message && err.message.includes("Invalid")) {
      return reply.status(400).send({ error: err.message });
    }
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}

  //update quiz
  async updateQuiz(req: FastifyRequest, reply: FastifyReply) {
    try {
      const quizId = (req.params as any).id;
      const payload = req.body as any;

      // Basic request validation
      if (!quizId) return reply.status(400).send({ error: "Missing quiz id in params" });

      if (!payload.title || !payload.subject || !payload.class_grade) {
        return reply.status(400).send({ error: "Missing required fields: title, subject, class_grade" });
      }

      // Validate questions shape (optional quick check)
      if (payload.questions && !Array.isArray(payload.questions)) {
        return reply.status(400).send({ error: "questions must be an array" });
      }

      const user = (req as any).user;
      if (!user || user.role !== "tutor") {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const updated = await tutorService.updateQuiz(quizId, user.id, payload);

      return reply.status(200).send({
        message: "Quiz updated successfully",
        quiz: {
          id: updated._id,
          title: updated.title,
          subject: updated.subject,
          class_grade: updated.class_grade,
          description: updated.description,
          questions_count: updated.questions.length,
          updated_at: updated.updatedAt
        }
      });
    } catch (err: any) {
      console.error("updateQuiz error:", err);
      if (err.message === "Quiz not found") return reply.status(404).send({ error: err.message });
      if (err.message === "Forbidden: you are not the creator of this quiz") return reply.status(403).send({ error: err.message });
      if (err.message && (err.message.includes("Missing") || err.message.includes("correct_answer") || err.message.includes("Invalid"))) {
        return reply.status(400).send({ error: err.message });
      }
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  }

  // delete quiz
  async deleteQuiz(req: FastifyRequest, reply: FastifyReply) {
  try {
    const quizId = (req.params as any).id;
    if (!quizId) return reply.status(400).send({ error: "Missing quiz id in params" });

    const user = (req as any).user;
    if (!user || user.role !== "tutor") {
      return reply.status(403).send({ error: "Unauthorized access" });
    }

    // call service
    const result = await tutorService.deleteQuiz(quizId, user.id);

    // log deletion for audit (optional)
    console.log(`Quiz deleted by tutor ${user.id} — quiz ${quizId}`);

    return reply.status(200).send({
      message: "Quiz deleted successfully",
      deleted_quiz_id: String(result.id)
    });
  } catch (err: any) {
    console.error("deleteQuiz error:", err);
    if (err.message === "Quiz not found") return reply.status(404).send({ error: "Quiz not found" });
    if (err.message === "Forbidden") return reply.status(403).send({ error: "Unauthorized access" });
    if (err.message && err.message.includes("Invalid")) return reply.status(400).send({ error: err.message });
    return reply.status(500).send({ error: "Internal Server Error" });
  }
}
}
