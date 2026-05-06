import express from "express";
import Quiz from "../models/Quiz.js";
import Lesson from "../models/lesson.js";
import Exercise from "../models/exercise.js";
import multer from "multer";
import * as XLSX from "xlsx";
import {
    authMiddleware,
    isAdmin,
} from "../middleware/authMiddleware.js";
import { checkCourseOwner } from "../middleware/checkCourseOwner.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Tạo quiz thủ công
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { lessonId, title, questions } = req.body;
        if (!lessonId || !Array.isArray(questions)) {
            return res.status(400).json({ error: "Missing lessonId or questions" });
        }

        const lesson = await Lesson.findById(lessonId);
        if (!lesson) return res.status(404).json({ error: "Lesson not found" });

        await checkCourseOwner("courseId")(
            { ...req, params: { courseId: lesson.courseId.toString() } },
            res,
            async () => {
                const quiz = await Quiz.create({
                    lessonId,
                    title: title || "Untitled Quiz",
                    questions,
                });

                await Lesson.findByIdAndUpdate(lessonId, {
                    $push: { quizzes: quiz._id },
                });

                res.status(201).json(quiz);
            }
        );
    } catch (err) {
        console.error("Quiz create error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Lấy tất cả quiz (Admin)
router.get("/", authMiddleware, isAdmin, async (req, res) => {
    try {
        const quizzes = await Quiz.find()
            .populate("lessonId", "title courseId")
            .lean();
        res.json(quizzes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy chi tiết quiz bằng quizId
router.get("/detail/:quizId", async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId).populate({
            path: "questions",
            model: "Exercise",
        });
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });
        res.json(quiz);
    } catch (err) {
        console.error("Lỗi lấy quiz:", err);
        res.status(500).json({ error: err.message });
    }
});

// Lấy danh sách quiz theo lessonId

router.get("/:lessonId", async (req, res) => {
    try {
        const quizzes = await Quiz.find({ lessonId: req.params.lessonId }).populate({
            path: "questions",
            model: "Exercise",
        });
        res.json(quizzes);
    } catch (err) {
        console.error("Lỗi lấy quiz list:", err);
        res.status(500).json({ error: err.message });
    }
});

// Upload Excel → Trả JSON
router.post(
    "/upload-excel",
    authMiddleware,
    upload.single("excel"),
    async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ error: "Missing Excel file" });

            const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
            const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

            const getAnswerFromRow = (row) => {
                return (
                    row.correctAnswer ||
                    row.Answer ||
                    row.answer ||
                    row["correct Answer"] ||
                    row["Correct Answer"] ||
                    row.correct_answer ||
                    ""
                ).trim();
            };

            const questions = sheet.map((row) => {
                const options = [row.A, row.B, row.C, row.D]
                    .filter(Boolean)
                    .map((o) => (typeof o === "string" ? o.trim() : o));
                const correctAnswer = getAnswerFromRow(row);

                const letterToIndex = (letter) => {
                    if (!letter || typeof letter !== "string") return -1;
                    const upperLetter = letter.trim().toUpperCase();
                    const idx = { A: 0, B: 1, C: 2, D: 3 }[upperLetter];
                    return typeof idx === "number" ? idx : -1;
                };

                let finalCorrectAnswer = correctAnswer;
                const idx = letterToIndex(correctAnswer);
                if (idx >= 0 && idx < options.length) {
                    finalCorrectAnswer = options[idx];
                } else if (!options.includes(correctAnswer) && correctAnswer) {
                    console.warn(`Cảnh báo: Giá trị correctAnswer "${correctAnswer}" không khớp với options cho câu hỏi "${row.Question}"`);
                }

                return {
                    type: "mcq",
                    question: row.Question || row.question || "",
                    options: options,
                    correctAnswer: finalCorrectAnswer || "",
                };
            });

            console.log("Dữ liệu câu hỏi từ Excel:", questions);

            res.json({ items: questions });
        } catch (err) {
            console.error("Excel upload error:", err);
            res.status(500).json({ error: err.message });
        }
    }
);

