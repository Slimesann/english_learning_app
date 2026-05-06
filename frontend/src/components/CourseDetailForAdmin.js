// src/components/CourseDetailForAdmin.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function CourseDetailForAdmin() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [lessonTitle, setLessonTitle] = useState("");
    const [editingLesson, setEditingLesson] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editSkill, setEditSkill] = useState("");
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [loadingModal, setLoadingModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseRes, lessonRes] = await Promise.all([
                    api.get(`/courses/${courseId}`),
                    api.get(`/lessons/course/${courseId}`)
                ]);
                setCourse(courseRes.data);
                setLessons(lessonRes.data);
            } catch (err) {
                alert("Không thể tải dữ liệu khóa học!");
            }
        };
        fetchData();
    }, [courseId]);

    const handleCreateLesson = async (skill) => {
        if (!lessonTitle.trim()) return alert("Nhập tên bài học!");
        try {
            const res = await api.post("/lessons", { title: lessonTitle, courseId, skillType: skill });
            setLessons([...lessons, res.data]);
            setLessonTitle("");
            alert(`Đã tạo: ${lessonTitle} (${skill.toUpperCase()})`);
            navigate(`/course/${courseId}/lesson/${res.data._id}/${skill.toLowerCase()}`);
        } catch (err) {
            alert("Tạo thất bại!");
        }
    };

    const startEdit = (lesson) => {
        setEditingLesson(lesson._id);
        setEditTitle(lesson.title);
        setEditSkill(lesson.skillType);
    };

    const saveEdit = async () => {
        if (!editTitle.trim()) return alert("Tên không được để trống!");
        try {
            const res = await api.put(`/lessons/${editingLesson}`, { title: editTitle, skillType: editSkill });
            setLessons(lessons.map(l => l._id === editingLesson ? res.data : l));
            setEditingLesson(null);
            alert("Cập nhật thành công!");
        } catch (err) {
            alert("Cập nhật thất bại!");
        }
    };

    const cancelEdit = () => setEditingLesson(null);

    const handleDelete = async (lessonId, title) => {
        if (!window.confirm(`XÓA bài "${title}"?\nKhông thể hoàn tác!`)) return;
        try {
            await api.delete(`/lessons/${lessonId}`);
            setLessons(lessons.filter(l => l._id !== lessonId));
            alert("Đã xóa!");
        } catch (err) {
            alert("Xóa thất bại!");
        }
    };

    // SIÊU FIX: LẤY CHI TIẾT QUIZ + HỖ TRỢ VIDEO YOUTUBE
    const openPreview = async (lessonId) => {
        setLoadingModal(true);
        try {
            const lessonRes = await api.get(`/lessons/${lessonId}`);
            let lesson = lessonRes.data;

            // Fix quiz: nếu chỉ là mảng ID → lấy chi tiết
            if (lesson.quizzes && lesson.quizzes.length > 0 && typeof lesson.quizzes[0] === "string") {
                const quizDetails = await Promise.all(
                    lesson.quizzes.map(async (quizId) => {
                        try {
                            const res = await api.get(`/quizzes/detail/${quizId}`);
                            return res.data;
                        } catch (err) {
                            return { question: "[Lỗi tải]", options: [], correctAnswer: "" };
                        }
                    })
                );
                lesson.quizzes = quizDetails;
            }

            setSelectedLesson(lesson);
        } catch (err) {
            alert("Không thể tải nội dung!");
        } finally {
            setLoadingModal(false);
        }
    };

    const closePreview = () => setSelectedLesson(null);

    return (
        <div style={{ padding: "20px", maxWidth: "1100px", margin: "auto", fontFamily: "Segoe UI, sans-serif" }}>
            <button onClick={() => navigate("/admin")} style={backBtn}>
                ← Quay lại Admin
            </button>

            <h2 style={{ margin: "20px 0", color: "#2c3e50" }}>
                Quản lý khóa học: <strong style={{ color: "#007bff" }}>{course?.title || "Đang tải..."}</strong>
            </h2>

            {/* TẠO LESSON */}
            <div style={card}>
                <h3>Thêm bài học mới</h3>
                <input type="text" placeholder="Tên bài học..." value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} style={inputStyle} />
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
                    {["reading", "listening", "writing", "speaking"].map(skill => (
                        <button key={skill} onClick={() => handleCreateLesson(skill)} style={skillBtn(skill)}>
                            + {skill.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* DANH SÁCH LESSON */}
            <h3>Danh sách bài học ({lessons.length})</h3>
            <div style={{ overflowX: "auto" }}>
                <table style={tableStyle}>
                    <thead><tr><th style={th}>STT</th><th style={th}>Tên bài học</th><th style={th}>Kỹ năng</th><th style={th}>Hành động</th></tr></thead>
                    <tbody>
                        {lessons.map((lesson, i) => (
                            <tr key={lesson._id}>
                                <td style={td}>{i + 1}</td>
                                <td style={td}><strong>{lesson.title}</strong></td>
                                <td style={td}><span style={skillBadge(lesson.skillType)}>{lesson.skillType.toUpperCase()}</span></td>
                                <td style={td}>
                                    <button onClick={() => openPreview(lesson._id)} style={btnStyle("orange")}>Xem</button>
                                    <button onClick={() => navigate(`/course/${courseId}/lesson/${lesson._id}/${lesson.skillType}`)} style={btnStyle("blue")}>Vào</button>
                                    <button onClick={() => startEdit(lesson)} style={btnStyle("primary")}>Sửa</button>
                                    <button onClick={() => handleDelete(lesson._id, lesson.title)} style={btnStyle("danger")}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL – SIÊU ĐẸP, CÓ QUIZ + YOUTUBE */}
            {selectedLesson && (
                <div style={modalOverlay} onClick={closePreview}>
                    <div style={modalContent} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "2px solid #007bff", paddingBottom: 16 }}>
                            <h2 style={{ margin: 0, color: "#2c3e50", fontSize: 28 }}>{selectedLesson.title}</h2>
                            <button onClick={closePreview} style={{ fontSize: 36, background: "none", border: "none", cursor: "pointer", color: "#bbb" }}>×</button>
                        </div>

                        <p><strong>Kỹ năng:</strong> <span style={skillBadge(selectedLesson.skillType)}>{selectedLesson.skillType.toUpperCase()}</span></p>

                        {selectedLesson.content && (
                            <div style={section}>
                                <h4>Nội dung bài đọc / nghe:</h4>
                                <div style={contentBox}>{selectedLesson.content}</div>
                            </div>
                        )}

                        {/* MEDIA – HỖ TRỢ YOUTUBE + LOCAL */}
                        {selectedLesson.mediaUrl && (
                            <div style={section}>
                                <h4>Media:</h4>
                                <div style={{ marginTop: 12, borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}>
                                    {/* YouTube */}
                                    {selectedLesson.mediaUrl.includes("youtube.com") || selectedLesson.mediaUrl.includes("youtu.be") ? (
                                        <iframe
                                            width="100%"
                                            height="480"
                                            src={
                                                selectedLesson.mediaUrl
                                                    .replace("watch?v=", "embed/")
                                                    .replace("youtu.be/", "www.youtube.com/embed/")
                                                    .split("&")[0]
                                            }
                                            title="Video bài học"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            style={{ borderRadius: 12 }}
                                        ></iframe>
                                    ) : 
                                    /* Audio */
                                    selectedLesson.mediaUrl.match(/\.(mp3|wav|ogg)$/i) ? (
                                        <audio controls style={{ width: "100%", padding: "12px", borderRadius: 12 }}>
                                            <source src={`http://localhost:5000${selectedLesson.mediaUrl}`} />
                                            Trình duyệt không hỗ trợ audio.
                                        </audio>
                                    ) : 
                                    /* Video local */
                                    (
                                        <video controls style={{ width: "100%", maxHeight: "500px", borderRadius: 12 }}>
                                            <source src={`http://localhost:5000${selectedLesson.mediaUrl}`} />
                                            Trình duyệt không hỗ trợ video.
                                        </video>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Writing */}
                        {selectedLesson.skillType === "writing" && selectedLesson.exercises?.[0]?.question && (
                            <div style={section}>
                                <h4>Câu hỏi Writing:</h4>
                                <div style={contentBox}>{selectedLesson.exercises[0].question}</div>
                            </div>
                        )}

                        {/* QUIZ – ĐÃ SỬA ĐÚNG 100% */}
                        {selectedLesson.quizzes && selectedLesson.quizzes.length > 0 && (
                            <div style={section}>
                                <h4 style={{ color: "#007bff", fontSize: 22 }}>
                                    Câu hỏi trắc nghiệm ({selectedLesson.quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0)} câu):
                                </h4>

                                {selectedLesson.quizzes.map((quizObj, quizIdx) => (
                                    <div key={quizObj._id || quizIdx} style={{ marginBottom: 36 }}>
                                        <h5 style={{ color: "#007bff", margin: "0 0 16px", fontSize: 18 }}>
                                            {quizObj.title || `Quiz ${quizIdx + 1}`}
                                        </h5>

                                        {quizObj.questions && quizObj.questions.length > 0 ? (
                                            quizObj.questions.map((q, qIdx) => (
                                                <div
                                                    key={q._id || qIdx}
                                                    style={{
                                                        marginBottom: 28,
                                                        padding: 24,
                                                        background: "#ffffff",
                                                        borderRadius: 16,
                                                        border: "1px solid #ddd",
                                                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                                    }}
                                                >
                                                    <p style={{ fontSize: 18, fontWeight: "bold", margin: "0 0 16px" }}>
                                                        {qIdx + 1}. {q.question || "Chưa có câu hỏi"}
                                                    </p>
                                                    <div style={{ marginLeft: 30 }}>
                                                        {q.options?.map((opt, i) => {
                                                            const letter = ["A", "B", "C", "D"][i];
                                                            const isCorrect = opt === q.correctAnswer;
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    style={{
                                                                        padding: "12px 18px",
                                                                        margin: "8px 0",
                                                                        background: isCorrect ? "#d4edda" : "#f8f9fa",
                                                                        border: isCorrect ? "2px solid #28a745" : "1px solid #ddd",
                                                                        borderRadius: 12,
                                                                        fontWeight: isCorrect ? "bold" : "normal",
                                                                        color: isCorrect ? "#155724" : "#333",
                                                                        display: "flex",
                                                                        justifyContent: "space-between",
                                                                        alignItems: "center",
                                                                        fontSize: 16
                                                                    }}
                                                                >
                                                                    <span>{letter}. {opt}</span>
                                                                    {isCorrect && (
                                                                        <span style={{
                                                                            background: "#28a745",
                                                                            color: "white",
                                                                            padding: "6px 14px",
                                                                            borderRadius: 30,
                                                                            fontSize: 13,
                                                                            fontWeight: "bold"
                                                                        }}>
                                                                            ĐÁP ÁN ĐÚNG
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p style={{ color: "#999", fontStyle: "italic" }}>Chưa có câu hỏi trong quiz này</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ textAlign: "right", marginTop: 40 }}>
                            <button onClick={closePreview} style={{ padding: "16px 36px", background: "#6c757d", color: "white", border: "none", borderRadius: 12, fontSize: 16 }}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loadingModal && <div style={{ textAlign: "center", padding: "80px", fontSize: 20, color: "#007bff" }}>Đang tải...</div>}
        </div>
    );
}

// STYLE
const backBtn = { padding: "12px 20px", background: "#6c757d", color: "white", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 15 };

const card = { background: "#f8f9fa", padding: 28, borderRadius: 16, margin: "24px 0", border: "1px solid #dee2e6" };

const inputStyle = { width: "100%", padding: "14px", borderRadius: 10, border: "1px solid #ccc", fontSize: 16, marginBottom: 16 };

const tableStyle = { width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" };

const th = { padding: "16px", textAlign: "left", background: "#007bff", color: "white", fontWeight: "600" };

const td = { padding: "14px", borderBottom: "1px solid #eee", verticalAlign: "middle" };

const btnStyle = (color) => {
    const colors = { green: "#28a745", blue: "#007bff", gray: "#6c757d", danger: "#dc3545", primary: "#007bff", orange: "#fd7e14" };
    return { margin: "0 6px", padding: "8px 14px", background: colors[color], color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "13px", fontWeight: 600 };
};

const skillBtn = (skill) => ({
    padding: "14px 24px",
    background: skill === "reading" ? "#17a2b8" : skill === "listening" ? "#28a745" : skill === "writing" ? "#ffc107" : "#dc3545",
    color: "white", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: "bold", fontSize: 15
});

const skillBadge = (skill) => ({
    padding: "8px 16px", borderRadius: 30,
    background: skill === "reading" ? "#17a2b8" :
                skill === "listening" ? "#28a745" :
                skill === "writing" ? "#ffc107" : "#dc3545",
    color: "white", fontSize: "13px", fontWeight: "bold", display: "inline-block"
});

const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 };

const modalContent = { background: "white", padding: "40px", borderRadius: 20, width: "90%", maxWidth: "950px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" };

const section = { margin: "28px 0", padding: "24px", background: "#f8f9fa", borderRadius: 16, border: "1px solid #e0e0e0" };

const contentBox = { padding: "20px", background: "white", borderRadius: 12, border: "2px dashed #007bff", whiteSpace: "pre-wrap", lineHeight: 1.8, fontSize: 16 };

export default CourseDetailForAdmin;