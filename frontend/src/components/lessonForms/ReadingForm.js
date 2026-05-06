import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import FileInput from "../FileInput.js";
import Spinner from "../Spinner.js";
import QuizPreview from "../QuizPreview.js";

const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
const backPath = currentUser.role === "admin" ? "/admin" : "/instructor";

export default function ReadingForm() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();

    const [text, setText] = useState("");
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [excelFile, setExcelFile] = useState(null);
    const [numQuestions, setNumQuestions] = useState(10);

    useEffect(() => {
        if (lessonId) {
            localStorage.setItem("currentLessonId", lessonId);
            console.log("Đã tự động lưu lessonId:", lessonId);
        }
    }, [lessonId]);

    const uploadExcel = async () => {
        if (!excelFile) return alert("Chọn file Excel trước");
        const fd = new FormData();
        fd.append("excel", excelFile);
        setLoading(true);
        try {
            const res = await api.post("/quizzes/upload-excel", fd);
            setQuizzes(res.data.items || []);
        } catch (err) {
            console.error("Upload Excel lỗi:", err);
            alert("Upload thất bại");
        } finally {
            setLoading(false);
        }
    };

    const generateAI = async () => {
        if (!text.trim()) {
            alert("Vui lòng nhập nội dung bài đọc trước!");
            return;
        }

        if (!lessonId) {
            alert("Không tìm thấy lessonId!");
            return;
        }

        setLoading(true);
        try {
            console.log("Bước 1: Đang lưu nội dung vào database...");
            await api.put(`/lessons/${lessonId}/content`, { content: text });

            console.log(`Bước 2: Đang tạo ${numQuestions} câu hỏi bằng AI...`);
            const res = await api.post("/quizzes/generate-ai", {
                lessonId,
                numQuestions: Number(numQuestions)
            });

            if (res.data?.items && res.data.items.length > 0) {
                setQuizzes(res.data.items);
                alert(`Thành công! AI đã tạo ${res.data.items.length} câu hỏi`);
            } else {
                alert("AI chạy thành công nhưng không tạo được câu hỏi.");
            }
        } catch (err) {
            console.error("Lỗi tạo quiz:", err.response?.data || err);
            const msg = err.response?.data?.error || "Không thể kết nối AI";
            alert("Lỗi: " + msg);
        } finally {
            setLoading(false);
        }
    };

    const saveAll = async () => {
        let hasError = false;

        if (text.trim()) {
            try {
                await api.put(`/lessons/${lessonId}/content`, { content: text });
                console.log("Nội dung lưu thành công");
            } catch (err) {
                console.error("Lỗi lưu nội dung:", err);
                alert("Lưu nội dung thất bại!");
                hasError = true;
            }
        }

        if (quizzes.length > 0) {
            try {
                const dataToSave = quizzes.map((q) => ({
                    question: q.question,
                    options: q.options || [],
                    type: q.type || "mcq",
                    correctAnswer: q.correctAnswer || "",
                }));

                await api.post("/quizzes/save", {
                    lessonId,
                    title: "Quiz for Reading",
                    questions: dataToSave,
                });
                alert("Quiz lưu thành công!");
            } catch (err) {
                console.error("Lỗi lưu quiz:", err.response?.data || err.message);
                alert("Lưu quiz thất bại!");
                hasError = true;
            }
        }

        if (!hasError && text.trim()) {
            alert("Tất cả đã được lưu thành công!");
        }
    };

    const handleBackToCreateLesson = () => {
        if (!courseId) return alert("Không có Course ID!");
        navigate(`/admin/course/${courseId}/details`);
    };

    const handleFinish = () => navigate(backPath);

    return (
        <div style={{ padding: 20, fontFamily: "Arial, sans-serif", maxWidth: 1100, margin: "0 auto" }}>
            <h3 style={{ textAlign: "center", marginBottom: 8 }}>Reading Lesson</h3>
            <div style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
                <p>Course ID: <strong>{courseId || "Chưa có"}</strong></p>
                <p>
                    Lesson ID: <strong>{lessonId || "Chưa có"}</strong>
                    {lessonId && <span style={{ color: "#28a745", marginLeft: 12, fontSize: 14 }}>Đã tự động lưu</span>}
                </p>
            </div>

            <label style={{ fontWeight: 600, display: "block", marginBottom: 8 }}>
                Nội dung Reading:
            </label>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder="Dán hoặc gõ nội dung bài đọc tiếng Anh vào đây..."
                style={{
                    width: "100%",
                    padding: 16,
                    borderRadius: 12,
                    border: "2px solid #e0e0e0",
                    fontSize: 16,
                    fontFamily: "inherit",
                    resize: "vertical",
                    marginBottom: 24
                }}
            />

            <div style={{ marginBottom: 16 }}>
                <strong>Thêm quiz từ file</strong>
                <div style={{ marginTop: 8 }}>
                    <FileInput accept=".xlsx,.xls" onChange={setExcelFile} />
                    <button onClick={uploadExcel} style={btnStyle("blue", loading)}>
                        Upload Excel
                    </button>
                </div>
            </div>

            <div style={{ 
                padding: "20px", 
                background: "#f8f9fa", 
                borderRadius: 16, 
                textAlign: "center",
                marginBottom: 32,
                border: "2px dashed #007bff"
            }}>
                <h4 style={{ margin: "0 0 16px", color: "#007bff" }}>
                    Tạo quiz tự động bằng AI
                </h4>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                    <div>
                        <label style={{ marginRight: 8, fontWeight: 600 }}>Số câu hỏi:</label>
                        <select
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(Number(e.target.value))}
                            style={{
                                padding: "10px 16px",
                                borderRadius: 8,
                                border: "1px solid #ccc",
                                fontSize: 15
                            }}
                        >
                            <option value={5}>5 câu</option>
                            <option value={10}>10 câu</option>
                            <option value={15}>15 câu</option>
                            <option value={20}>20 câu</option>
                        </select>
                    </div>

                    <button
                        onClick={generateAI}
                        disabled={loading || !text.trim()}
                        style={{
                            ...btnStyle("blue"),
                            padding: "14px 32px",
                            fontSize: 16,
                            fontWeight: 700,
                            opacity: loading || !text.trim() ? 0.6 : 1
                        }}
                    >
                        {loading ? "Đang tạo câu hỏi..." : `Tạo ${numQuestions} câu hỏi bằng AI`}
                    </button>
                </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
                <button onClick={saveAll} style={btnStyle("green")} disabled={loading}>
                    Lưu tất cả
                </button>
                <button onClick={handleBackToCreateLesson} style={btnStyle("gray")}>
                    Quay lại Course
                </button>

                {currentUser.role === "admin" && (
                    <button onClick={handleFinish} style={btnStyle("dark")}>Về Admin</button>
                )}
                {currentUser.role === "instructor" && (
                    <button onClick={handleFinish} style={btnStyle("dark")}>Về Instructor</button>
                )}
            </div>

            {loading && <Spinner />}
            {quizzes.length > 0 && <QuizPreview items={quizzes} />}
        </div>
    );
}

const btnStyle = (color, disabled = false) => ({
    padding: "12px 24px",
    background: disabled ? "#ccc" : {
        green: "#28a745",
        blue: "#007bff",
        gray: "#6c757d",
        dark: "#343a40"
    }[color],
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 15,
    fontWeight: 600,
    minWidth: 140,
    opacity: disabled ? 0.7 : 1,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
});