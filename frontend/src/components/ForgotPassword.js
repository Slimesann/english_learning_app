// src/components/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setMsg("Vui lòng nhập email của bạn!");
            return;
        }

        setLoading(true);
        setMsg("");
        setSent(false);

        try {
            await api.post("/auth/forgot-password", { email: email.toLowerCase().trim() });
            setMsg("Thành công! Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn.");
            setSent(true);
            setEmail("");
        } catch (err) {
            const error = err.response?.data?.msg || "Không tìm thấy email này. Vui lòng kiểm tra lại!";
            setMsg(error);
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
            {/* Card chính – Glassmorphism siêu đẹp */}
            <div style={{
                background: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "32px",
                boxShadow: "0 30px 70px rgba(0,0,0,0.35)",
                width: "100%",
                maxWidth: "500px",
                padding: "60px 50px",
                border: "1px solid rgba(255,255,255,0.4)",
                position: "relative",
                overflow: "hidden",
                textAlign: "center"
            }}>

                {/* Icon khóa lớn */}
                <div style={{
                    width: "110px",
                    height: "110px",
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    borderRadius: "50%",
                    margin: "0 auto 28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 20px 40px rgba(102, 126, 234, 0.4)"
                }}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        <circle cx="12" cy="16" r="1" fill="white"/>
                    </svg>
                </div>

                {/* Tiêu đề */}
                <h1 style={{
                    fontSize: "36px",
                    fontWeight: "900",
                    background: "linear-gradient(90deg, #667eea, #764ba2)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    margin: "0 0 16px"
                }}>
                    Quên mật khẩu?
                </h1>
                <p style={{
                    color: "#64748b",
                    fontSize: "18px",
                    lineHeight: "1.6",
                    margin: "0 0 40px",
                    maxWidth: "380px",
                    marginLeft: "auto",
                    marginRight: "auto"
                }}>
                    Đừng lo lắng! Chỉ cần nhập email đã đăng ký, chúng tôi sẽ gửi ngay link đặt lại mật khẩu
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ position: "relative", marginBottom: "32px" }}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            disabled={loading || sent}
                            style={{
                                width: "75%",
                                padding: "20px 56px 20px 56px",
                                borderRadius: "20px",
                                border: "2px solid #e2e8f0",
                                fontSize: "17px",
                                outline: "none",
                                transition: "all 0.4s ease",
                                background: sent ? "#f8fafc" : "white",
                                boxShadow: "inset 0 4px 10px rgba(0,0,0,0.06)",
                                color: "#1e293b"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#764ba2"}
                            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                        />
                        {/* Icon email */}
                        <div style={{
                            position: "absolute",
                            left: "20px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#94a3b8",
                            pointerEvents: "none"
                        }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                        </div>
                    </div>

                    {/* Nút gửi */}
                    <button
                        type="submit"
                        disabled={loading || sent || !email.trim()}
                        style={{
                            width: "100%",
                            padding: "20px",
                            borderRadius: "20px",
                            background: loading || sent || !email.trim()
                                ? "#94a3b8"
                                : "linear-gradient(90deg, #667eea, #764ba2)",
                            color: "white",
                            fontSize: "19px",
                            fontWeight: "800",
                            border: "none",
                            cursor: loading || sent || !email.trim() ? "not-allowed" : "pointer",
                            transition: "all 0.4s ease",
                            boxShadow: "0 15px 35px rgba(102, 126, 234, 0.5)",
                            textTransform: "uppercase",
                            letterSpacing: "1.5px"
                        }}
                        onMouseEnter={(e) => !loading && !sent && email.trim() && (e.currentTarget.style.transform = "translateY(-5px)")}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                        {loading ? "Đang gửi..." : sent ? "Đã gửi thành công!" : "RESEND"}
                    </button>
                </form>

                {/* Thông báo */}
                {msg && (
                    <div style={{
                        marginTop: "32px",
                        padding: "20px 24px",
                        borderRadius: "18px",
                        background: sent
                            ? "linear-gradient(90deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))"
                            : "rgba(239, 68, 68, 0.15)",
                        border: `2px solid ${sent ? "#22c55e" : "#ef4444"}`,
                        color: sent ? "#16a34a" : "#dc2626",
                        fontWeight: "700",
                        fontSize: "17px",
                        lineHeight: "1.6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px"
                    }}>
                        {sent && (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3.5">
                                <path d="M20 6L9 17l-5-5"/>
                            </svg>
                        )}
                        {msg}
                    </div>
                )}

                {/* Quay lại đăng nhập */}
                <div style={{
                    marginTop: "48px",
                    paddingTop: "32px",
                    borderTop: "2px dashed #e2e8f0",
                    textAlign: "center"
                }}>
                    <p style={{ color: "#64748b", fontSize: "16px", margin: "0 0 16px" }}>
                        Đã nhớ mật khẩu?
                    </p>
                    <Link
                        to="/login"
                        style={{
                            display: "inline-block",
                            padding: "14px 40px",
                            background: "rgba(102, 126, 234, 0.1)",
                            color: "#667eea",
                            fontWeight: "800",
                            fontSize: "18px",
                            textDecoration: "none",
                            borderRadius: "16px",
                            transition: "all 0.3s ease"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(102, 126, 234, 0.2)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)"}
                    >
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;