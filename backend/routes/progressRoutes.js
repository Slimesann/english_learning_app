import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Progress from "../models/progress.js";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import User from "../models/user.js";
const router = express.Router();

// Cập nhật tiến độ bài học
router.post("/lesson/:lessonId", authMiddleware, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const { score } = req.body;
        const userId = req.user.id;

        let progress = await Progress.findOne({ userId, lessonId });

        const isPassed = score >= 80; 

        if (!progress) {
            progress = new Progress({
                userId,
                lessonId,
                completed: isPassed,
                score: score ?? 0,
            });
        } else {
            if (typeof score === "number" && score > (progress.score || 0)) {
                progress.score = score;
                progress.completed = score >= 80;
            }
        }

        await progress.save();

        const lesson = await Lesson.findById(lessonId);
        if (lesson && lesson.courseId) {
            const user = await User.findById(userId);
            const enrolled = user.enrolledCourses.find(e => e.courseId.toString() === lesson.courseId.toString());
            if (enrolled) {
                const courseLessons = await Lesson.find({ courseId: lesson.courseId }).select("_id");
                const courseProgresses = await Progress.find({
                    userId,
                    lessonId: { $in: courseLessons.map(l => l._id) },
                    completed: true 
                });
                enrolled.progress = courseProgresses.length; 
                await user.save();
            }
        }

        res.json({
            msg: "Cập nhật tiến độ thành công",
            progress,
        });
    } catch (err) {
        console.error("Lỗi khi cập nhật tiến độ:", err);
        res.status(500).json({ msg: "Lỗi server", error: err.message });
    }
});

// Lấy tiến độ 1 bài 
router.get("/lesson/:lessonId", authMiddleware, async (req, res) => {
    try {
        const { lessonId } = req.params;
        const userId = req.user.id;

        const progress = await Progress.findOne({ userId, lessonId });

        if (!progress) {
            return res.json({
                userId,
                lessonId,
                completed: false,
                score: 0,
                msg: "Chưa có tiến độ",
            });
        }

        res.json(progress);
    } catch (err) {
        console.error("Lỗi khi lấy tiến độ:", err);
        res.status(500).json({ msg: "Lỗi server", error: err.message });
    }
});

// Tiến độ theo course
router.get("/course/:courseId", authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const lessons = await Lesson.find({ courseId }).select("_id title order");
        if (!lessons.length) {
            return res.status(404).json({ msg: "Course không có bài học" });
        }

        const progresses = await Progress.find({
            userId,
            lessonId: { $in: lessons.map(l => l._id) }
        });

        const progressMap = {};
        progresses.forEach(p => {
            progressMap[p.lessonId.toString()] = p;
        });

        const lessonsWithProgress = lessons.map(lesson => {
            const prog = progressMap[lesson._id.toString()];
            return {
                lessonId: lesson._id,
                title: lesson.title,
                order: lesson.order,
                completed: prog ? prog.completed : false,
                score: prog ? prog.score : 0,
            };
        });

        const totalLessons = lessons.length;
        const completedLessons = lessonsWithProgress.filter(l => l.completed).length;
        const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        res.json({
            courseId,
            stats: { totalLessons, completedLessons, progressPercent },
            lessons: lessonsWithProgress,
        });
    } catch (err) {
        console.error("Lỗi khi lấy tiến độ course:", err);
        res.status(500).json({ msg: "Lỗi server", error: err.message });
    }
});

// Tiến độ tất cả course
router.get("/my-courses", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const courses = await Course.find().select("_id title description");

        if (!courses.length) {
            return res.json({ msg: "Chưa có khóa học nào" });
        }

        const courseProgress = [];

        for (const course of courses) {
            const lessons = await Lesson.find({ courseId: course._id }).select("_id");
            const totalLessons = lessons.length;

            if (totalLessons === 0) {
                courseProgress.push({
                    courseId: course._id,
                    title: course.title,
                    description: course.description,
                    stats: { totalLessons: 0, completedLessons: 0, progressPercent: 0 }
                });
                continue;
            }

            const progresses = await Progress.find({
                userId,
                lessonId: { $in: lessons.map(l => l._id) }
            });

            const completedLessons = progresses.filter(p => p.completed).length;
            const progressPercent = Math.round((completedLessons / totalLessons) * 100);

            courseProgress.push({
                courseId: course._id,
                title: course.title,
                description: course.description,
                stats: { totalLessons, completedLessons, progressPercent }
            });
        }

        res.json({ courses: courseProgress });
    } catch (err) {
        console.error("Lỗi khi lấy tiến độ tất cả courses:", err);
        res.status(500).json({ msg: "Lỗi server", error: err.message });
    }
});

export default router;