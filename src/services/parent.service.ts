import User from "../models/User";
import ParentRequest from "../models/ParentRequest";
import Student from "../models/Student";
import { Types } from "mongoose";

export class ParentService {
  async searchTutors(filters: any) {
    const query: any = { role: "tutor" };

    // Apply filters only if they exist
    if (filters.subject) {
      query.subjects = { $regex: new RegExp(filters.subject, "i") };
    }

    if (filters.teachingMode) {
      query.teachingMode = filters.teachingMode;
    }

    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
    }

    if (filters.minExperience) {
      query.yearsOfExperience = { $gte: Number(filters.minExperience) };
    }

    if (filters.availability) {
      query.availability = filters.availability;
    }

    if (filters.minRating) {
      query.rating = { $gte: Number(filters.minRating) };
    }

    console.log("Final Query:", query);

    // Execute query
    const tutors = await User.find(query)
      .sort({ rating: -1 }) // sort by rating desc
      .select(
        "fullName email subjects teachingMode price yearsOfExperience availability rating testimonial"
      )
      .lean();

    return tutors;
  }

  async getParentRequests(params: any) {
    const { type = "latest", status, subject } = params;
    let limit = params.limit ? Number(params.limit) : 5;

    if (isNaN(limit) || limit <= 0) {
      throw new Error("Invalid limit value");
    }

    // validate type
    if (!["latest", "all"].includes(type)) {
      throw new Error("Invalid type; allowed values: latest, all");
    }

    // build base query
    const query: any = {};

    if (status) {
      const validStatuses = ["pending", "assigned", "completed", "cancelled"];
      if (!validStatuses.includes(status)) throw new Error("Invalid status value");
      query.status = status;
    }

    if (subject) {
      // academicNeeds is array of strings — use regex to match subject text-insensitive
      query.academicNeeds = { $elemMatch: { $regex: new RegExp(subject, "i") } };
    }

    const mongoQuery = ParentRequest.find(query).sort({ createdAt: -1 });

    if (type === "latest") {
      mongoQuery.limit(limit);
    } else {
      // type === 'all' -> optional limit - allow large but set a safe maximum cap (e.g. 500)
      const maxCap = 500;
      if (limit > maxCap) limit = maxCap;
      mongoQuery.limit(limit);
    }

    // select fields to return. You can expand as needed.
    const requests = await mongoQuery
      .select("parentId academicNeeds scheduling location urgency status createdAt")
      .lean();

    // Optionally enrich parent info (name, email) — do a small lookup
    const parentIds = Array.from(new Set(requests.map((r: any) => r.parentId))).filter(Boolean);
    const parents = await User.find({ _id: { $in: parentIds } })
      .select("fullName email phone")
      .lean();

    const parentMap: Record<string, any> = {};
    parents.forEach((p: any) => (parentMap[String(p._id)] = p));

    // format response
    return requests.map((r: any) => ({
      id: r._id,
      parentId: r.parentId,
      parent: parentMap[r.parentId] || null,
      academicNeeds: r.academicNeeds,
      scheduling: r.scheduling,
      location: r.location,
      urgency: r.urgency,
      status: r.status,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : new Date(r.createdAt).toISOString()
    }));
  }


  // add student
  async addStudent(parentId: string, payload: { full_name: string; class_grade: string }) {
    if (!payload.full_name || !payload.class_grade) {
      throw new Error("Missing required fields");
    }

    if (!Types.ObjectId.isValid(parentId)) {
      throw new Error("Invalid parent id");
    }

    const student = await Student.create({
      full_name: payload.full_name,
      class_grade: payload.class_grade,
      parent_id: new Types.ObjectId(parentId)
    });

    return student;
  }
}
