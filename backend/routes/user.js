import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import User from "../models/user.js";
import QuizResult from "../models/result.js";
import Progress from "../models/progress.js";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "..", "public", "avatars");
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${req.user._id}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const valid = allowed.test(path.extname(file.originalname).toLowerCase()) && 
                    allowed.test(file.mimetype);
        cb(null, valid);
    }
});

// me
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -__v").lean();
        if (!user) return res.status(404).json({ message: "Không tìm thấy" });
        res.json(user);
    } catch (err) {
        console.error("Lỗi /me:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// quiz history
router.get("/me/quizzes", authMiddleware, async (req, res) => {
    try {
        const results = await QuizResult.find({ userId: req.user._id })
            .select("quizId quizTitle score correctCount total passed createdAt")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const total = results.length;
        const passed = results.filter(r => r.passed).length;
        const avg = total > 0 ? (results.reduce((a, r) => a + (r.score || 0), 0) / total).toFixed(1) : 0;

        res.json({
            stats: { totalQuizzes: total, passedQuizzes: passed, avgScore: avg },
            history: results
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// progress
router.get("/me/progress", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const completed = await Progress.find({ userId, completed: true }).select("lessonId").lean();
        const completedSet = new Set(completed.map(p => p.lessonId.toString()));

        const courses = await Course.aggregate([
            { $lookup: { from: "lessons", localField: "_id", foreignField: "courseId", as: "lessons" } },
            {
                $project: {
                    _id: 1, title: 1,
                    totalLessons: { $size: "$lessons" },
                    completedLessons: {
                        $size: {
                            $filter: {
                                input: "$lessons",
                                cond: { $in: ["$$this._id", Array.from(completedSet)] }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    percent: {
                        $round: [
                            { $multiply: [{ $divide: ["$completedLessons", { $max: ["$totalLessons", 1] }] }, 100] },
                            0
                        ]
                    }
                }
            },
            { $sort: { title: 1 } }
        ]);

        res.json(courses);
    } catch (err) {
        console.error("Lỗi progress:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// Lấy danh sách user(admin)
router.get("/", authMiddleware, isAdmin, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(10, parseInt(req.query.limit) || 50));
        const skip = (page - 1) * limit;
        const search = req.query.search?.trim();

        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select("name email role avatar createdAt")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments(query)
        ]);

        res.json({
            users,
            total,
            page,
            pages: Math.ceil(total / limit),
            hasMore: page * limit < total
        });
    } catch (err) {
        console.error("Lỗi lấy users:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// Xóa user
router.delete("/users/:id", authMiddleware, isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: "Xóa thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// Upload avatar
router.post("/set-avatar", authMiddleware, upload.single("avatar"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Không có file" });
        const avatarUrl = `/avatars/${req.file.filename}`;
        await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });
        res.json({ avatar: avatarUrl });
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

export default router;