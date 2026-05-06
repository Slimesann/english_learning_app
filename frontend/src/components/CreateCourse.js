// src/components/CreateCourse.js
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api.js";

export default function CreateCourse({ courseIdToEdit, onSave }) {
    const [courseName, setCourseName] = useState("");
    const [description, setDescription] = useState("");
    const [level, setLevel] = useState("beginner");
    const [courseId, setCourseId] = useState(null);
    const [lessonTitle, setLessonTitle] = useState("");
    const [lessons, setLessons] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy user hiện tại
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const allowedRoles = ["admin", "instructor"];
    const isAllowed = allowedRoles.includes(currentUser.role);

    // === useEffect 1: Load course khi chỉnh sửa ===
    useEffect(() => {
        if (courseIdToEdit && isAllowed) {
            const fetchCourse = async () => {
                try {
                    const endpoint = currentUser.role === "admin"
                        ? `/courses/${courseIdToEdit}`
                        : `/instructor/courses/${courseIdToEdit}`;

                    const res = await api.get(endpoint);
                    const course = res.data;
                    setCourseName(course.title || "");
                    setDescription(course.description || "");
                    setLevel(course.level || "beginner");
                    setCourseId(course._id);
                    setLessons(course.lessons || []);
                } catch (err) {
                    console.error("Lỗi load course:", err);
                    alert("Không thể tải thông tin khóa học!");
                }
            };
            fetchCourse();
        }
    }, [courseIdToEdit, currentUser.role, isAllowed]);

    // === useEffect 2: Cập nhật lessons từ query params ===
    useEffect(() => {
        if (!isAllowed) return;

        const searchParams = new URLSearchParams(location.search);
        const newLessonId = searchParams.get("newLessonId");
        const title = searchParams.get("title");
        const skill = searchParams.get("skill");

        if (newLessonId && title && skill && courseId) {
            setLessons(prev => [
                ...prev,
                { _id: newLessonId, title: decodeURIComponent(title), skillType: skill }
            ]);
            navigate(location.pathname, { replace: true });
        }
    }, [location.search, courseId, navigate, isAllowed]);

    // === KIỂM TRA QUYỀN ===
    if (!isAllowed) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
                <h2>Truy cập bị từ chối</h2>
                <p>Bạn không có quyền tạo hoặc chỉnh sửa khóa học!</p>
            </div>
        );
    }

    // === TẠO / CẬP NHẬT KHÓA HỌC ===
    const handleSaveCourse = async () => {
        if (!courseName.trim()) return alert("Vui lòng nhập tên khóa học!");

        const courseData = {
            title: courseName,
            level,
            description,
            // ĐÃ SỬA: MẶC ĐỊNH NHÁP + CHỜ DUYỆT
            isPublished: false,
            isApproved: currentUser.role === "admin" ? true : false
        };

        try {
            let res;
            if (courseIdToEdit) {
                // CẬP NHẬT: Giữ nguyên isApproved nếu admin, instructor thì không thay đổi
                const endpoint = currentUser.role === "admin"
                    ? `/courses/${courseIdToEdit}`
                    : `/instructor/courses/${courseIdToEdit}`;

                await api.put(endpoint, courseData);
                alert("Cập nhật khóa học thành công!");
            } else {
                // TẠO MỚI
                const endpoint = currentUser.role === "admin"
                    ? "/courses"
                    : "/instructor/courses";

                res = await api.post(endpoint, courseData);
                setCourseId(res.data._id);
                alert("Tạo khóa học thành công!");
            }
            if (onSave) onSave();
        } catch (err) {
            alert(err.response?.data?.error || "Lỗi khi lưu khóa học!");
        }
    };

    // === TẠO BÀI HỌC ===
    const handleCreateLesson = async (skill) => {
        if (!lessonTitle.trim()) return alert("Nhập tên bài học!");
        if (!courseId) return alert("Hãy tạo khóa học trước!");

        try {
            const endpoint = currentUser.role === "admin"
                ? "/lessons"
                : `/instructor/courses/${courseId}/lessons`;

            const res = await api.post(endpoint, {
                title: lessonTitle,
                courseId,
                skillType: skill,
            });

            const lessonId = res.data._id;
            alert(`Đã tạo bài học: ${lessonTitle} (${skill})`);

            const path = `/course/${courseId}/lesson/${lessonId}/${skill.toLowerCase()}`;
            navigate(path);
        } catch (err) {
            alert(err.response?.data?.error || "Lỗi khi tạo bài học!");
        }
    };

    // === HOÀN TẤT ===
    const handleFinish = () => {
        const backPath = currentUser.role === "admin" ? "/admin" : "/instructor";
        navigate(backPath);
    };

    return (
        <div style={{ padding: "20px", maxWidth: "700px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
            <h2 style={{ color: "#1976d2" }}>
                {courseIdToEdit ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
            </h2>

            {/* Form Course */}
            <div style={{ background: "#f9f9f9", padding: "15px", borderRadius: 8, marginBottom: "20px" }}>
                <h3>Thông tin khóa học</h3>
                <input
                    type="text"
                    placeholder="Tên khóa học"
                    value={courseName}
                    onChange={e => setCourseName(e.target.value)}
                    style={inputStyle}
                />
                <textarea
                    placeholder="Mô tả (không bắt buộc)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    style={{ ...inputStyle, height: 80 }}
                />
                <select value={level} onChange={e => setLevel(e.target.value)} style={inputStyle}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                </select>

                {/* Trạng thái (chỉ hiển thị khi chỉnh sửa) */}
                {courseIdToEdit && (
                    <div style={{ margin: "10px 0", fontSize: "14px", color: "#555" }}>
                        <p>
                            <strong>Trạng thái:</strong> {currentUser.role === "admin" ? "Có thể duyệt" : "Chờ duyệt"}
                        </p>
                    </div>
                )}

                <button onClick={handleSaveCourse} style={btnSuccess}>
                    {courseIdToEdit ? "Cập nhật khóa học" : "Tạo khóa học"}
                </button>
            </div>

            {/* Tạo Lesson */}
            {courseId && (
                <div style={{ background: "#f0f8ff", padding: "15px", borderRadius: 8 }}>
                    <h3>Tạo bài học mới</h3>
                    <input
                        type="text"
                        placeholder="Tên bài học"
                        value={lessonTitle}
                        onChange={e => setLessonTitle(e.target.value)}
                        style={inputStyle}
                    />
                    <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {["reading", "listening", "writing", "speaking"].map(skill => (
                            <button
                                key={skill}
                                onClick={() => handleCreateLesson(skill)}
                                style={btnSkill(skill)}
                            >
                                {skill.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {lessons.length > 0 && (
                        <div style={{ marginTop: "15px" }}>
                            <h4>Bài học đã tạo ({lessons.length}):</h4>
                            <ul style={{ paddingLeft: "20px", margin: "8px 0" }}>
                                {lessons.map(l => (
                                    <li key={l._id} style={{ margin: "4px 0" }}>
                                        {l.title} <strong style={{ color: "#555" }}>[{l.skillType.toUpperCase()}]</strong>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Nút hoàn tất */}
            {courseId && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button onClick={handleFinish} style={btnSuccess}>
                        Hoàn tất & quay lại
                    </button>
                </div>
            )}
        </div>
    );
}

// === STYLES ===
const inputStyle = {
    width: "95%",
    padding: "10px",
    margin: "8px 0",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: "16px"
};

const btnSuccess = {
    background: "#28a745",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px"
};

const btnSkill = (skill) => ({
    background: {
        reading: "#17a2b8",
        listening: "#ffc107",
        writing: "#dc3545",
        speaking: "#28a745"
    }[skill],
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: "14px"
});