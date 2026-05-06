import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Spinner from "../components/Spinner";

const PRESET_AVATARS = [
    {
        id: "male",
        url: "https://res.cloudinary.com/daqtutvru/image/upload/v1764066919/male_fa78y1.png",
        label: "Nam"
    },
    {
        id: "female",
        url: "https://res.cloudinary.com/daqtutvru/image/upload/v1764066901/female_n9bm0h.jpg",
        label: "Nữ"
    },
    {
        id: "default",
        url: "https://res.cloudinary.com/daqtutvru/image/upload/v1764064861/avatars/btr6syse9ecis5sqfa4q.png",
        label: "Mặc định"
    }
];

const DEFAULT_AVATAR = PRESET_AVATARS[2].url;

function Profile() {
    const { user, refreshUser } = useContext(AuthContext);

    const [showResetForm, setShowResetForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [changingAvatar, setChangingAvatar] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Avatar hiện tại
    const [currentAvatar, setCurrentAvatar] = useState(user?.avatar || DEFAULT_AVATAR);

    // Modal chọn avatar
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    // Toast
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
    };

    // Cập nhật avatar khi reload trang
    useEffect(() => {
        if (user?.avatar) {
        setCurrentAvatar(user.avatar);
        } else {
        setCurrentAvatar(DEFAULT_AVATAR);
        }
    }, [user?.avatar]);

    // Chọn avatar từ 3 ảnh có sẵn
    const selectAvatar = async (avatarUrl) => {
        setChangingAvatar(true);
        try {
        await api.post("/users/set-avatar", { avatarUrl });
        await refreshUser();
        setCurrentAvatar(avatarUrl);
        setShowAvatarPicker(false);
        showToast("Đổi ảnh đại diện thành công!", "success");
        } catch (err) {
        showToast("Không thể đổi avatar!", "error");
        } finally {
        setChangingAvatar(false);
        }
    };

    // Đổi mật khẩu (giữ nguyên)
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
        setError("Mật khẩu mới và xác nhận không khớp!");
        setLoading(false);
        return;
        }
        if (newPassword.length < 6) {
        setError("Mật khẩu mới phải ít nhất 6 ký tự!");
        setLoading(false);
        return;
        }

        try {
        await api.put("/auth/change-password", { currentPassword, newPassword });
        setSuccess("Đổi mật khẩu thành công!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        showToast("Đổi mật khẩu thành công!", "success");
        } catch (err) {
        setError(err.response?.data?.message || "Đổi mật khẩu thất bại!");
        } finally {
        setLoading(false);
        }
    };

    const toggleResetForm = () => {
        setShowResetForm(!showResetForm);
        if (!showResetForm) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setSuccess("");
        }
    };

    return (
        <>
        {/* TOAST */}
        {toast.show && (
            <div style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            zIndex: 9999,
            background: toast.type === "success" ? "#10b981" : "#ef4444",
            color: "#fff",
            padding: "18px 32px",
            borderRadius: "16px",
            fontWeight: 700,
            fontSize: "16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            animation: "slideIn 0.5s ease-out",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            border: "4px solid rgba(255,255,255,0.2)",
            }}>
            {toast.type === "success" ? "Success" : "Error"} {toast.message}
            </div>
        )}

        {/* MODAL CHỌN AVATAR */}
        {showAvatarPicker && (
            <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9998,
            }}>
            <div style={{
                background: "#fff",
                borderRadius: "24px",
                padding: "40px 32px",
                width: "480px",
                maxWidth: "90vw",
                boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
                textAlign: "center",
            }}>
                <h3 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "32px", color: "#1e293b" }}>
                Chọn ảnh đại diện
                </h3>

                <div style={{ display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
                {PRESET_AVATARS.map((av) => (
                    <div
                    key={av.id}
                    onClick={() => !changingAvatar && selectAvatar(av.url)}
                    style={{
                        cursor: changingAvatar ? "not-allowed" : "pointer",
                        opacity: changingAvatar ? 0.6 : 1,
                    }}
                    >
                    <div style={{
                        padding: "6px",
                        borderRadius: "50%",
                        border: currentAvatar === av.url ? "5px solid #8b5cf6" : "5px solid transparent",
                        transition: "all 0.3s ease",
                    }}>
                        <img
                        src={av.url}
                        alt={av.label}
                        style={{
                            width: "110px",
                            height: "110px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                        }}
                        />
                    </div>
                    <p style={{ marginTop: "12px", fontWeight: "600", color: "#475569" }}>
                        {av.label}
                    </p>
                    </div>
                ))}
                </div>

                {changingAvatar && (
                <div style={{ marginTop: "24px" }}>
                    <Spinner size="medium" />
                </div>
                )}

                <button
                onClick={() => setShowAvatarPicker(false)}
                disabled={changingAvatar}
                style={{
                    marginTop: "32px",
                    padding: "14px 40px",
                    background: "#64748b",
                    color: "white",
                    border: "none",
                    borderRadius: "16px",
                    fontWeight: "700",
                    fontSize: "16px",
                    cursor: changingAvatar ? "not-allowed" : "pointer",
                }}
                >
                Đóng
                </button>
            </div>
            </div>
        )}

        {/* TRANG PROFILE */}
        <div style={{
            maxWidth: "720px",
            margin: "40px auto",
            padding: "40px 32px",
            background: "#fff",
            borderRadius: "24px",
            boxShadow: "0 15px 50px rgba(0,0,0,0.12)",
        }}>
            <h2 style={{ textAlign: "center", fontSize: "30px", fontWeight: "800", marginBottom: "36px", color: "#1e293b" }}>
            Hồ sơ cá nhân
            </h2>

            {/* AVATAR HIỆN TẠI */}
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
                <img
                src={currentAvatar}
                alt="Avatar"
                style={{
                    width: "170px",
                    height: "170px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "8px solid white",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                }}
                onClick={() => setShowAvatarPicker(true)}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                />

                <div
                onClick={() => setShowAvatarPicker(true)}
                style={{
                    position: "absolute",
                    bottom: "8px",
                    right: "-8px",
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "#8b5cf6",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    cursor: "pointer",
                    boxShadow: "0 8px 25px rgba(139,92,246,0.6)",
                    border: "5px solid white",
                }}
                >
                Camera
                </div>
            </div>

            <h3 style={{ margin: "24px 0 8px", fontSize: "26px", fontWeight: "700", color: "#1e293b" }}>
                {user?.name || "Người dùng"}
            </h3>
            <p style={{ color: "#64748b", fontSize: "17px", fontWeight: "500" }}>
                {user?.email}
            </p>
            </div>

            {/* Thông tin tài khoản */}
            <div style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            padding: "28px",
            borderRadius: "20px",
            marginBottom: "36px",
            border: "1px solid #e2e8f0",
            boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)",
            }}>
            <h3 style={{ marginBottom: "20px", fontWeight: "700", fontSize: "18px", color: "#1e293b" }}>
                Thông tin tài khoản
            </h3>
            <div style={{ fontSize: "16px", lineHeight: "2", color: "#475569" }}>
                <div><strong>Email:</strong> {user?.email}</div>
                <div><strong>Họ tên:</strong> {user?.name}</div>
                <div>
                <strong>Tham gia:</strong>{" "}
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "-"}
                </div>
            </div>
            </div>

            {/* Nút đổi mật khẩu */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <button
                onClick={toggleResetForm}
                style={{
                padding: "16px 40px",
                background: showResetForm ? "#ef4444" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "16px",
                fontWeight: "700",
                fontSize: "17px",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                transition: "all 0.3s ease",
                }}
            >
                {showResetForm ? "Hủy đổi mật khẩu" : "Đổi mật khẩu"}
            </button>
            </div>

            {/* Form đổi mật khẩu */}
            {showResetForm && (
            <form onSubmit={handleResetPassword} style={{
                padding: "32px",
                background: "#fffbeb",
                borderRadius: "20px",
                border: "3px dashed #f59e0b",
                boxShadow: "0 10px 30px rgba(245,158,11,0.1)",
            }}>
                <h3 style={{ marginBottom: "24px", fontWeight: "800", fontSize: "20px", color: "#92400e" }}>
                Đổi mật khẩu
                </h3>

                {[
                { label: "Mật khẩu hiện tại", value: currentPassword, set: setCurrentPassword, show: showCurrent, setShow: setShowCurrent },
                { label: "Mật khẩu mới", value: newPassword, set: setNewPassword, show: showNew, setShow: setShowNew },
                { label: "Xác nhận mật khẩu mới", value: confirmPassword, set: setConfirmPassword, show: showConfirm, setShow: setShowConfirm },
                ].map((f, i) => (
                <div key={i} style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>{f.label}</label>
                    <div style={{ display: "flex", gap: "12px" }}>
                    <input
                        type={f.show ? "text" : "password"}
                        value={f.value}
                        onChange={(e) => f.set(e.target.value)}
                        required
                        style={{
                        flex: 1,
                        padding: "14px 16px",
                        borderRadius: "12px",
                        border: "2px solid #cbd5e1",
                        fontSize: "16px",
                        outline: "none",
                        transition: "border 0.3s",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#8b5cf6"}
                        onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                    />
                    <button
                        type="button"
                        onClick={() => f.setShow(!f.show)}
                        style={{
                        padding: "0 20px",
                        background: "#e2e8f0",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        }}
                    >
                        {f.show ? "Ẩn" : "Hiện"}
                    </button>
                    </div>
                </div>
                ))}

                {error && <p style={{ color: "#dc2626", fontWeight: "600", margin: "12px 0" }}>{error}</p>}
                {success && <p style={{ color: "#16a34a", fontWeight: "600", margin: "12px 0" }}>{success}</p>}

                <button
                type="submit"
                disabled={loading}
                style={{
                    width: "100%",
                    padding: "16px",
                    background: loading ? "#94a3b8" : "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "16px",
                    fontWeight: "700",
                    fontSize: "17px",
                    cursor: loading ? "not-allowed" : "pointer",
                    marginTop: "12px",
                }}
                >
                {loading ? <Spinner size="small" /> : "Cập nhật mật khẩu"}
                </button>
            </form>
            )}
        </div>

        <style jsx>{`
            @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
            }
        `}</style>
        </>
    );
}

export default Profile;