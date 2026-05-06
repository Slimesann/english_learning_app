import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import CreateCourse from "./CreateCourse";

function InstructorPanel() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [showCreateCourse, setShowCreateCourse] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get("/instructor/courses");
            setCourses(res.data);
        } catch (err) {
            alert("Lỗi tải khóa học");
        }
    };

    const handleDeleteCourse = async (courseId, courseTitle) => {
        const confirmDelete = window.confirm(
            `Bạn có chắc chắn muốn xóa khóa học:\n"${courseTitle}"?\n\nHành động này không thể hoàn tác!`
        );
        if (!confirmDelete) return;

        try {
            await api.delete(`/instructor/courses/${courseId}`);
            alert("Xóa khóa học thành công!");
            fetchCourses();
        } catch (err) {
            alert("Xóa thất bại: " + (err.response?.data?.message || "Lỗi server"));
        }
    };

    const handleEditCourse = (courseId) => {
        setEditingCourseId(courseId);
        setShowCreateCourse(true);
    };

    if (showCreateCourse) {
        return (
            <div style={{ padding: "20px" }}>
                <button
                    onClick={() => {
                        setShowCreateCourse(false);
                        setEditingCourseId(null);
                    }}
                    style={{ marginBottom: "15px", background: "#ccc", padding: "8px 15px", border: "none", borderRadius: 4 }}
                >
                    Quay lại danh sách khóa học
                </button>
                <CreateCourse courseIdToEdit={editingCourseId} onSave={fetchCourses} />
            </div>
        );
    }

    if (user?.role !== "instructor") {
        return (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <h2>Chỉ giảng viên mới xem được trang này</h2>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h2 style={{ textAlign: "center", color: "#1976d2" }}>Instructor Control Panel</h2>
            <p style={{ textAlign: "center", marginBottom: "20px" }}>
                Xin chào, <strong>{user.name}</strong>! Quản lý khóa học của bạn.
            </p>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <button
                    onClick={() => setShowCreateCourse(true)}
                    style={{ background: "#28a745", color: "white", padding: "10px 20px", border: "none", borderRadius: 6, fontSize: "16px" }}
                >
                    + Tạo khóa học mới
                </button>
            </div>

            <div style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "10px", background: "#fff" }}>
                <h3 style={{ margin: "0 0 15px", color: "#333" }}>
                    Danh sách khóa học ({courses.length})
                </h3>

                {courses.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}>
                        Chưa có khóa học nào. Hãy tạo khóa học đầu tiên!
                    </p>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8f9fa" }}>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Tên khóa học</th>
                                <th style={thStyle}>Cấp độ</th>
                                <th style={thStyle}>Bài học</th>
                                <th style={thStyle}>Trạng thái</th>
                                <th style={thStyle}>Hiển thị</th>
                                <th style={thStyle}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((c) => (
                                <tr key={c._id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={tdStyle}>{c._id.slice(-6)}</td>

                                    <td style={tdStyle}>
                                        <strong>{c.title}</strong>
                                    </td>

                                    <td style={tdStyle}>
                                        <span style={{ textTransform: "capitalize" }}>{c.level}</span>
                                    </td>

                                    <td style={tdStyle}>{c.lessons?.length || 0}</td>

                                    <td style={tdStyle}>
                                        <span
                                            style={{
                                                display: "block",
                                                padding: "4px 8px",
                                                borderRadius: 4,
                                                background: c.isApproved ? "#4caf50" : "#ff9800",
                                                color: "white",
                                                fontSize: "12px",
                                                textAlign: "center"
                                            }}
                                        >
                                            {c.isApproved ? "Đã duyệt" : "Chờ duyệt"}
                                        </span>
                                    </td>

                                    <td style={tdStyle}>
                                        <span
                                            style={{
                                                display: "block",
                                                padding: "4px 8px",
                                                borderRadius: 4,
                                                background: c.isPublished ? "#28a745" : "#dc3545",
                                                color: "white",
                                                fontSize: "12px",
                                                textAlign: "center"
                                            }}
                                        >
                                            {c.isPublished ? "Hiển thị" : "Ẩn"}
                                        </span>
                                    </td>

                                    <td style={tdStyle}>
                                        <button
                                            onClick={() => navigate(`/admin/course/${c._id}/details`)}
                                            style={btnStyle("#17a2b8")}
                                            title="Xem chi tiết"
                                        >
                                            Xem
                                        </button>

                                        <button
                                            onClick={() => handleEditCourse(c._id)}
                                            style={btnStyle("#007bff")}
                                            title="Chỉnh sửa"
                                        >
                                            Sửa
                                        </button>

                                        <button
                                            onClick={() => handleDeleteCourse(c._id, c.title)}
                                            style={btnStyle("#dc3545")}
                                            title="Xóa khóa học"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

const thStyle = {
    padding: "12px",
    border: "1px solid #ddd",
    background: "#f8f9fa",
    textAlign: "left",
    fontWeight: "bold"
};

const tdStyle = {
    padding: "10px",
    border: "1px solid #ddd"
};

const btnStyle = (bg) => ({
    margin: "0 3px",
    padding: "6px 10px",
    background: bg,
    color: "white",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "12px"
});

export default InstructorPanel;