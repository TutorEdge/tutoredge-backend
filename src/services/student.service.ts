import Assignment from "../models/Assignment";
import Quiz from "../models/Quiz";
import { Types } from "mongoose";

export class StudentService {
  async fetchAssignmentsAndQuizzes(options: {
    classGrade: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { classGrade, status, page = 1, limit = 10 } = options;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // midnight today

    const isUpcomingMatch = (docDueDate: string | undefined) => {
      if (!docDueDate) return true;
      const d = new Date(docDueDate + "T23:59:59Z");
      return d >= today;
    };

    const assignmentBaseQuery: any = { class_grade: classGrade };

    const quizBaseQuery: any = { class_grade: classGrade };

    // Adjust queries for status
    let assignmentQuery = { ...assignmentBaseQuery };
    let quizQuery = { ...quizBaseQuery };

    if (status === "upcoming") {
      const isoToday = today.toISOString().slice(0, 10); // YYYY-MM-DD
      assignmentQuery = {
        ...assignmentBaseQuery,
        $or: [{ due_date: { $gte: isoToday } }, { due_date: { $exists: false } }]
      };
      quizQuery = {
        ...quizBaseQuery,
        $or: [{ due_date: { $gte: isoToday } }, { due_date: { $exists: false } }]
      };
    } else if (status === "completed") {
      const isoToday = today.toISOString().slice(0, 10);
      assignmentQuery = {
        ...assignmentBaseQuery,
        due_date: { $lt: isoToday }
      };
      quizQuery = {
        ...quizBaseQuery,
        due_date: { $lt: isoToday }
      };
    }

    const [assignments, quizzes] = await Promise.all([
      Assignment.find(assignmentQuery)
        .sort(status === "completed" ? { due_date: -1 } : { due_date: 1 })
        .skip(skip)
        .limit(limitNum)
        .populate({ path: "created_by", select: "fullName" })
        .lean(),
      Quiz.find(quizQuery)
        .sort(status === "completed" ? { createdAt: -1 } : { createdAt: 1 })
        .skip(skip)
        .limit(limitNum)
        .populate({ path: "created_by", select: "fullName" })
        .lean()
    ]);

    // Map to unified shape
    const mapAssignment = (a: any) => {
      const due_date = a.due_date || a.createdAt?.toISOString?.().slice(0, 10) || null;
      const isCompleted = a.due_date ? new Date(a.due_date + "T23:59:59Z") < today : false;
      return {
        id: String(a._id),
        title: a.title,
        subject: a.subject,
        tutor: a.created_by?.fullName || "",
        due_date,
        type: "Assignment",
        completed_on: isCompleted ? a.updatedAt || a.due_date : undefined
      };
    };

    const mapQuiz = (q: any) => {
      const due_date = q.due_date || q.createdAt?.toISOString?.().slice(0, 10) || null;
      const isCompleted = q.due_date ? new Date(q.due_date + "T23:59:59Z") < today : false;
      return {
        id: String(q._id),
        title: q.title,
        subject: q.subject,
        tutor: q.created_by?.fullName || "",
        due_date,
        type: "Quiz",
        completed_on: isCompleted ? q.updatedAt || q.due_date : undefined
      };
    };

    // Separate upcoming & completed lists
    const allItems = [
      ...assignments.map(mapAssignment),
      ...quizzes.map(mapQuiz)
    ];

    const upcoming = allItems.filter((it) => {
      // upcoming if due_date is null (no due) OR due_date >= today
      if (!it.due_date) return true;
      const d = new Date(it.due_date + "T23:59:59Z");
      return d >= today;
    });

    const completed = allItems.filter((it) => {
      if (!it.due_date) return false;
      const d = new Date(it.due_date + "T23:59:59Z");
      return d < today;
    });

    const summary = {
      upcoming_count: upcoming.length,
      completed_count: completed.length
    };

    return { upcoming, completed, summary };
  }
}

export default new StudentService();
