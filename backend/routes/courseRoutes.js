import express from "express";
import Course from "../models/course.js";
import User from "../models/user.js";
import { authMiddleware, isAdmin, isInstructor } from "../middleware/role.js";

const router = express.Router();

// Lấy toàn bộ khóa học(admin)
router.get("/all", async (req, res) => {
    try {
        const courses = await Course.find()
            .populate("createdBy", "name email role")
            .sort({ createdAt: -1 })
            .lean();
        res.json(courses);
    } catch (err) {
        console.error("Lỗi lấy danh sách khóa học (admin):", err);
        res.status(500).json({ error: "Lỗi server" });
    }
});

// Lấy danh sách khóa học công khai
router.get("/", async (req, res) => {
    try {
        const { search = "", limit = 10 } = req.query;

        let query = {
            isApproved: true,
            isPublished: true
        };

        if (search.trim()) {
            const regex = new RegExp(search.trim(), "i");
            query.title = regex;
        }

        const courses = await Course.find(query)
            .select("title description level lessons createdBy isApproved isPublished")
            .populate("createdBy", "name")
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .lean();

        res.json({ courses });
    } catch (err) {
        console.error("Lỗi tìm kiếm khóa học công khai:", err);
        res.status(500).json({ error: "Lỗi server" });
    }
});

// Lấy chi tiết khóa học(Admin/owner)
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate("createdBy", "name email")
            .populate("lessons");

        if (!course) return res.status(404).json({ error: "Không tìm thấy khóa học" });

        let ownerId = "unknown";
        if (course.createdBy && course.createdBy._id) {
            ownerId = course.createdBy._id.toString();
        } else {
            console.warn("Course has no createdBy:", course._id);
            course.createdBy = { _id: "unknown", name: "Unknown", email: "unknown@enapp.com" };
        }

        const isOwner = ownerId === req.user.id;
        const isAdminUser = req.user.role === "admin";

        if (!isAdminUser && !isOwner && (!course.isApproved || !course.isPublished)) {
            return res.status(403).json({ error: "Khóa học chưa được duyệt hoặc đang ẩn" });
        }

        res.json(course);
    } catch (err) {
        console.error("Lỗi lấy chi tiết khóa học:", err);
        res.status(500).json({ error: "Lỗi server" });
    }
});

// Enroll khóa học (user)
router.post("/:id/enroll", authMiddleware, async (req, res) => {
    try {
        const courseId = req.params.id;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ error: "Không tìm thấy khóa học" });

        if (!course.isApproved || !course.isPublished) {
            return res.status(403).json({ error: "Khóa học chưa được duyệt hoặc đang ẩn" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "Không tìm thấy người dùng" });

        const alreadyEnrolled = user.enrolledCourses.some(
            (e) => e.courseId.toString() === courseId
        );

        if (alreadyEnrolled) {
            return res.status(400).json({ msg: "Bạn đã thêm khóa học này rồi!" });
        }

        user.enrolledCourses.push({
            courseId,
            progress: 0,
            enrolledAt: new Date(),
            courseInfo: {
                title: course.title,
                description: course.description || "Chưa có mô tả",
                totalLessons: course.lessons.length
            }
        });

        await user.save();

        res.json({
            msg: "Đã thêm khóa học thành công!",
            enrolledCourse: {
                courseId,
                progress: 0,
                enrolledAt: new Date()
            }
        });
    } catch (err) {
        console.error("Lỗi enroll khóa học:", err);
        res.status(500).json({ error: "Lỗi server" });
    }
});

// Cập nhật progress
router.post("/:courseId/lessons/:lessonId/complete", authMiddleware, async (req, res) => {
    try {
        const { courseId, lessonId } = req.params;
        const user = req.user;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ error: "Khóa học không tồn tại" });

        const lessonIndex = course.lessons.findIndex(l => l._id.toString() === lessonId);
        if (lessonIndex === -1) return res.status(404).json({ error: "Bài học không tồn tại" });

        let enrolled = user.enrolledCourses.find(e => e.courseId.toString() === courseId);
        if (!enrolled) {
            enrolled = {
                courseId,
                progress: 0,
                enrolledAt: new Date(),
                courseInfo: {
                    title: course.title,
                    description: course.description || "Chưa có mô tả",
                    totalLessons: course.lessons.length
                }
            };
            user.enrolledCourses.push(enrolled);
        }

        if (enrolled.progress <= lessonIndex) {
            enrolled.progress = lessonIndex + 1;
        }

        await user.save();

        res.json({
            msg: "Cập nhật tiến độ thành công",
            progress: enrolled.progress,
            totalLessons: course.lessons.length
        });
    } catch (err) {
        console.error("Lỗi complete lesson:", err);
        res.status(500).json({ error: err.message });
    }
});

