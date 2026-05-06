// backend/seed/seedQuiz.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/english_learning_app";

const seedQuiz = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Kết nối MongoDB thành công");

        // Lấy ra một course có sẵn để gắn quiz vào
        const course = await Course.findOne();
        if (!course) {
        console.log("⚠️ Chưa có course nào trong DB. Vui lòng seed course trước.");
        process.exit(0);
        }

        // Tạo các câu hỏi (Exercise)
        const ex1 = await Exercise.create({
        question: "What is 'Hello' in Vietnamese?",
        options: ["Xin chào", "Tạm biệt", "Cảm ơn"],
        correctAnswer: "Xin chào",
        });

        const ex2 = await Exercise.create({
        question: "What is 'Goodbye' in Vietnamese?",
        options: ["Xin chào", "Tạm biệt", "Chúc ngủ ngon"],
        correctAnswer: "Tạm biệt",
        });

        // Tạo lesson dạng quiz
        const quizLesson = await Lesson.create({
        title: "Lesson Quiz: Greetings",
        content: "Chọn câu trả lời đúng cho các câu hỏi sau:",
        isTest: true,
        exercises: [ex1._id, ex2._id],
        course: course._id,
        });

        console.log("✅ Đã tạo quiz lesson:", quizLesson);

        // Gắn lesson vào course
        course.lessons.push(quizLesson._id);
        await course.save();

        console.log("🎉 Đã gắn quiz lesson vào course:", course.title);

        process.exit(0);
    } catch (err) {
        console.error("❌ Lỗi khi seed quiz:", err);
        process.exit(1);
    }
};

seedQuiz();
