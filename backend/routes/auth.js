import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendVerifyEmail, sendResetPasswordEmail } from "../utils/sendVerifyEmail.js";
import { authMiddleware } from "../middleware/role.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Thiếu dữ liệu" });
        }

        const existUser = await User.findOne({ email });
        if (existUser) return res.status(400).json({ message: "Email đã tồn tại" });

        const verifyToken = crypto.randomBytes(32).toString("hex");

        const user = new User({
            name,
            email,
            password, 
            role: role || "user",
            verifyToken,
            isVerified: false,
        });

        await user.save();
        await sendVerifyEmail(email, verifyToken);

        res.json({ message: "Đăng ký thành công, vui lòng kiểm tra email để xác thực." });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Verify email
router.get("/verify/:token", async (req, res) => {
    try {
        const user = await User.findOne({ verifyToken: req.params.token });
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/verify-fail`);
        }

        user.isVerified = true;
        user.verifyToken = null;
        await user.save();

        return res.redirect(`${process.env.FRONTEND_URL}/verify-success`);
    } catch (err) {
        console.error("Verify error:", err);
        return res.redirect(`${process.env.FRONTEND_URL}/verify-fail`);
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Email chưa đăng ký" });
        if (!user.isVerified) return res.status(400).json({ message: "Email chưa được xác thực" });

        const isMatch = await user.comparePassword(password); // Đảm bảo method này tồn tại
        if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Email chưa đăng ký" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        console.log("Raw token:", resetToken);

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000;

        await user.save();
        console.log("User sau save:", user);

        await sendResetPasswordEmail(email, resetToken);
        console.log("Email sent sent!");

        res.json({ message: "Vui lòng kiểm tra email để reset mật khẩu." });
    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Reset password
router.post("/reset-password/:token", async (req, res) => {
    const { password } = req.body;
    try {
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải ít nhất 6 ký tự" });
        }

        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpire: null,
                },
            }
        );

        console.log("Mật khẩu đã được hash 1 lần và lưu:", hashedPassword);

        res.json({ message: "Mật khẩu đã được cập nhật thành công." });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Change password
router.put("/change-password", authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Thiếu mật khẩu hiện tại hoặc mới" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Mật khẩu mới phải ít nhất 6 ký tự" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
        );

        res.json({ message: "Đổi mật khẩu thành công!" });
    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({ message: "Lỗi server", error: err.message });
    }
});

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password -verifyToken -resetPasswordToken -resetPasswordExpire")
            .populate({
                path: "enrolledCourses.courseId",
                select: "title description",
                populate: {
                    path: "lessons",
                }
            });

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        res.json({ user });
    } catch (err) {
        console.error("Lỗi /auth/me:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

export default router;