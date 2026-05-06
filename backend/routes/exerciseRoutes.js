import express from "express";
import Exercise from "../models/exercise.js";
import Lesson from "../models/lesson.js";  
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkCourseOwner } from "../middleware/checkCourseOwner.js";

const router = express.Router();

// Tạo bài 
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { lessonId, type, question, options, correctAnswer } = req.body;  // ← THÊM: Destructure
        if (!lessonId) return res.status(400).json({ error: "Thiếu lessonId" });

        const lesson = await Lesson.findById(lessonId);
        if (!lesson) return res.status(404).json({ error: "Lesson not found" });

        await checkCourseOwner("courseId")(
            { ...req, params: { courseId: lesson.courseId.toString() } },
            res,
            async () => {
                const exercise = await Exercise.create({ 
                    lessonId, 
                    type, 
                    question, 
                    options: options || [], 
                    correctAnswer 
                });
                res.status(201).json(exercise);
            }
        );
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//  Update Exercise
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id).populate("lessonId", "courseId");  // ← SỬA: Populate lessonId.courseId
        if (!exercise) return res.status(404).json({ error: "Exercise not found" });

        await checkCourseOwner("courseId")(
            { ...req, params: { courseId: exercise.lessonId.courseId.toString() } },
            res,
            async () => {
                const updated = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
                res.json(updated);
            }
        );
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//  Delete Exercise
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id).populate("lessonId", "courseId");  // ← SỬA: Populate để check owner
        if (!exercise) return res.status(404).json({ error: "Exercise not found" });

        await checkCourseOwner("courseId")(
            { ...req, params: { courseId: exercise.lessonId.courseId.toString() } },
            res,
            async () => {
                await exercise.deleteOne();
                res.json({ message: "Exercise deleted" });
            }
        );
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  Get Exercises by Lesson 
router.get("/lesson/:lessonId", async (req, res) => {
    try {
        const filter = { lessonId: req.params.lessonId };  
        if (req.query.type) filter.type = req.query.type;
        const exercises = await Exercise.find(filter).populate("lessonId", "title");  
        res.json(exercises);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;