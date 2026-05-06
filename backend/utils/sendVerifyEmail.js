import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Debug ENV
console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
console.log("📧 EMAIL_PASS:", process.env.EMAIL_PASS);

// Khởi tạo transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, // dùng SSL
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify ngay khi khởi tạo
transporter.verify((err, success) => {
    if (err) {
        console.error("❌ SMTP connection failed:", err);
    } else {
        console.log("✅ SMTP server is ready:", success);
    }
});

// Hàm gửi email xác thực
export const sendVerifyEmail = async (to, token) => {
    try {
        // Link trỏ về BACKEND để xử lý trước rồi mới redirect về FRONTEND
        const verifyUrl = `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/verify/${token}`;

        const info = await transporter.sendMail({
            from: `"English App" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Xác thực email",
            html: `
                <h2>Xác thực Email</h2>
                <p>Nhấn vào link bên dưới để xác thực tài khoản của bạn:</p>
                <a href="${verifyUrl}">${verifyUrl}</a>
            `,
        });

        console.log("✅ Verify email sent:", info.messageId);
        return info;
    } catch (err) {
        console.error("❌ Error sending verify email:", err);
        throw err;
    }
};

// Hàm gửi email reset mật khẩu
export const sendResetPasswordEmail = async (to, token) => {
    try {
        // Với reset password thì có thể cho frontend xử lý trực tiếp
        const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${token}`;

        const info = await transporter.sendMail({
            from: `"English App" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Reset mật khẩu",
            html: `
                <h2>Reset mật khẩu</h2>
                <p>Nhấn vào link bên dưới để đổi mật khẩu:</p>
                <a href="${resetUrl}">${resetUrl}</a>
            `,
        });

        console.log("✅ Reset password email sent:", info.messageId);
        return info;
    } catch (err) {
        console.error("❌ Error sending reset password email:", err);
        throw err;
    }
};
