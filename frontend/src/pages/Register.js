import React, { useState } from "react";
import axios from "axios";
import { isValidEmail, isStrongPassword } from "../utils/validation";
import { useNavigate, Link } from "react-router-dom";

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student"
    });
    const [error, setError] = useState({});
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError({ ...error, [e.target.name]: "" });
        setMsg("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let newError = {};

        if (!form.name.trim()) newError.name = "Vui lòng nhập họ tên";
        if (!isValidEmail(form.email)) newError.email = "Email không hợp lệ";
        if (!isStrongPassword(form.password))
            newError.password = "Mật khẩu phải ≥ 8 ký tự, có chữ hoa, số và ký tự đặc biệt";
        if (form.password !== form.confirmPassword)
            newError.confirmPassword = "Mật khẩu xác nhận không khớp";

        if (Object.keys(newError).length > 0) {
            setError(newError);
            return;
        }

        try {
            setLoading(true);
            const res = await API.post("/auth/register", {
                name: form.name.trim(),
                email: form.email.toLowerCase().trim(),
                password: form.password,
                role: form.role,
            });

            setMsg("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            const errMsg = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!";
            setMsg(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "50vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            fontFamily: "'Segoe UI', system-ui, sans-serif"
        }}>
            <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(12px)",
                borderRadius: "24px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                width: "100%",
                maxWidth: "460px",
                padding: "48px 40px",
                border: "1px solid rgba(255,255,255,0.3)",
                position: "relative",
                overflow: "hidden"
            }}>
                {/* Decorative wave */}
                <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0,
                    height: "6px",
                    background: "linear-gradient(90deg, #667eea, #764ba2)",
                    borderRadius: "24px 24px 0 0"
                }}></div>

                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h1 style={{
                        fontSize: "32px",
                        fontWeight: "800",
                        background: "linear-gradient(90deg, #667eea, #764ba2)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        margin: "0 0 8px"
                    }}>
                        Tạo tài khoản miễn phí
                    </h1>
                </div>

                <form onSubmit={handleSubmit} style={{ spaceY: "20px" }}>
                    {/* Vai trò */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={labelStyle}>Bạn là?</label>
                        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                            {["student", "instructor"].map((role) => (
                                <label key={role} style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "14px",
                                    borderRadius: "16px",
                                    background: form.role === role ? "#667eea" : "#f8fafc",
                                    color: form.role === role ? "white" : "#475569",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    border: "2px solid",
                                    borderColor: form.role === role ? "#667eea" : "#e2e8f0"
                                }}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value={role}
                                        checked={form.role === role}
                                        onChange={handleChange}
                                        style={{ display: "none" }}
                                    />
                                    {role === "student" ? "Học viên" : "Giảng viên"}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Tên */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={labelStyle}>Họ và tên</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Nguyễn Văn A"
                            style={inputStyle(error.name)}
                        />
                        {error.name && <p style={errorStyle}>{error.name}</p>}
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={labelStyle}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            style={inputStyle(error.email)}
                        />
                        {error.email && <p style={errorStyle}>{error.email}</p>}
                    </div>

                    {/* Mật khẩu */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={labelStyle}>Mật khẩu</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                style={inputStyle(error.password)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={eyeButtonStyle}
                            >
                                {showPassword ? "Ẩn" : "Hiện"}
                            </button>
                        </div>
                        {error.password && <p style={errorStyle}>{error.password}</p>}
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div style={{ marginBottom: "28px" }}>
                        <label style={labelStyle}>Xác nhận mật khẩu</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                style={inputStyle(error.confirmPassword)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={eyeButtonStyle}
                            >
                                {showConfirmPassword ? "Ẩn" : "Hiện"}
                            </button>
                        </div>
                        {error.confirmPassword && <p style={errorStyle}>{error.confirmPassword}</p>}
                    </div>

                    {/* Nút submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "16px",
                            borderRadius: "16px",
                            background: loading ? "#94a3b8" : "linear-gradient(90deg, #667eea, #764ba2)",
                            color: "white",
                            fontSize: "18px",
                            fontWeight: "700",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "all 0.3s ease",
                            boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)"
                        }}
                        onMouseEnter={e => !loading && (e.currentTarget.style.transform = "translateY(-2px)")}
                        onMouseLeave={e => !loading && (e.currentTarget.style.transform = "translateY(0)")}
                    >
                        {loading ? "Đang tạo tài khoản..." : "Đăng ký ngay"}
                    </button>
                </form>

                {/* Thông báo */}
                {msg && (
                    <div style={{
                        marginTop: "24px",
                        padding: "16px",
                        borderRadius: "12px",
                        background: msg.includes("thành công") ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: msg.includes("thành công") ? "#16a34a" : "#dc2626",
                        border: `1px solid ${msg.includes("thành công") ? "#22c55e" : "#ef4444"}`,
                        textAlign: "center",
                        fontWeight: "600"
                    }}>
                        {msg}
                    </div>
                )}

                <p style={{
                    textAlign: "center",
                    marginTop: "28px",
                    color: "#64748b",
                    fontSize: "15px"
                }}>
                    Đã có tài khoản?{" "}
                    <Link
                        to="/login"
                        style={{
                            color: "#667eea",
                            fontWeight: "700",
                            textDecoration: "none"
                        }}
                    >
                        Đăng nhập ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}

/* Styles */
const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#374151",
    fontSize: "15px"
};

const inputStyle = (hasError) => ({
    width: "92%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: `2px solid ${hasError ? "#ef4444" : "#e2e8f0"}`,
    fontSize: "16px",
    outline: "none",
    transition: "all 0.3s ease",
    background: hasError ? "rgba(239, 68, 68, 0.05)" : "white"
});

const eyeButtonStyle = {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "14px",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "8px"
};

const errorStyle = {
    color: "#ef4444",
    fontSize: "13px",
    margin: "6px 0 0",
    fontWeight: "500"
};

export default Register;