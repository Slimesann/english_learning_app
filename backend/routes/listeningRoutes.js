import express from "express";
import { uploadSingle } from "../utils/multerConfig.js";
import fs from "fs";
import path from "path";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import Exercise from "../models/exercise.js";
import { generateFromAudio, generateText } from "../services/geminiService.js";
import { authMiddleware, isInstructor } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate-quiz-from-audio", uploadSingle("audio"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "File required" });
        const audioPath = path.resolve(req.file.path);

        const task = "Transcribe the audio and then generate 5 multiple choice listening comprehension questions in strict JSON array format";
        const textOut = await generateFromAudio(audioPath, task);

        let parsed;
        try {
        parsed = JSON.parse(textOut);
        } catch {
        const match = textOut.match(/\[.*\]/s);
        parsed = match ? JSON.parse(match[0]) : null;
        }

        fs.unlinkSync(audioPath);
        if (!parsed) return res.status(500).json({ error: "Unparseable AI output", raw: textOut });
        res.json({ items: parsed });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Create listening lesson
router.post("/", authMiddleware, isInstructor, async (req, res) => {
    try {
        const { courseId, title, mediaUrl, quizzes = [] } = req.body;
        if (!courseId || !title) return res.status(400).json({ error: "courseId and title required" });

        const lesson = await Lesson.create({
        courseId,
        title,
        content: "",
        skills: ["listening"],
        mediaUrl,
        });

        const exerciseIds = [];
        for (const q of quizzes) {
        const ex = await Exercise.create({
            type: "listening",
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
        });
        exerciseIds.push(ex._id);
        }
        lesson.quizzes = exerciseIds;
        await lesson.save();

        await Course.findByIdAndUpdate(courseId, { $push: { lessons: lesson._id } });
        res.json({ lesson });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
