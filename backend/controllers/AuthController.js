import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import User from "../models/user.js";

// === CẤU HÌNH EMAIL ===
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// === HÀM GỬI EMAIL CHUNG ===
const sendEmail = async ({ to, subject, html }) => {
    try {
        await transporter.sendMail({
            from: `"English Learning App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
    } catch (err) {
        console.error("Gửi email thất bại:", err.message);
        throw new Error("Không thể gửi email");
    }
};

// === GỬI EMAIL XÁC THỰC ===
export const sendVerifyEmail = async (user) => {
    const verifyUrl = `${process.env.BASE_URL}/api/auth/verify/${user.verifyToken}`;
    const html = `
        <div style="font-family:sans-serif; line-height:1.6">
            <h2>Xin chào ${user.name},</h2>
            <p>Cảm ơn bạn đã đăng ký tại <b>English Learning App</b>.</p>
            <p>Nhấn vào link bên dưới để xác thực tài khoản:</p>
            <a href="${verifyUrl}" 
               style="background:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">
               Xác thực tài khoản
            </a>
            <p style="margin-top:15px;"><small>Hoặc sao chép link: <br><code>${verifyUrl}</code></small></p>
            <hr/>
            <small>Email này được gửi tự động, vui lòng không trả lời.</small>
        </div>
    `;

    await sendEmail({ to: user.email, subject: "Xác thực tài khoản của bạn", html });
};

// === ĐĂNG KÝ ===
export const register = async (req, res) => {
    console.log("body:", req.body);
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ msg: "Vui lòng nhập đầy đủ thông tin" });

        if (!/\S+@\S+\.\S+/.test(email))
            return res.status(400).json({ msg: "Email không hợp lệ" });

        if (password.length < 6)
            return res.status(400).json({ msg: "Mật khẩu phải ít nhất 6 ký tự" });

        const exist = await User.findOne({ email });
        if (exist) return res.status(400).json({ msg: "Email đã tồn tại" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const verifyToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            verifyToken,
            isVerified: false,
            role: role || "user",
        });

        await sendVerifyEmail(newUser);

        res.json({ msg: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực." });
    } catch (err) {
        console.error("Lỗi đăng ký:", err);
        res.status(500).json({ msg: "Lỗi server" });
    }
};

// === XÁC THỰC EMAIL ===
export const verifyEmail = async (req, res) => {
    const { token } = req.params;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email, verifyToken: token });
        if (!user) return res.status(400).json({ msg: "Token không hợp lệ" });

        user.isVerified = true;
        user.verifyToken = null;
        await user.save();

        res.json({ msg: "Xác thực email thành công! Bạn có thể đăng nhập." });
    } catch (err) {
        if (err.name === "TokenExpiredError")
            return res.status(400).json({ msg: "Token đã hết hạn, vui lòng đăng ký lại." });

        res.status(500).json({ msg: "Lỗi xác thực email" });
    }
};

// === ĐĂNG NHẬP ===
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Sai thông tin đăng nhập" });
        if (!user.isVerified)
            return res.status(401).json({ msg: "Email chưa xác thực" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Sai thông tin đăng nhập" });

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role || "user" },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "user",
            },
        });
    } catch (err) {
        console.error("Lỗi đăng nhập:", err);
        res.status(500).json({ msg: "Lỗi server" });
    }
};

// === QUÊN MẬT KHẨU ===
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "Email không tồn tại!" });

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const html = `
            <div style="font-family:sans-serif; line-height:1.6">
                <h2>Xin chào ${user.name},</h2>
                <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản <b>${email}</b>.</p>
                <p>Nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
                <a href="${resetUrl}" 
                   style="background:#1976d2;color:white;padding:12px 24px;text-decoration:none;border-radius:5px;display:inline-block;">
                   Đặt lại mật khẩu
                </a>
                <p style="margin-top:15px;"><small>Hoặc sao chép link: <br><code>${resetUrl}</code></small></p>
                <p><small>Link sẽ hết hạn sau <b>1 giờ</b>.</small></p>
                <hr/>
                <small>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</small>
            </div>
        `;

        await sendEmail({ to: user.email, subject: "Đặt lại mật khẩu", html });

        res.json({ msg: "Đã gửi link đặt lại mật khẩu đến email của bạn!" });
    } catch (err) {
        console.error("Lỗi quên mật khẩu:", err);
        res.status(500).json({ msg: "Lỗi server" });
    }
};

// === ĐẶT LẠI MẬT KHẨU ===
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        if (!password || password.length < 6)
            return res.status(400).json({ msg: "Mật khẩu phải ít nhất 6 ký tự!" });

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ msg: "Token không hợp lệ hoặc đã hết hạn!" });

        // Cập nhật mật khẩu
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        const html = `
            <div style="font-family:sans-serif; line-height:1.6">
                <h2>Xin chào ${user.name},</h2>
                <p>Mật khẩu của bạn đã được đặt lại thành công.</p>
                <p>Nếu bạn không thực hiện hành động này, vui lòng liên hệ hỗ trợ ngay lập tức.</p>
                <hr/>
                <small>Email này được gửi tự động.</small>
            </div>
        `;

        await sendEmail({ to: user.email, subject: "Mật khẩu đã được đặt lại", html });

        res.json({ msg: "Đặt lại mật khẩu thành công!" });
    } catch (err) {
        console.error("Lỗi reset mật khẩu:", err);
        res.status(500).json({ msg: "Lỗi server" });
    }
};