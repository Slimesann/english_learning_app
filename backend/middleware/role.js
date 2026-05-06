import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Middleware xác thực JWT
export const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Không có token, vui lòng đăng nhập" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
            return res.status(404).json({ message: "User không tồn tại" });
        }
        next();
    } catch (err) {
        console.error("❌ Lỗi xác thực:", err);
        res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
};

// Middleware kiểm tra quyền Instructor
export const isInstructor = (req, res, next) => {
    if (req.user.role === "instructor" || req.user.role === "admin") {
        return next();
    }
    return res.status(403).json({ message: "Chỉ giảng viên hoặc admin mới được phép" });
};

// Middleware kiểm tra quyền Admin
export const isAdmin = (req, res, next) => {
    if (req.user.role === "admin") {
        return next();
    }
    return res.status(403).json({ message: "Chỉ admin mới được phép" });
};
