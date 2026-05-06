import express from "express";
import { authMiddleware, isAdmin, isInstructor } from "../middleware/authMiddleware.js";
import User from "../models/user.js";

const router = express.Router();

// Route lấy thông tin user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ msg: "User không tồn tại" });
        }
        res.json({ user });
    } catch (err) {
        console.error("Lỗi khi lấy user:", err.message);
        res.status(500).send("Server error");
    }
});

// Route test bảo vệ
router.get("/secret", authMiddleware, (req, res) => {
    res.json({
        msg: "Bạn đã truy cập route bảo vệ!",
        user: req.user,
    });
});

export default router;
