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
}
