import express from "express";
import { authMiddleware, isInstructor } from "../middleware/authMiddleware.js"; // ĐÚNG
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";

const router = express.Router();

router.get("/courses", authMiddleware, isInstructor, async (req, res) => {
    try {
        const courses = await Course.find({ createdBy: req.user.id })
        .populate("lessons", "title order skillType isTest")
        .sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// TẠO KHÓA HỌC MỚI
router.post("/courses", authMiddleware, isInstructor, async (req, res) => {
    try {
        const { title, level, description } = req.body;
        const course = new Course({
        title,
        level: level || "beginner",
        description,
        createdBy: req.user.id,
        lessons: [],
        });
        await course.save();
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// CẬP NHẬT KHÓA HỌC
router.put("/courses/:id", authMiddleware, isInstructor, async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, createdBy: req.user.id });
        if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });

        Object.assign(course, req.body);
        await course.save();
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// TẠO BÀI HỌC MỚI
router.post("/courses/:courseId/lessons", authMiddleware, isInstructor, async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.courseId, createdBy: req.user.id });
        if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });

        const { title, content, mediaUrl, audioFile, skillType, isTest, testType, order } = req.body;

        const lesson = new Lesson({
        courseId: course._id,
        title,
        content,
        mediaUrl,
        audioFile,
        skillType,
        isTest: isTest || false,
        testType: testType || null,
        order: order || (await Lesson.countDocuments({ courseId: course._id })) + 1,
        exercises: [],
        quizzes: [],
        });

        await lesson.save();
        course.lessons.push(lesson._id);
        await course.save();

        const populatedLesson = await Lesson.findById(lesson._id);
        res.status(201).json(populatedLesson);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// CẬP NHẬT BÀI HỌC
router.put("/lessons/:id", authMiddleware, isInstructor, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ message: "Không tìm thấy bài học" });

        const course = await Course.findOne({ _id: lesson.courseId, createdBy: req.user.id });
        if (!course) return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa" });

        Object.assign(lesson, req.body);
        await lesson.save();
        res.json(lesson);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// XÓA BÀI HỌC
router.delete("/lessons/:id", authMiddleware, isInstructor, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) return res.status(404).json({ message: "Không tìm thấy bài học" });

        const course = await Course.findOne({ _id: lesson.courseId, createdBy: req.user.id });
        if (!course) return res.status(403).json({ message: "Bạn không có quyền xóa" });

        await Lesson.deleteOne({ _id: lesson._id });
        course.lessons.pull(lesson._id);
        await course.save();

        res.json({ message: "Xóa bài học thành công" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;