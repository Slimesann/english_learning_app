import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendVerifyEmail = async (email, token) => {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${token}`;
    const html = `
        <h3>Xin chào,</h3>
        <p>Nhấn vào link để xác thực email:</p>
        <a href="${verifyUrl}" style="background:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
            Xác thực ngay
        </a>
        <p><small>Hoặc: ${verifyUrl}</small></p>
    `;

    await transporter.sendMail({
        from: `"English App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Xác thực tài khoản",
        html,
    });
};

export const sendResetPasswordEmail = async (email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    const html = `
        <h3>Đặt lại mật khẩu</h3>
        <p>Nhấn vào link để đặt lại mật khẩu (hết hạn sau 1 giờ):</p>
        <a href="${resetUrl}" style="background:#1976d2;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
            Đặt lại mật khẩu
        </a>
        <p><small>Hoặc: ${resetUrl}</small></p>
    `;

    await transporter.sendMail({
        from: `"English App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Yêu cầu đặt lại mật khẩu",
        html,
    });
};