// Save quiz + Exercise vào DB
router.post("/save", authMiddleware, upload.none(), async (req, res) => {
    try {
        const { lessonId, title, questions } = req.body;

        console.log("Dữ liệu từ client:", req.body);

        if (!lessonId) {
            return res.status(400).json({ message: "Thiếu lessonId" });
        }

        let questionsArray;
        try {
            questionsArray = typeof questions === "string" ? JSON.parse(questions) : questions;
        } catch (err) {
            return res.status(400).json({ message: "questions phải là JSON hợp lệ" });
        }

        if (!Array.isArray(questionsArray)) {
            return res.status(400).json({ message: "questions phải là mảng" });
        }

        const formattedQuestions = questionsArray.map((q, index) => {
            const correct = q.correctAnswer || q.answer || q.correct_answer || null;

            if (!correct || correct === "") {
                console.warn(`Câu hỏi thứ ${index + 1} thiếu correctAnswer! - Câu hỏi: "${q.question}"`);
            }

            return {
                lessonId,
                type: q.type || "mcq",
                question: q.question || "",
                options: q.options || [],
                correctAnswer: correct,
            };
        });

        const missing = formattedQuestions
            .map((q, i) => ({ i, correctAnswer: q.correctAnswer, question: q.question }))
            .filter((x) => !x.correctAnswer || x.correctAnswer === "");

        if (missing.length > 0) {
            return res.status(400).json({
                message: "Có câu hỏi chưa có đáp án đúng (correctAnswer)",
                missing: missing.map((m) => ({
                    index: m.i + 1,
                    question: m.question || `Câu hỏi số ${m.i + 1}`,
                })),
            });
        }

        const savedExercises = await Exercise.insertMany(formattedQuestions);

        const quiz = await Quiz.create({
            lessonId,
            title: title || "Quiz",
            questions: savedExercises.map((ex) => ex._id),
        });

        await Lesson.findByIdAndUpdate(lessonId, {
            $push: { quizzes: quiz._id },
        });

        res.status(201).json({
            message: "Quiz lưu thành công!",
            quiz,
        });
    } catch (error) {
        console.error("Lỗi lưu quiz:", error);
        res.status(500).json({
            message: "Lỗi server khi lưu quiz",
            error: error.message,
        });
    }
});

// TẠO QUIZ BẰNG GEMINI 
router.post("/generate-ai", authMiddleware, async (req, res) => {
    try {
        const { lessonId, numQuestions = 10 } = req.body;

        if (!lessonId) {
            return res.status(400).json({ error: "Thiếu lessonId" });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY chưa được cấu hình trong .env");
            return res.status(500).json({ error: "Server chưa cấu hình AI key" });
        }

        const lesson = await Lesson.findById(lessonId).select("content title");
        if (!lesson) {
            return res.status(404).json({ error: "Không tìm thấy bài học" });
        }
        if (!lesson.content?.trim()) {
            return res.status(400).json({ error: "Bài học chưa có nội dung" });
        }

        const text = lesson.content.trim().length > 10000
            ? lesson.content.trim().substring(0, 10000)
            : lesson.content.trim();

        const prompt = `Tạo đúng ${numQuestions} câu hỏi trắc nghiệm tiếng Anh từ đoạn văn sau.

Đoạn văn:
"${text}"

Yêu cầu:
- Mỗi câu có đúng 4 đáp án A, B, C, D
- Chỉ 1 đáp án đúng
- Trả về đúng định dạng JSON, không thêm text thừa, không có markdown:

[
  {
    "question": "Câu hỏi ở đây?",
    "options": ["A. Đáp án 1", "B. Đáp án 2", "C. Đáp án 3", "D. Đáp án 4"],
    "correctAnswer": "B",
    "type": "mcq"
  }
]`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        console.log("Đang gọi Gemini tạo quiz...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let textResponse = response.text();

        textResponse = textResponse
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            return res.status(500).json({
                error: "Gemini không trả về JSON hợp lệ",
                raw: textResponse.substring(0, 300)
            });
        }

        let questions;
        try {
            questions = JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.error("Parse JSON lỗi:", e.message);
            return res.status(500).json({
                error: "JSON từ AI sai định dạng",
                raw: textResponse.substring(0, 500)
            });
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(500).json({ error: "Gemini không tạo được câu hỏi" });
        }

        const finalQuestions = questions.map(q => {
            const letter = (q.correctAnswer || "").toString().trim().toUpperCase();
            const idx = { A: 0, B: 1, C: 2, D: 3 }[letter];
            const correctText = (idx !== undefined && q.options?.[idx])
                ? q.options[idx]
                : q.correctAnswer || "";

            return {
                question: q.question?.trim() || "No question",
                options: q.options || [],
                correctAnswer: correctText,
                type: "mcq"
            };
        });

        res.json({
            message: `Đã tạo thành công ${finalQuestions.length} câu hỏi bằng AI!`,
            items: finalQuestions
        });

    } catch (err) {
        console.error("Lỗi generate quiz AI:", err.response?.data || err.message);
        res.status(500).json({
            error: "Không thể tạo quiz bằng AI",
            details: err.message
        });
    }
});

export default router;