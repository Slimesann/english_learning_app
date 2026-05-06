import Review from "../models/review.js";
import Course from "../models/course.js";

export const updateCourseRating = async (courseId) => {
    const stats = await Review.aggregate([
        { $match: { course: courseId, isDeleted: false } },
        {
        $group: {
            _id: "$course",
            avgRating: { $avg: "$rating" },
            count: { $sum: 1 },
        },
        },
    ]);

    const update = stats[0]
        ? {
            averageRating: Math.round(stats[0].avgRating * 10) / 10,
            ratingCount: stats[0].count,
        }
        : { averageRating: 0, ratingCount: 0 };

    await Course.findByIdAndUpdate(courseId, update);
};