import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Lesson from "../models/lesson.js";
import Course from "../models/course.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkCourseOwner } from "../middleware/checkCourseOwner.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/media/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, `media-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowed = /mp3|wav|mp4|webm|ogg/i;
        const ext = path.extname(file.originalname);
        if (allowed.test(ext)) cb(null, true);
        else cb(new Error("Chỉ hỗ trợ audio/video!"));
    }
});

// Create lesson
router.post("/", authMiddleware, checkCourseOwner("courseId"), async (req, res) => {
    try {
        const { title, courseId, skillType } = req.body;
        if (!title || !courseId || !skillType) {
            return res.status(400).json({ error: "Thiếu dữ liệu tạo bài học!" });
        }

        const lesson = await Lesson.create({ title, courseId, skillType });
        await Course.findByIdAndUpdate(courseId, { $push: { lessons: lesson._id } });

        res.status(201).json(lesson);
    } catch (err) {
        console.error("Lỗi tạo lesson:", err);
        res.status(400).json({ error: err.message });
    }
});

// Get all lesson
router.get("/", async (req, res) => {
    try {
        const lessons = await Lesson.find().populate({
            path: "quizzes",
            populate: { path: "questions" } 
        }).populate("exercises");  
        res.json(lessons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get lesson by ID
router.get("/:lessonId", async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.lessonId)
            .populate("exercises")
            .populate({
                path: "quizzes",
                populate: {
                    path: "questions",
                    model: "Exercise"
                }
            });

        if (!lesson) return res.status(404).json({ error: "Lesson không tồn tại!" });

        let lessonData = lesson.toObject();

        if (lesson.skillType === "writing" && (!lesson.content || lesson.content.trim() === "")) {
            if (lesson.exercises?.length > 0) {
                lessonData.content = lesson.exercises[0].question;
            }
        }

        res.json(lessonData);
    } catch (err) {
        console.error("Lỗi lấy lesson:", err);
        res.status(500).json({ error: err.message });
    }
});

// Get lesson by course ID
router.get("/course/:courseId", async (req, res) => {
    try {
        const lessons = await Lesson.find({ courseId: req.params.courseId }).sort({ createdAt: -1 });
        res.json(lessons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload media
router.post("/:lessonId/media",
    authMiddleware,
    upload.single("media"),
    async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ error: "Không có file!" });

            const lesson = await Lesson.findById(req.params.lessonId);
            if (!lesson) return res.status(404).json({ error: "Lesson không tồn tại!" });

            await checkCourseOwner("courseId")(
                { ...req, params: { courseId: lesson.courseId.toString() } },
                res,
                async () => {
                    const mediaUrl = `/uploads/media/${req.file.filename}`;
                    lesson.mediaUrl = mediaUrl;
                    await lesson.save();

                    res.json({ message: "Upload thành công!", mediaUrl, lesson });
                }
            );
        } catch (err) {
            console.error("Lỗi upload media:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

router.put("/:lessonId/media", authMiddleware, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { mediaUrl } = req.body;

        if (!mediaUrl) {
            return res.status(400).json({ error: "Thiếu mediaUrl" });
        }

        const lesson = await Lesson.findById(lessonId);
        if (!lesson) return res.status(404).json({ error: "Lesson không tồn tại" });

        await checkCourseOwner("courseId")(
            { ...req, params: { courseId: lesson.courseId.toString() } },
            res,
            async () => {
                lesson.mediaUrl = mediaUrl;
                await lesson.save();
                res.json({ message: "Cập nhật media thành công", mediaUrl, lesson });
            }
        );
    } catch (err) {
        console.error("Lỗi PUT media:", err);
        res.status(500).json({ error: err.message });
    }
});

// Cập nhật nội dung
router.put(
    "/:lessonId/content",
    authMiddleware,
    async (req, res, next) => {
        try {
            const lesson = await Lesson.findById(req.params.lessonId);
            if (!lesson) return res.status(404).json({ error: "Lesson không tồn tại" });

            await checkCourseOwner("courseId")(
                { ...req, params: { courseId: lesson.courseId.toString() } },
                res,
                next
            );
        } catch (err) {
            res.status(403).json({ error: "Không có quyền" });
        }
    },
    async (req, res) => {
        try {
            const { content, mediaUrl, title } = req.body;
            const updateData = { content };
            if (mediaUrl !== undefined) updateData.mediaUrl = mediaUrl;
            if (title !== undefined) updateData.title = title;

            const updatedLesson = await Lesson.findByIdAndUpdate(
                req.params.lessonId,
                updateData,
                { new: true }
            );

            res.json({ message: "Cập nhật thành công", lesson: updatedLesson });
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
            res.status(500).json({ error: error.message });
        }
    }
);

// Update lesson
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ error: "Lesson không tồn tại!" });

        await checkCourseOwner("courseId")(
            { ...req, params: { courseId: lesson.courseId.toString() } },
            res,
            async () => {
                const updated = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
                res.json(updated);
            }
        );
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete lesson
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ error: "Lesson không tồn tại!" });

        await checkCourseOwner("courseId")(
            { ...req, params: { courseId: lesson.courseId.toString() } },
            res,
            async () => {
                await Course.findByIdAndUpdate(lesson.courseId, { $pull: { lessons: lesson._id } });
                await lesson.deleteOne();
                res.json({ message: "Xóa lesson thành công!" });
            }
        );
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;