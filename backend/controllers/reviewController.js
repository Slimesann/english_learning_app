import Review from "../models/review.js";
import Course from "../models/course.js";

// Hàm cập nhật averageRating + ratingCount
const updateCourseRating = async (courseId) => {
    const stats = await Review.aggregate([
        { $match: { course: courseId } },
        {
        $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            count: { $sum: 1 },
        },
        },
    ]);

    const update = stats.length > 0
        ? { averageRating: Math.round(stats[0].avgRating * 10) / 10, ratingCount: stats[0].count }
        : { averageRating: 0, ratingCount: 0 };

    await Course.findByIdAndUpdate(courseId, update);
};

// Tạo đánh giá
export const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const courseId = req.params.courseId;
        const userId = req.user._id;

        const existed = await Review.findOne({ course: courseId, user: userId });
        if (existed) return res.status(400).json({ message: "Bạn đã đánh giá khóa học này rồi!" });

        const review = new Review({
        course: courseId,
        user: userId,
        rating,
        comment: comment?.trim(),
        });

        await review.save();
        await updateCourseRating(courseId);

        const populated = await Review.findById(review._id).populate("user", "name avatar");

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách đánh giá của khóa học
export const getReviewsByCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const sort = req.query.sort || "newest";

        let sortOption = { createdAt: -1 };
        if (sort === "helpful") sortOption = { "helpful.10": -1, createdAt: -1 };
        if (sort === "highest") sortOption = { rating: -1, createdAt: -1 };

        const reviews = await Review.find({ course: courseId })
        .populate("user", "name avatar")
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit);

        const total = await Review.countDocuments({ course: courseId });

        const reviewsWithHelpful = reviews.map(r => ({
        ...r.toObject(),
        helpfulCount: r.helpful.length,
        isHelpful: req.user ? r.helpful.includes(req.user._id) : false,
        }));

        res.json({
        reviews: reviewsWithHelpful,
        pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
        },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Vote Helpful
export const toggleHelpful = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: "Không tìm thấy đánh giá" });

        const userId = req.user._id;
        const index = review.helpful.indexOf(userId);

        if (index === -1) {
        review.helpful.push(userId);
        } else {
        review.helpful.splice(index, 1);
        }

        await review.save();
        res.json({ helpfulCount: review.helpful.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};