// Đánh giá khóa học
router.post("/:id/rate", authMiddleware, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const courseId = req.params.id;
        const userId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ error: "Không tìm thấy khóa học" });

        const user = await User.findById(userId);
        const enrolled = user.enrolledCourses.some(
            (e) => e.courseId.toString() === courseId
        );

        if (!enrolled) {
            return res.status(403).json({ error: "Bạn cần tham gia khóa học để đánh giá" });
        }

        const existingReview = course.ratings.find(
            (r) => r.user.toString() === userId
        );

        if (existingReview) {
            existingReview.rating = rating;
            existingReview.comment = comment;
        } else {
            course.ratings.push({ user: userId, rating, comment });
        }

        const total = course.ratings.length;
        const sum = course.ratings.reduce((a, r) => a + r.rating, 0);
        course.averageRating = sum / total;
        course.ratingCount = total;

        await course.save();

        res.json({
            msg: "Đánh giá thành công!",
            averageRating: course.averageRating,
            ratingCount: total,
            ratings: course.ratings
        });
    } catch (err) {
        console.error("Lỗi đánh giá:", err);
        res.status(500).json({ error: "Lỗi server" });
    }
});

// Tạo khóa học(instructor/admin)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { title, level, description, isPublished = false } = req.body;

        const isAdminUser = req.user.role === "admin";

        const course = await Course.create({
            title,
            level,
            description,
            createdBy: req.user.id,
            isApproved: isAdminUser ? true : false,
            isPublished: isAdminUser ? true : isPublished
        });

        res.status(201).json(course);
    } catch (err) {
        console.error("Lỗi tạo khóa học:", err);
        res.status(400).json({ error: err.message });
    }
});

// Cập nhật khóa học
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: "Không tìm thấy khóa học" });

        let ownerId = "unknown";
        if (course.createdBy && course.createdBy._id) {
            ownerId = course.createdBy._id.toString();
        }

        const isOwner = ownerId === req.user.id;
        const isAdminUser = req.user.role === "admin";

        if (!isAdminUser && !isOwner) {
            return res.status(403).json({ msg: "Bạn không có quyền sửa khóa học này" });
        }

        const allowedFields = isAdminUser
            ? req.body
            : (({ title, level, description, lessons }) => ({ title, level, description, lessons }))(req.body);

        const updated = await Course.findByIdAndUpdate(
            req.params.id,
            allowedFields,
            { new: true }
        ).populate("createdBy", "name email");

        res.json(updated);
    } catch (err) {
        console.error("Lỗi cập nhật khóa học:", err);
        res.status(400).json({ error: err.message });
    }
});

// Xóa khóa học
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: "Không tìm thấy khóa học" });

        let ownerId = "unknown";
        if (course.createdBy && course.createdBy._id) {
            ownerId = course.createdBy._id.toString();
        }

        const isOwner = ownerId === req.user.id;
        const isAdminUser = req.user.role === "admin";

        if (!isAdminUser && !isOwner) {
            return res.status(403).json({ msg: "Bạn không có quyền xóa khóa học này" });
        }

        await Course.deleteOne({ _id: req.params.id });
        res.json({ msg: "Xóa khóa học thành công" });
    } catch (err) {
        console.error("Lỗi xóa khóa học:", err);
        res.status(500).json({ error: err.message });
    }
});

// Duyệt (admin)
router.patch("/:id/toggle-approve", authMiddleware, isAdmin, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: "Không tìm thấy khóa học" });

        course.isApproved = !course.isApproved;

        if (course.isApproved) {
            course.isPublished = true;
        }

        await course.save();

        res.json({
            msg: course.isApproved ? "Đã duyệt và hiển thị khóa học" : "Đã bỏ duyệt",
            course: {
                _id: course._id,
                isApproved: course.isApproved,
                isPublished: course.isPublished
            }
        });
    } catch (err) {
        console.error("Lỗi duyệt khóa học:", err);
        res.status(500).json({ error: "Lỗi server" });
    }
});

// Ẩn khóa học(admin)
router.patch("/:id/toggle-publish", authMiddleware, isAdmin, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: "Không tìm thấy khóa học" });

        if (!course.isApproved && req.body.isPublished) {
            return res.status(400).json({ error: "Khóa học phải được duyệt trước khi hiển thị!" });
        }

        course.isPublished = !course.isPublished;
        await course.save();

        res.json({
            msg: course.isPublished ? "Đã hiển thị khóa học" : "Đã ẩn khóa học",
            isPublished: course.isPublished
        });
    } catch (err) {
        console.error("Lỗi toggle publish:", err);
        res.status(500).json({ error: "Lỗi server" });
    }
});

export default router;