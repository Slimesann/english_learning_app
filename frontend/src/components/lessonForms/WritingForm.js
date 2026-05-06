import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../Spinner";

const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
const backPath = currentUser.role === "admin" ? "/admin" : "/instructor";

export default function WritingForm() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();

    const [topic, setTopic] = useState("");
    const [grammarFocus, setGrammarFocus] = useState("");
    const [keywords, setKeywords] = useState("");
    const [loading, setLoading] = useState(false);

    const saveWritingExercise = async () => {
        if (!topic.trim()) return alert("Vui lòng nhập đề bài Writing!");

        setLoading(true);
        try {
            const exerciseRes = await api.post("/exercises", {
                lessonId,
                type: "writing",
                question: topic,
                correctAnswer: "",
                options: [],
                grammarFocus,
                keywords: keywords.split(",").map(s => s.trim()).filter(Boolean)
            });

            const exerciseId = exerciseRes.data?._id;
            if (!exerciseId) throw new Error("Không tạo được Exercise!");

            await api.put(`/lessons/${lessonId}`, { $push: { exercises: exerciseId } });

            alert("Tạo bài Writing thành công!");
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lưu bài Writing!");
        } finally {
            setLoading(false);
        }
    };

    // ĐỒNG NHẤT VỚI READING FORM
    const handleBackToCourse = () => {
        navigate(`/admin/course/${courseId}/details`);
    };

    const handleFinish = () => navigate(backPath);

    return (
        <div style={{ padding: "32px", maxWidth: "900px", margin: "0 auto", fontFamily: "'Segoe UI', sans-serif" }}>
            <h2 style={{ color: "#1e293b", marginBottom: "8px" }}>Writing Exercise</h2>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>
                Course ID: <strong>{courseId}</strong> | Lesson ID: <strong>{lessonId}</strong>
            </p>

            <div style={{ background: "white", padding: "32px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", color: "#1e293b" }}>
                    Đề bài Writing
                </label>
                <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={6}
                    placeholder="Write an essay about the advantages and disadvantages of remote working..."
                    style={{
                        width: "90%",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "2px solid #e2e8f0",
                        fontSize: "17px",
                        fontFamily: "inherit",
                        resize: "vertical",
                        marginBottom: "20px"
                    }}
                />

                <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", color: "#1e293b" }}>
                    Ngữ pháp trọng tâm (không bắt buộc)
                </label>
                <input
                    value={grammarFocus}
                    onChange={(e) => setGrammarFocus(e.target.value)}
                    placeholder="Ví dụ: Present Perfect, Passive Voice..."
                    style={inputStyle}
                />

                <label style={{ display: "block", margin: "20px 0 12px", fontWeight: "600", color: "#1e293b" }}>
                    Từ khóa gợi ý (ngăn cách bằng dấu phẩy)
                </label>
                <input
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="environment, pollution, global warming, recycling..."
                    style={inputStyle}
                />

                <div style={{ marginTop: "32px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button onClick={saveWritingExercise} disabled={loading} style={btnStyle("green")}>
                        {loading ? "Đang lưu..." : "Lưu bài Writing"}
                    </button>
                    <button onClick={handleBackToCourse} style={btnStyle("gray")}>
                        Quay lại Course
                    </button>
                    <button onClick={handleFinish} style={btnStyle("dark")}>
                        {currentUser.role === "admin" ? "Về Trang Admin" : "Về Trang Instructor"}
                    </button>
                </div>
            </div>

            {loading && <Spinner />}
        </div>
    );
}

const inputStyle = {
    width: "90%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "16px",
    marginBottom: "20px"
};

const btnStyle = (color) => {
    const colors = {
        green: "#10b981", gray: "#64748b", dark: "#1e293b"
    };
    return {
        padding: "14px 28px",
        background: colors[color],
        color: "white",
        border: "none",
        borderRadius: "12px",
        fontWeight: "700",
        cursor: "pointer",
        fontSize: "15px",
        transition: "all 0.3s"
    };
};