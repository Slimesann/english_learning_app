import React, { useState } from "react";
import api from "../../services/api";

function WritingLesson({ lesson }) {
    const [userAnswer, setUserAnswer] = useState("");
    const [writingResult, setWritingResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!userAnswer.trim()) return alert("Vui lòng nhập bài viết!");
        if (submitted) return alert("Bạn đã nộp bài rồi!");

        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) return alert("Bạn cần đăng nhập!");

        const userId = storedUser._id || storedUser.id;
        setLoading(true);

        try {
            const evaluateRes = await api.post("/writing/evaluate", {
                userId,
                lessonId: lesson._id,
                courseId: lesson.courseId,
                topic: lesson.title,
                text: userAnswer,
            });

            const result = evaluateRes.data.result;
            setWritingResult(result);

            await api.post("/results", {
                userId,
                courseId: lesson.courseId,
                lessonId: lesson._id,
                type: "writing",
                writingText: userAnswer,
                feedback: result.feedback,
                score: result.score,
            });

            await api.post(`/progress/lesson/${lesson._id}`, {
                score: result.score,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });

            setSubmitted(true);
            alert("Nộp bài viết thành công!");
        } catch (err) {
            console.error("Lỗi nộp bài viết:", err);
            alert("Lỗi khi nộp bài!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            fontFamily: "Arial, sans-serif",
            padding: 20,
            maxWidth: 800,
            margin: "auto",
            background: "#f9f9f9",
            borderRadius: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
        }}>
            <h3 style={{ color: "#2c3e50", textAlign: "center", marginBottom: 24, fontSize: 22 }}>
                Writing - Bài Viết
            </h3>

            <div style={{
                background: "#fff",
                padding: 18,
                borderRadius: 12,
                border: "1px solid #eee",
                marginBottom: 20
            }}>
                <p style={{ margin: "0 0 10px", fontWeight: "bold", color: "#34495e" }}>Đề bài:</p>
                <p style={{ margin: 0, lineHeight: 1.7, color: "#2c3e50", fontSize: 16 }}>
                    {lesson.content || "Chưa có đề bài."}
                </p>
            </div>

            <textarea
                rows={10}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={submitted}
                placeholder="Viết bài của bạn tại đây..."
                style={{
                    width: "95%",
                    padding: 16,
                    borderRadius: 12,
                    border: "1px solid #ddd",
                    fontSize: 16,
                    resize: "vertical",
                    background: submitted ? "#f5f5f5" : "#fff",
                    fontFamily: "inherit"
                }}
            />

            <div style={{ textAlign: "center", marginTop: 24 }}>
                <button
                    onClick={handleSubmit}
                    disabled={loading || submitted || !userAnswer.trim()}
                    style={{
                        padding: "16px 36px",
                        background: (!userAnswer.trim() || submitted) ? "#95a5a6" : "#27ae60",
                        color: "#fff",
                        border: "none",
                        borderRadius: 12,
                        fontSize: 18,
                        fontWeight: "bold",
                        cursor: (!userAnswer.trim() || submitted) ? "not-allowed" : "pointer",
                        boxShadow: "0 6px 16px rgba(39, 174, 96, 0.3)",
                        transition: "all 0.2s"
                    }}
                >
                    {loading ? "Đang nộp..." : submitted ? "Đã nộp bài" : "Nộp bài viết"}
                </button>
            </div>

            {writingResult && (
                <div style={{
                    marginTop: 32,
                    padding: 24,
                    background: "#e8f5e9",
                    borderRadius: 12,
                    border: "1px solid #c8e6c9"
                }}>
                    <p style={{ margin: "0 0 16px", fontSize: 20, fontWeight: "bold", color: "#2e7d32" }}>
                        Điểm: {writingResult.score}/100
                    </p>
                    <p style={{
                        margin: 0,
                        whiteSpace: "pre-line",
                        lineHeight: 1.8,
                        color: "#1b5e20",
                        fontSize: 15
                    }}>
                        <strong>Nhận xét:</strong> {writingResult.feedback}
                    </p>
                </div>
            )}
        </div>
    );
}

export default WritingLesson;