import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function ResetPassword() {
    const { token } = useParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return setMsg("Mật khẩu không khớp!");
        if (password.length < 6) return setMsg("Mật khẩu phải ≥ 6 ký tự!");

        setLoading(true);
        try {
            console.log("Gửi token:", token);
            console.log("Gửi password:", password);

            const res = await api.post(`/auth/reset-password/${token}`, {
                password, // ← PHẢI LÀ "password"
            });

            setMsg("Đặt lại mật khẩu thành công! Đang chuyển về đăng nhập...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            console.error("Lỗi reset:", err.response?.data);
            setMsg(err.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", textAlign: "center" }}>
            <h2>Đặt lại mật khẩu</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: "100%", padding: "12px", margin: "10px 0", borderRadius: 5, border: "1px solid #ccc" }}
                    required
                />
                <input
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: "100%", padding: "12px", margin: "10px 0", borderRadius: 5, border: "1px solid #ccc" }}
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "12px",
                        background: loading ? "#ccc" : "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: 5,
                        cursor: loading ? "not-allowed" : "pointer"
                    }}
                >
                    {loading ? "Đang xử lý..." : "Cập nhật"}
                </button>
            </form>
            {msg && <p style={{ marginTop: "15px", color: msg.includes("thành công") ? "green" : "red" }}>{msg}</p>}
        </div>
    );
}

export default ResetPassword;