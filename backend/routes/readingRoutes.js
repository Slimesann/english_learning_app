import express from "express";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import Exercise from "../models/exercise.js";
import { authMiddleware, isInstructor } from "../middleware/authMiddleware.js";
import { generateText } from "../services/geminiService.js";

const router = express.Router();

// Generate AI quiz (use quizRoutes/generate-ai too)
router.post("/generate-quiz", async (req, res) => {
    try {
        const { text, numQuestions = 5 } = req.body;
        if (!text) return res.status(400).json({ error: "text required" });
        const prompt = `Generate ${numQuestions} MCQs from text: "${text}". Return JSON array.`;
        const result = await generateText(prompt);
        const parsed = JSON.parse(result);
        res.json({ items: parsed });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Create reading lesson (manual or with provided quizzes)
router.post("/", authMiddleware, isInstructor, async (req, res) => {
    try {
        const { courseId, title, content, quizzes = [] } = req.body;
        if (!courseId || !title) return res.status(400).json({ error: "courseId and title required" });

        const lesson = await Lesson.create({
        courseId,
        title,
        content,
        skills: ["reading"],
        });

        // create Exercise documents for quizzes
        const exerciseDocs = [];
        for (const q of quizzes) {
        const ex = await Exercise.create({
            type: "reading",
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
        });
        exerciseDocs.push(ex._id);
        }

        lesson.quizzes = exerciseDocs;
        await lesson.save();

        // attach to course
        await Course.findByIdAndUpdate(courseId, { $push: { lessons: lesson._id } });

        res.json({ lesson });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
