import Question from "../models/question.js";

// Tạo câu hỏi
export const createQuestion = async (req, res) => {
    try {
        const { content, lessonId, courseId } = req.body;
        const question = await Question.create({
            content,
            author: req.user._id,
            lesson: lessonId || null,
            course: courseId || null
        });

        await question.populate("author", "name avatar");
        res.status(201).json(question);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lấy danh sách + phân trang + tìm kiếm
export const getQuestions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const search = req.query.search?.trim() || "";
        const sortBy = req.query.sortBy || "newest"; 

        let query = {};
        if (search) {
            query.content = { $regex: search, $options: "i" };
        }

        // XÁC ĐỊNH THỨ TỰ SẮP XẾP
        let sortOption = {};
        switch (sortBy) {
            case "oldest":
                sortOption = { createdAt: 1 };
                break;
            case "mostLiked":
                sortOption = { likesCount: -1, createdAt: -1 };
                break;
            case "mostReplied":
                sortOption = { repliesCount: -1, createdAt: -1 };
                break;
            case "newest":
            default:
                sortOption = { createdAt: -1 };
                break;
        }

        const questions = await Question.aggregate([
            { $match: query },
            {
                $addFields: {
                    likesCount: { $size: { $ifNull: ["$likes", []] } },
                    repliesCount: { $size: { $ifNull: ["$replies", []] } }
                }
            },
            { $sort: sortOption },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "author.password": 0,
                    "author.email": 0
                }
            }
        ]);

        const total = await Question.countDocuments(query);

        res.json({
            questions,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (err) {
        console.error("Lỗi getQuestions:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Like câu hỏi
export const likeQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: "Không tìm thấy câu hỏi" });

        const index = question.likes.includes(req.user._id);
        if (index) {
            question.likes = question.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            question.likes.push(req.user._id);
        }
        await question.save();
        await question.populate("author", "name avatar");

        res.json(question);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Trả lời câu hỏi
export const replyQuestion = async (req, res) => {
    try {
        const { content } = req.body;
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ message: "Không tìm thấy" });

        question.replies.push({
            content,
            author: req.user._id
        });

        await question.save();
        await question.populate("replies.author", "name avatar");

        res.json(question);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Like reply
export const likeReply = async (req, res) => {
    try {
        const { replyId } = req.params;
        const question = await Question.findOne({ "replies._id": replyId });
        const reply = question.replies.id(replyId);

        const index = reply.likes.includes(req.user._id);
        if (index) {
            reply.likes = reply.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            reply.likes.push(req.user._id);
        }

        await question.save();
        await question.populate("replies.author", "name avatar");

        res.json(question);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

