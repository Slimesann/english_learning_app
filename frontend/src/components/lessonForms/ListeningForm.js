// ListeningForm.js - FINAL FIXED
import React, { useState } from "react";
import api from "../../services/api.js";
import FileInput from "../FileInput.js";
import Spinner from "../Spinner.js";
import QuizPreview from "../QuizPreview.js";
import { useParams, useNavigate } from "react-router-dom";

const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
const backPath = currentUser.role === "admin" ? "/admin" : "/instructor";

export default function ListeningForm() {
    const { courseId, lessonId } = useParams();
    const [audioFile, setAudioFile] = useState(null);
    const [excelFile, setExcelFile] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mediaUrl, setMediaUrl] = useState("");
    const navigate = useNavigate();

    const uploadExcel = async () => {
        if (!excelFile) return alert("Chọn file Excel trước khi upload!");
        const fd = new FormData();
        fd.append("excel", excelFile);
        setLoading(true);
        try {
            const res = await api.post("/quizzes/upload-excel", fd);
            setQuizzes(res.data.items || []);
        } catch (err) {
            console.error("Upload Excel lỗi:", err);
            alert("Upload thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const generateFromAudio = async () => {
        if (!audioFile) return alert("Chọn file audio trước!");
        const fd = new FormData();
        fd.append("audio", audioFile);
        setLoading(true);
        try {
            const res = await api.post("/listening/generate-quiz-from-audio", fd);
            setQuizzes(res.data.items || []);
        } catch (err) {
            console.error("AI generate lỗi:", err);
            alert("Không thể tạo quiz từ audio!");
        } finally {
            setLoading(false);
        }
    };

    // SỬA: DÙNG FormData
    const saveLesson = async () => {
        if (!lessonId) return alert("Không tìm thấy lessonId để lưu!");
        if (!quizzes.length) return alert("Chưa có quiz nào!");

        const fd = new FormData();
        fd.append("lessonId", lessonId);
        fd.append("title", "Listening Quiz");
        fd.append("type", "listening");
        fd.append("questions", JSON.stringify(quizzes.map(q => ({
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer || q.answer || "",
            type: q.type || "mcq"
        }))));

        setLoading(true);
        try {
            await api.post("/quizzes/save", fd);
            alert("Lưu quiz thành công!");
        } catch (err) {
            console.error("Lỗi lưu quiz:", err.response?.data || err);
            alert("Không thể lưu quiz!");
        } finally {
            setLoading(false);
        }
    };

    // SỬA: DÙNG PUT + mediaUrl
    const saveMedia = async () => {
        if (!lessonId) return alert("Không tìm thấy lessonId!");
        if (!mediaUrl.trim() && !audioFile) {
            return alert("Nhập Media URL hoặc chọn file audio!");
        }

        setLoading(true);
        try {
            let uploadedFileUrl = mediaUrl;

            if (audioFile) {
                const fd = new FormData();
                fd.append("audio", audioFile);
                const res = await api.post("/upload/audio", fd);
                uploadedFileUrl = res.data.url;
            }

            await api.put(`/lessons/${lessonId}/media`, { mediaUrl: uploadedFileUrl });
            alert("Đã lưu media vào bài học!");
        } catch (err) {
            console.error("Lỗi lưu media:", err.response?.data || err);
            alert("Không thể lưu media!");
        } finally {
            setLoading(false);
        }
    };

    const handleBackToCourseDetail = () => courseId && navigate(`/admin/course/${courseId}/details`);
    const handleFinish = () => navigate(backPath);

    return (
        <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
            <h3>Listening Lesson</h3>
            <p style={{ color: "gray" }}>Course ID: {courseId || "Chưa có"}</p>
            <p style={{ color: "gray" }}>Lesson ID: {lessonId || "Chưa có"}</p>

            <div style={{ marginBottom: 12 }}>
                <label>Media URL (optional)</label>
                <input
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
                />
            </div>

            <div style={{ marginBottom: 12 }}>
                <strong>Upload audio (mp3/wav/mp4)</strong>
                <FileInput accept="audio/*,video/*" onChange={setAudioFile} />
                <button onClick={generateFromAudio} style={btnStyle("blue")}>
                    Generate quiz from audio (AI)
                </button>
            </div>

            <div style={{ marginBottom: 12 }}>
                <strong>Hoặc upload file Excel để tạo quiz</strong>
                <FileInput accept=".xlsx" onChange={setExcelFile} />
                <button onClick={uploadExcel} style={btnStyle("blue")}>
                    Upload Excel
                </button>
            </div>

            <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={saveLesson} style={btnStyle("green")}>Lưu Quiz</button>
                <button onClick={handleBackToCourseDetail} style={btnStyle("gray")}>Quay lại Course</button>
                <button onClick={saveMedia} style={btnStyle("purple")}>Lưu Audio</button>
                {currentUser.role === "admin" && (
                    <button onClick={handleFinish} style={btnStyle("dark")}>Về Admin</button>
                )}
                {currentUser.role === "instructor" && (
                    <button onClick={handleFinish} style={btnStyle("dark")}>Về Instructor</button>
                )}
            </div>

            {loading && <Spinner />}
            <div style={{ marginTop: 20 }}>
                <h4>Quiz Preview</h4>
                <QuizPreview items={quizzes} />
            </div>
        </div>
    );
}

const btnStyle = (color) => {
    const colors = { green: "#28a745", blue: "#007bff", purple: "#6f42c1", gray: "#6c757d", dark: "#343a40" };
    return {
        padding: "10px 16px",
        background: colors[color],
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 14
    };
};