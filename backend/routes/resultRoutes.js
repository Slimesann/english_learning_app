import express from "express";
import Result from "../models/result.js";

const router = express.Router();

// Lưu kết quả (quiz hoặc writing)

router.post("/", async (req, res) => {
    try {
        const { userId, courseId, lessonId, type, score, correctAnswers, totalQuestions, scorePercent, writingText, feedback } = req.body;

        if (!userId || !lessonId || !type) {
        return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc." });
        }

        const result = new Result({
        userId,
        courseId,
        lessonId,
        type,
        score: score ?? null,
        correctAnswers: correctAnswers ?? null,
        totalQuestions: totalQuestions ?? null,
        scorePercent: scorePercent ?? null,
        writingText: writingText ?? "",
        feedback: feedback ?? "",
        });

        await result.save();
        res.status(201).json(result);
    } catch (error) {
        console.error("❌ Lỗi khi lưu kết quả:", error);
        res.status(500).json({ message: error.message });
    }
});

// Lấy toàn bộ kết quả của 1 user

router.get("/:userId", async (req, res) => {
    try {
        const results = await Result.find({ userId: req.params.userId })
        .populate("lessonId", "title")
        .sort({ createdAt: -1 });

        res.json(results);
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách kết quả:", error);
        res.status(500).json({ message: error.message });
    }
});

// Lấy kết quả của user trong 1 bài học

router.get("/:userId/:lessonId", async (req, res) => {
    try {
        const { userId, lessonId } = req.params;
        const results = await Result.find({ userId, lessonId });
        res.json(results);
    } catch (error) {
        console.error("❌ Lỗi khi lấy kết quả theo bài học:", error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
