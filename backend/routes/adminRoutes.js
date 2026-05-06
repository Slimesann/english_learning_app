import express from "express";
import User from "../models/user.js";
import Course from "../models/course.js";
import { authMiddleware, isAdmin, isInstructor } from "../middleware/authMiddleware.js";

const router = express.Router();

// Lấy danh sách user
router.get("/users", authMiddleware, isAdmin, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Lấy danh sách course
router.get("/courses", authMiddleware, isAdmin, async (req, res) => {
    try {
        const courses = await Course.find()
        .populate("createdBy", "name email")
        .populate("lessons", "title");
        res.json(courses);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Tạo course mới
router.post("/courses", authMiddleware, isAdmin, async (req, res) => {
    try {
        const { title, level, description, isPublished } = req.body;

        const newCourse = await Course.create({
        title,
        level,
        description,
        createdBy: req.user.id,
        isPublished: isPublished ?? true,
        });

        res.json({ msg: "Tạo khóa học thành công", course: newCourse });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Cập nhật course
router.put("/courses/:id", authMiddleware, isAdmin, async (req, res) => {
    try {
        const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        });
        res.json({ msg: "Cập nhật thành công", course: updated });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

// Xóa course
router.delete("/courses/:id", authMiddleware, isAdmin, async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ msg: "Xóa khóa học thành công" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

export default router;
