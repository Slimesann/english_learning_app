// backend/scripts/seedCourse.mjs
import mongoose from 'mongoose';
import Course from '../models/course.js';
import Lesson from '../models/lesson.js';

// === THAY ĐỔI 2 CHỖ NÀY ===
const DB_URL = "mongodb+srv://qn45006:I5vuc5b4PwDimsGe@my-language-app.qceavzu.mongodb.net/myLanguageApp?retryWrites=true&w=majority";

// ID CỦA ADMIN (bạn đang dùng để đăng nhập, lấy từ MongoDB Compass → collection users)
const ADMIN_ID = "68c8f8d8e8e8e8e8e8e8e8e8"; // THAY BẰNG ID THẬT CỦA BẠN!!!

    const LESSON_IDS = [ /* danh sách 20 ID như cũ */ 
    "68d2d67f035ce20d59cfef70","68fa797ddded14705b00299b","68fa7c0bdc4febc08cca3700",
    "68fa8631c28cc1e01edb5981","68fa9e6148965ade0bb9061b","68faf0a3cd6d22689d82778a",
    "68faf16ecd6d22689d8277d5","68faf295cd6d22689d827800","68fbd4c2321a889a6ae1272b",
    "68fbd505321a889a6ae12730","68fd21d9cdc8e8c5e7e7d755","68fd27df8021fdf5ae79c006",
    "68fd2de3e057f490ed10ab49","6900df90f85280bfc7828874","6900e112f85280bfc78288a6",
    "6900fcc1f6c2084d8315ced3","690187d024acd36abb75ce3f","6901887924acd36abb75ce5a",
    "6901888624acd36abb75ce67","69039e8f384a2b48d524df0e"
    ];

    const COURSES_TO_CREATE = [
    { title: "Everyday English Starter",      level: "beginner",         desc: "Dành cho người mới bắt đầu", lessons: LESSON_IDS.slice(0,6) },
    { title: "Environment & Society",         level: "intermediate",       desc: "Môi trường và xã hội",       lessons: ["68fa9e6148965ade0bb9061b","68fbd505321a889a6ae12730","68fd27df8021fdf5ae79c006","68fa797ddded14705b00299b","68fa7c0bdc4febc08cca3700"] },
    { title: "Life Skills English",           level: "beginner", desc: "Kỹ năng sống",               lessons: LESSON_IDS.slice(5,12) },
    { title: "Writing & Grammar Booster",     level: "intermediate",     desc: "Viết và ngữ pháp nâng cao",  lessons: ["68fd27df8021fdf5ae79c006","68fd2de3e057f490ed10ab49","6900df90f85280bfc7828874","6900e112f85280bfc78288a6","6900fcc1f6c2084d8315ced3"] },
    { title: "Advanced Topics Discussion",    level: "intermediate", desc: "Thảo luận nâng cao",       lessons: LESSON_IDS.slice(14,20) }
    ];

    async function seedCourses() {
    try {
        await mongoose.connect(DB_URL);
        console.log("Kết nối DB thành công!");

        const adminObjectId = new mongoose.Types.ObjectId(ADMIN_ID); // chuyển string → ObjectId

        for (const c of COURSES_TO_CREATE) {
        const course = await Course.create({
            title: c.title,
            level: c.level,
            description: c.desc,
            lessons: c.lessons.map(id => new mongoose.Types.ObjectId(id)),
            createdBy: "6919f95f3b5b32226c114cc3",   
            isPublished: true
        });

        await Lesson.updateMany(
            { _id: { $in: c.lessons.map(id => new mongoose.Types.ObjectId(id)) } },
            { courseId: course._id }
        );

        console.log(`ĐÃ TẠO: "${c.title}" – ${c.lessons.length} bài`);
        }

        console.log("\nHOÀN TẤT! 5 KHÓA HỌC ĐÃ ĐƯỢC TẠO THÀNH CÔNG!");
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("LỖI:", err.message);
        process.exit(1);
    }
}

seedCourses();