import { FastifyReply, FastifyRequest } from 'fastify';
import { TutorService } from '../services/tutor.service';
import { saveFile } from '../utils/upload';
import { MultipartValue, MultipartFile } from '@fastify/multipart';

const tutorService = new TutorService();

export class TutorController {
  async createAssignment(req: FastifyRequest, reply: FastifyReply) {
    try {
      if (!req.isMultipart()) {
        return reply
          .status(400)
          .send({ error: 'Request must be multipart/form-data' });
      }

      const parts = req.parts();
      const fields: Record<string, any> = {};
      const attachments: { filename: string; url: string }[] = [];

      // parse files + fields
      for await (const part of parts) {
        if (part.type === 'file') {
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) chunks.push(Buffer.from(chunk));
          const buffer = Buffer.concat(chunks);
          const mimetype = part.mimetype || '';

          // file validations
          const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
          ];
          if (!allowed.includes(mimetype)) {
            return reply.status(400).send({ error: 'Invalid file type' });
          }
          if (buffer.length > 10 * 1024 * 1024) {
            return reply
              .status(400)
              .send({ error: 'File too large (max 10MB)' });
          }

          // save file
          const saved = await saveFile(
            buffer,
            part.filename || 'file',
            mimetype,
          );
          attachments.push({ filename: saved.filename, url: saved.url });
        } else {
          // collect text fields
          fields[part.fieldname] = part.value;
        }
      }

      // required field validation
      const title = fields.title?.trim();
      const subject = fields.subject?.trim();
      const class_grade = fields.class_grade?.trim();
      const due_date = fields.due_date?.trim();
      const allow_submission_online =
        fields.allow_submission_online === 'true' ||
        fields.allow_submission_online === true;

      if (!title || !subject || !class_grade || !due_date) {
        return reply.status(400).send({
          error:
            'Missing required fields: title, subject, class_grade, due_date',
        });
      }

      // simple date format validation
      if (!/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
        return reply
          .status(400)
          .send({ error: 'due_date must be in YYYY-MM-DD format' });
      }

