import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginService } from "../services/authService";

function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setMsg("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");

        try {
            const { token, user } = await loginService(form);

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            login(token, user);

            setMsg("Đăng nhập thành công! Đang chuyển hướng...");

            setTimeout(() => {
                switch (user.role) {
                    case "admin":
                        navigate("/admin", { replace: true });
                        break;
                    case "instructor":
                        navigate("/instructor", { replace: true });
                        break;
                    default:
                        navigate("/profile", { replace: true });
                        break;
                }
            }, 800);
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Email hoặc mật khẩu không đúng";
            setMsg(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
            fontFamily: "'Segoe UI', system-ui, sans-serif"
        }}>
            <div style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderRadius: "28px",
                boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
                width: "100%",
                maxWidth: "460px",
                padding: "52px 44px",
                border: "1px solid rgba(255,255,255,0.3)",
                position: "relative",
                overflow: "hidden"
            }}>

                <div style={{ textAlign: "center", marginBottom: "36px" }}>
                    <h1 style={{
                        fontSize: "34px",
                        fontWeight: "900",
                        background: "linear-gradient(90deg, #1e40af, #7c3aed)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        margin: "0 0 8px"
                    }}>
                        Chào mừng trở lại!
                    </h1>
                    <p style={{ color: "#64748b", fontSize: "17px", margin: 0 }}>
                        Đăng nhập để tiếp tục học
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "20px"}}>
                        <label style={labelStyle}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            style={inputStyle}
                            onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                        />
                    </div>

                    <div style={{ marginBottom: "28px" }}>
                        <label style={labelStyle}>Mật khẩu</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu của bạn"
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "14px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "#64748b",
                                    fontSize: "15px",
                                    cursor: "pointer",
                                    padding: "8px",
                                    borderRadius: "8px",
                                    fontWeight: "600"
                                }}
                            >
                                {showPassword ? "Ẩn" : "Hiện"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "18px",
                            borderRadius: "16px",
                            background: loading
                                ? "#94a3b8"
                                : "linear-gradient(90deg, #3b82f6, #8b5cf6)",
                            color: "white",
                            fontSize: "18px",
                            fontWeight: "800",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "all 0.4s ease",
                            boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                        }}
                        onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "translateY(-3px)")}
                        onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = "translateY(0)")}
                    >
                        {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
                    </button>
                </form>

                {msg && (
                    <div style={{
                        marginTop: "24px",
                        padding: "16px 20px",
                        borderRadius: "12px",
                        background: msg.includes("thành công")
                            ? "rgba(34, 197, 94, 0.15)"
                            : "rgba(239, 68, 68, 0.15)",
                        color: msg.includes("thành công") ? "#16a34a" : "#dc2626",
                        border: `2px solid ${msg.includes("thành công") ? "#22c55e" : "#ef4444"}`,
                        textAlign: "center",
                        fontWeight: "700",
                        fontSize: "15px"
                    }}>
                        {msg}
                    </div>
                )}

                <div style={{ marginTop: "28px", textAlign: "center" }}>
                    <Link
                        to="/forgot-password"
                        style={{
                            color: "#3b82f6",
                            textDecoration: "none",
                            fontWeight: "600",
                            fontSize: "15px"
                        }}
                    >
                        Quên mật khẩu?
                    </Link>
                </div>

                <div style={{
                    marginTop: "32px",
                    paddingTop: "24px",
                    borderTop: "2px dashed #e2e8f0",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "15px"
                }}>
                    Chưa có tài khoản?{" "}
                    <Link
                        to="/register"
                        style={{
                            color: "#8b5cf6",
                            fontWeight: "800",
                            textDecoration: "none",
                            fontSize: "16px"
                        }}
                    >
                        Đăng ký miễn phí
                    </Link>
                </div>
            </div>
        </div>
    );
}

const labelStyle = {
    display: "block",
    marginBottom: "10px",
    fontWeight: "700",
    color: "#1e293b",
    fontSize: "16px"
};

const inputStyle = {
    width: "90%",
    padding: "16px 18px",
    borderRadius: "14px",
    border: "2px solid #e2e8f0",
    fontSize: "16px",
    outline: "none",
    transition: "all 0.3s ease",
    background: "white",
    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.05)"
};

export default Login;