import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Result from "../models/result.js";

dotenv.config();
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/evaluate", async (req, res) => {
    try {
        const { userId, lessonId, courseId, topic, text } = req.body;

        console.log("📩 Request Body:", req.body);

        if (!userId || !lessonId || !courseId) {
            return res.status(400).json({ message: "Thiếu userId, lessonId hoặc courseId!" });
        }
        if (!text || text.trim() === "") {
            return res.status(400).json({ message: "Thiếu nội dung bài viết!" });
        }

        const prompt = `
        Bạn là giám khảo chấm IELTS Writing với điểm 9.0.
        Hãy chấm bài viết theo thang điểm 0-10.
        Viết feedback rõ ràng, có xuống dòng, đúng cấu trúc đoạn văn.
        Trả về JSON, KHÔNG markdown, không \`\`\`, không chữ thừa:
        {
            "score": <number>,
            "feedback": "<nội dung feedback có xuống dòng đầy đủ>"
        }
        Essay Topic: ${topic || "No topic"}
        Student Essay: ${text}
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const response = await model.generateContent(prompt);
        let aiText = response.response.text().trim();
        console.log("🤖 Raw AI Response:", aiText);

        aiText = aiText.replace(/```json|```/g, "").trim();

        let parsed = { score: 0, feedback: "AI không trả về JSON hợp lệ" };
        try {
            parsed = JSON.parse(aiText);
        } catch (err) {
            console.warn("⚠ Lỗi parse JSON:", err.message);
        }

        const formattedFeedback = parsed.feedback
            ? parsed.feedback.replace(/\n/g, "<br>")
            : "";

        const saved = await Result.create({
            userId,
            courseId,
            lessonId,
            type: "writing",
            score: parsed.score || 0,
            feedback: formattedFeedback,
            writingText: text,
            status: "completed"
        });

        return res.status(200).json({
            message: "✅ Chấm & lưu kết quả thành công!",
            result: saved
        });
    } catch (error) {
        console.error("❌ Server lỗi:", error);
        return res.status(500).json({ message: "Lỗi server khi chấm bài viết", error: error.message });
    }
});

export default router;
