import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../models/course.js"; 

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/english_learning";

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ Connected to MongoDB");

        await Course.deleteMany({});

        // Tạo course mới
        const newCourse = new Course({
        title: "Basic English Course",
        level: "easy",
        description: "Khóa học cơ bản cho người mới bắt đầu",
        createdBy: null, 
        isPublished: true,
        lessons: [
            {
            title: "Lesson 1: Greetings",
            content: "Học cách chào hỏi cơ bản trong tiếng Anh.",
            skills: ["speaking", "listening"],
            order: 1,
            isTest: false,
            exercises: [
                {
                type: "listening",
                question: "Nghe đoạn hội thoại và chọn câu trả lời đúng: 'Hello, how are you?'",
                options: ["I'm fine, thank you", "Goodbye", "See you tomorrow"],
                answer: "I'm fine, thank you",
                },
                {
                type: "speaking",
                question: "Nói câu chào hỏi buổi sáng bằng tiếng Anh",
                answer: "Good morning",
                }
            ]
            },
            {
            title: "Lesson 2: Mini Test - Greetings",
            content: "Bài kiểm tra nhỏ sau khi học chào hỏi.",
            skills: ["listening", "reading"],
            order: 2,
            isTest: true,
            testType: "mini",
            passScore: 60,
            quiz: {
                title: "Quiz 1: Greetings",
                duration: 10, // phút
                attemptsAllowed: 2,
                questions: [
                {
                    type: "reading",
                    question: "Câu nào là lời chào bằng tiếng Anh?",
                    options: ["Good morning", "Thank you", "See you later"],
                    answer: "Good morning",
                },
                {
                    type: "listening",
                    question: "Nghe và chọn câu trả lời đúng cho 'How are you?'",
                    options: ["I'm fine, thank you", "Good night", "Goodbye"],
                    answer: "I'm fine, thank you",
                }
                ]
            }
            }
        ]
        });

        await newCourse.save();

        console.log("✅ Seeded course with lessons and quiz successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding data:", err);
        process.exit(1);
    }
};

seed();
