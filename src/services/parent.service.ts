import User from "../models/User";

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
}
