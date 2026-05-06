// backend/seedCourses.js
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import Course from "../models/course.js";
import { getQuizzesByCourse } from "../controllers/courseController.js";

dotenv.config();

const __dirname = path.resolve();

// Kết nối MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB connected");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}

async function seedCourses() {
    try {
        // Đọc file JSON
        const filePath = path.join(__dirname, "sample_courses.json");
        const data = fs.readFileSync(filePath, "utf-8");
        const courses = JSON.parse(data);

        // Xóa dữ liệu cũ
        await Course.deleteMany({});
        console.log("🗑️ Old courses deleted");

        // Insert dữ liệu mới
        await Course.insertMany(courses);
        console.log(`✅ ${courses.length} courses inserted successfully`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding courses:", error);
        process.exit(1);
    }
}

// Thực thi
(async () => {
    await connectDB();
    await seedCourses();
})();
