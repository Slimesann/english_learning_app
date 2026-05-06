import mongoose from "mongoose";
import dotenv from "dotenv";
import Review from "../models/review.js";
import Course from "../models/course.js";
import User from "../models/user.js";

dotenv.config();

const fakeComments = [
    "Khóa học rất hay, thầy giảng dễ hiểu, bài tập thực tế!",
    "Mình tiến bộ rõ rệt sau 2 tuần học, recommend 5 sao!",
    "Phát âm chuẩn, có bài tập nghe nói rất sát với đề thi thật.",
    "Nội dung chi tiết, phù hợp người mất gốc như mình.",
    "Mong có thêm phần luyện nghe hội thoại dài hơn.",
    "Giá trị vượt mong đợi, đáng tiền!",
    "Bài tập hơi khó nhưng rất hiệu quả.",
    "Thầy trả lời tin nhắn nhanh, hỗ trợ nhiệt tình.",
    "Mình từ band 4.0 lên 6.0 chỉ sau 2 tháng nhờ khóa này.",
    "Giao diện đẹp, dễ học trên điện thoại.",
    "Có script + audio tải về được, rất tiện ôn lại.",
    "Phần từ vựng theo chủ đề cực kỳ hữu ích.",
    "Khóa học đáng giá nhất mình từng học!",
    "Bài kiểm tra sau mỗi lesson giúp mình củng cố kiến thức rất tốt.",
    "Cần thêm phần Writing feedback tự động.",
];

const fakeNames = [
    "Nguyễn Lan Anh",
    "Trần Minh Quân",
    "Phạm Thu Hà",
    "Lê Hoàng Nam",
    "Vũ Thị Mai",
    "Đỗ Anh Tuấn",
    "Hoàng Thị Ngọc",
    "Bùi Văn Đức",
    "Ngô Minh Thư",
    "Đinh Thị Hương",
];

// Thay ID khóa học bạn muốn seed ở đây
const TARGET_COURSE_ID = "6919f9ec3b5b32226c114d52";
const updateCourseRating = async (courseId) => {
    const stats = await Review.aggregate([
        { $match: { course: new mongoose.Types.ObjectId(courseId) } },
        {
        $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            count: { $sum: 1 },
        },
        },
    ]);

    const update = stats.length > 0
        ? {
            averageRating: Math.round(stats[0].avgRating * 10) / 10,
            ratingCount: stats[0].count,
        }
        : { averageRating: 0, ratingCount: 0 };

    await Course.findByIdAndUpdate(courseId, update);
};

async function seedReviews() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Đã kết nối MongoDB");

        // Lấy tất cả user trong DB (hoặc tạo fake user nếu chưa có)
        let users = await User.find().select("_id name");
        if (users.length < 10) {
        console.log("Chưa đủ user, tạo thêm fake user...");
        const fakeUsers = fakeNames.map(name => ({ name, email: `${name.split(" ").join(".")}@gmail.com`.toLowerCase(), password: "123456" }));
        users = await User.insertMany(fakeUsers);
        console.log(`Đã tạo ${users.length} user giả`);
        }

        const course = await Course.findById(TARGET_COURSE_ID);
        if (!course) {
        console.log("Không tìm thấy khóa học với ID:", TARGET_COURSE_ID);
        process.exit(1);
        }

        // Xóa review cũ của khóa này (nếu muốn seed lại)
        await Review.deleteMany({ course: TARGET_COURSE_ID });
        console.log("Đã xóa review cũ");

        const reviewsToInsert = [];
        const numberOfReviews = 67; // bạn muốn bao nhiêu thì đổi ở đây

        for (let i = 0; i < numberOfReviews; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomRating = Math.random() < 0.1 ? 3 : Math.random() < 0.15 ? 4 : 5; // 75% 5 sao, 15% 4 sao, 10% 3 sao
        const hasComment = Math.random() < 0.85; // 85% có comment

        reviewsToInsert.push({
            course: TARGET_COURSE_ID,
            user: randomUser._id,
            rating: randomRating,
            comment: hasComment ? fakeComments[Math.floor(Math.random() * fakeComments.length)] : "",
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000)), // random trong 60 ngày qua
            helpful: Array.from({ length: Math.floor(Math.random() * 40) }, () => 
            users[Math.floor(Math.random() * users.length)]._id
            ),
        });
        }

        await Review.insertMany(reviewsToInsert);
        console.log(`Đã tạo thành công ${reviewsToInsert.length} đánh giá!`);

        // Cập nhật lại averageRating cho khóa học
        const stats = await Review.aggregate([
        { $match: { course: new mongoose.Types.ObjectId(TARGET_COURSE_ID) } },
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
        ]);

        if (stats.length > 0) {
        await Course.findByIdAndUpdate(TARGET_COURSE_ID, {
            averageRating: Math.round(stats[0].avg * 10) / 10,
            ratingCount: stats[0].count,
        });
        console.log(`Cập nhật averageRating = ${stats[0].avg.toFixed(2)} ★ (${stats[0].count} đánh giá)`);
        }

        console.log("SEED REVIEW HOÀN TẤT! Bạn có thể vào trang chi tiết khóa học để xem ngay.");
        process.exit(0);
    } catch (error) {
        console.error("Lỗi khi seed review:", error);
        process.exit(1);
    }
}

seedReviews();