      // get user from middleware
      const user = (req as any).user;
      if (!user || user.role !== 'tutor') {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      // call service
      const assignment = await tutorService.createAssignment({
        title,
        subject,
        class_grade,
        instructions: fields.instructions || '',
        due_date,
        allow_submission_online,
        attachments,
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
          attachments: assignment.attachments || [],
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

  //update assignment
  async updateAssignment(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = req.params as any;
      if (!id)
        return reply.status(400).send({ error: 'Missing assignment ID' });

      const user = (req as any).user;
      if (!user || user.role !== 'tutor')
        return reply.status(403).send({ error: 'Unauthorized' });

      if (!(req as any).isMultipart()) {
        return reply
          .status(400)
          .send({ error: 'Request must be multipart/form-data' });
      }

      const parts = (req as any).parts();
      const fields: Record<string, any> = {};
      const attachments: { filename: string; url: string }[] = [];

      for await (const part of parts) {
        if (part.type === 'file') {
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) chunks.push(chunk);
          const buffer = Buffer.concat(chunks);
          const mimetype = part.mimetype || '';

          const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/png',
            'image/jpeg',
          ];
          if (!allowed.includes(mimetype))
            return reply.status(400).send({ error: 'Invalid file type' });
          if (buffer.length > 10 * 1024 * 1024)
            return reply
              .status(400)
              .send({ error: 'File too large (max 10MB)' });

          const saved = await saveFile(
            buffer,
            part.filename || 'file',
            mimetype,
          );
          attachments.push({ filename: saved.filename, url: saved.url });
        } else {
          fields[part.fieldname] = part.value;
        }
      }

      const { title, subject, class_grade, due_date } = fields;
      if (!title || !subject || !class_grade || !due_date)
        return reply.status(400).send({
          error:
            'Missing required fields: title, subject, class_grade, due_date',
        });

      const allow_submission_online =
        fields.allow_submission_online === 'true' ||
        fields.allow_submission_online === true;

      const assignment = await tutorService.updateAssignment(id, user.id, {
        title,
        subject,
        class_grade,
        instructions: fields.instructions,
        due_date,
        allow_submission_online,
        attachments,
      });

      reply.status(200).send({
        message: 'Assignment updated successfully',
        assignment: {
          id: assignment._id,
          title: assignment.title,
          subject: assignment.subject,
          class_grade: assignment.class_grade,
          instructions: assignment.instructions,
          attachments: assignment.attachments || [],
          due_date: assignment.due_date,
          allow_submission_online: assignment.allow_submission_online,
          updated_at: assignment.updatedAt,
        },
      });
    } catch (err: any) {
      console.error('updateAssignment error:', err);
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  }

  //delete assignment
  async deleteAssignment(req: FastifyRequest, reply: FastifyReply) {
    try {
      const assignmentId = (req.params as any).id;
      if (!assignmentId) {
        return reply
          .status(400)
          .send({ error: 'Missing assignment id in params' });
      }

      const user = (req as any).user;
      if (!user || user.role !== 'tutor') {
        return reply.status(403).send({ error: 'Unauthorized access' });
      }

      const result = await tutorService.deleteAssignment(assignmentId, user.id);

      // optional audit log
      console.log(
        `Assignment deleted by tutor ${user.id} — assignment ${assignmentId}`,
      );

      return reply.status(200).send({
        message: 'Assignment deleted successfully',
        deleted_assignment_id: result.id,
      });
    } catch (err: any) {
      console.error('deleteAssignment error:', err);
      if (err.message === 'Assignment not found') {
        return reply.status(404).send({ error: 'Assignment not found' });
      }
      if (err.message === 'Forbidden') {
        return reply.status(403).send({ error: 'Unauthorized access' });
      }
      if (err.message && err.message.includes('Invalid')) {
        return reply.status(400).send({ error: err.message });
      }
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
        return reply.status(400).send({
          error:
            'Missing required fields: title, subject, class_grade, questions',
        });
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        return reply
          .status(400)
          .send({ error: 'questions must be a non-empty array' });
      }

      //  2. Validate each question
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (
          !q ||
          typeof q.question !== 'string' ||
          !Array.isArray(q.options) ||
          q.options.length < 2 ||
          typeof q.correct_answer !== 'string'
        ) {
          return reply
            .status(400)
            .send({ error: `Invalid question at index ${i}` });
        }
        if (!q.options.includes(q.correct_answer)) {
          return reply.status(400).send({
            error: `correct_answer must be one of options for question index ${i}`,
          });
        }
      }

      //  3. Ensure tutor
      const user = (req as any).user;
      if (!user || user.role !== 'tutor') {
        return reply.status(403).send({ error: 'Forbidden' });
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
        message: 'Quiz created successfully',
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
      console.error('createQuiz error:', err);
      if (err.message && err.message.includes('Invalid')) {
        return reply.status(400).send({ error: err.message });
      }
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  }

  //update quiz
  async updateQuiz(req: FastifyRequest, reply: FastifyReply) {
    try {
      const quizId = (req.params as any).id;
      const payload = req.body as any;

      // Basic request validation
      if (!quizId)
        return reply.status(400).send({ error: 'Missing quiz id in params' });

      if (!payload.title || !payload.subject || !payload.class_grade) {
        return reply.status(400).send({
          error: 'Missing required fields: title, subject, class_grade',
        });
      }

      // Validate questions shape (optional quick check)
      if (payload.questions && !Array.isArray(payload.questions)) {
        return reply.status(400).send({ error: 'questions must be an array' });
      }

      const user = (req as any).user;
      if (!user || user.role !== 'tutor') {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const updated = await tutorService.updateQuiz(quizId, user.id, payload);

      return reply.status(200).send({
        message: 'Quiz updated successfully',
        quiz: {
          id: updated._id,
          title: updated.title,
          subject: updated.subject,
          class_grade: updated.class_grade,
          description: updated.description,
          questions_count: updated.questions.length,
          updated_at: updated.updatedAt,
        },
      });
    } catch (err: any) {
      console.error('updateQuiz error:', err);
      if (err.message === 'Quiz not found')
        return reply.status(404).send({ error: err.message });
      if (err.message === 'Forbidden: you are not the creator of this quiz')
        return reply.status(403).send({ error: err.message });
      if (
        err.message &&
        (err.message.includes('Missing') ||
          err.message.includes('correct_answer') ||
          err.message.includes('Invalid'))
      ) {
        return reply.status(400).send({ error: err.message });
      }
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  }

  // delete quiz
  async deleteQuiz(req: FastifyRequest, reply: FastifyReply) {
    try {
      const quizId = (req.params as any).id;
      if (!quizId)
        return reply.status(400).send({ error: 'Missing quiz id in params' });

      const user = (req as any).user;
      if (!user || user.role !== 'tutor') {
        return reply.status(403).send({ error: 'Unauthorized access' });
      }

      // call service
      const result = await tutorService.deleteQuiz(quizId, user.id);

      // log deletion for audit (optional)
      console.log(`Quiz deleted by tutor ${user.id} — quiz ${quizId}`);

      return reply.status(200).send({
        message: 'Quiz deleted successfully',
        deleted_quiz_id: String(result.id),
      });
    } catch (err: any) {
      console.error('deleteQuiz error:', err);
      if (err.message === 'Quiz not found')
        return reply.status(404).send({ error: 'Quiz not found' });
      if (err.message === 'Forbidden')
        return reply.status(403).send({ error: 'Unauthorized access' });
      if (err.message && err.message.includes('Invalid'))
        return reply.status(400).send({ error: err.message });
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  }

  //upload study material
  async uploadStudyMaterial(req: FastifyRequest, reply: FastifyReply) {
    try {
      if (!(req as any).isMultipart || !(req as any).parts) {
        return reply
          .status(400)
          .send({
            success: false,
            message: 'Request must be multipart/form-data',
          });
      }

      const parts = (req as any).parts();
      const fields: Record<string, any> = {};
      const files: {
        filename: string;
        url: string;
        size?: number;
        mimetype?: string;
      }[] = [];

      // Accept multiple files and fields
      for await (const part of parts) {
        if (part.type === 'file') {
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) chunks.push(Buffer.from(chunk));
          const buffer = Buffer.concat(chunks);
          const mimetype = part.mimetype || '';
          // Allowed types: pdf, doc, docx, images, videos
          const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'video/mp4',
            'video/webm',
            'video/quicktime',
          ];
          if (!allowed.includes(mimetype)) {
            return reply
              .status(400)
              .send({ success: false, message: 'Invalid file type' });
          }
          // limit per-file size (adjust as needed)
          if (buffer.length > 50 * 1024 * 1024) {
            // example 50MB limit for videos
            return reply
              .status(400)
              .send({ success: false, message: 'File too large' });
          }

          const saved = await saveFile(
            buffer,
            part.filename || 'file',
            mimetype,
          );
          files.push({
            filename: saved.filename,
            url: saved.url,
            size: buffer.length,
            mimetype,
          });
        } else {
          // field
          fields[part.fieldname] = part.value;
        }
      }

      // required fields
      const material_title = (fields.material_title || '').trim();
      const subject = (fields.subject || '').trim();
      const class_grade = (fields.class_grade || '').trim();
      const description = fields.description || '';
      const share_with_all =
        fields.share_with_all === 'true' || fields.share_with_all === true;

      if (!material_title || !subject || !class_grade) {
        return reply
          .status(400)
          .send({ success: false, message: 'Missing required fields' });
      }
      if (!files.length) {
        return reply
          .status(400)
          .send({ success: false, message: 'At least one file is required' });
      }

      // auth
      const user = (req as any).user;
      if (!user || user.role !== 'tutor') {
        return reply.status(403).send({ success: false, message: 'Forbidden' });
      }

      const material = await tutorService.uploadStudyMaterial({
        material_title,
        subject,
        class_grade,
        description,
        files,
        share_with_all,
        created_by: user.id,
      });

      return reply.status(200).send({
        success: true,
        message: 'Study material uploaded successfully.',
        data: {
          id: material.id,
          material_title: material.material_title,
          subject: material.subject,
          class_grade: material.class_grade,
          description: material.description,
          share_with_all: material.share_with_all,
          files: material.files,
          uploaded_at: material.createdAt,
        },
      });
    } catch (err: any) {
      console.error('uploadStudyMaterial error:', err);
      return reply
        .status(500)
        .send({ success: false, message: 'Internal Server Error' });
    }
  }

  
}
