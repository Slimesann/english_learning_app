import React, { useState, useEffect, useCallback, memo } from "react";
import CreateCourse from "./CreateCourse.js";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import Spinner from "./Spinner.js";

const SkeletonRow = () => (
    <tr style={{ background: "#f8f9fa" }}>
        {[...Array(7)].map((_, i) => (
        <td key={i} style={tdStyle}>
            <div style={{ height: 18, background: "#e0e0e0", borderRadius: 8, width: i === 1 ? "75%" : "55%" }} />
        </td>
        ))}
    </tr>
);

const UserRow = memo(({ user }) => (
    <tr style={trStyle}>
        <td style={tdStyle}>{user._id?.slice(-8) || "???"}</td>
        <td style={{ ...tdStyle, display: "flex", alignItems: "center", gap: 10 }}>
        {user.avatar && (
            <img
            src={user.avatar.startsWith("http") ? user.avatar : `http://localhost:5000${user.avatar}`}
            alt="Avatar"
            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }}
            />
        )}
        <span>{user.name || "Chưa đặt tên"}</span>
        </td>
        <td style={tdStyle}>{user.email}</td>
        <td style={tdStyle}>
        <span style={roleBadge(user.role || "user")}>
            {(user.role || "user").toUpperCase()}
        </span>
        </td>
        <td style={tdStyle}>
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "-"}
        </td>
    </tr>
    ));

    const CourseRow = memo(({ course, isAdmin, onToggleApprove, onTogglePublish, onEdit, onDelete, navigate }) => (
    <tr style={trStyle}>
        <td style={tdStyle}>{course._id?.slice(-6)}</td>
        <td style={tdStyle}><strong>{course.title || "Không tiêu đề"}</strong></td>
        <td style={tdStyle}>{course.lessons?.length || 0}</td>
        <td style={tdStyle}>
        <span style={roleBadge(course.createdBy?.role || "unknown")}>
            {course.createdBy?.name || course.createdBy?.email || "Unknown"}
        </span>
        </td>
        <td style={tdStyle}>
        <button onClick={() => onToggleApprove(course._id)} style={actionBtnStyle(course.isApproved ? "#ff9800" : "#4caf50")}>
            {course.isApproved ? "Bỏ duyệt" : "Duyệt"}
        </button>
        </td>
        <td style={tdStyle}>
        <button
            onClick={() => onTogglePublish(course._id)}
            disabled={!course.isApproved}
            style={actionBtnStyle(course.isPublished ? "#f44336" : "#2196f3", !course.isApproved)}
            title={!course.isApproved ? "Phải duyệt trước!" : ""}
        >
            {course.isPublished ? "Ẩn" : "Hiện"}
        </button>
        </td>
        <td style={tdStyle}>
        <button onClick={() => navigate(`/admin/course/${course._id}/details`)} style={actionBtnStyle("#1e88e5")}>
            Xem
        </button>
        {isAdmin && course.createdBy?.role === "admin" && (
            <>
            <button onClick={() => onEdit(course._id)} style={actionBtnStyle("#1976d2")}>Sửa</button>
            <button onClick={() => onDelete(course._id, course.title)} style={actionBtnStyle("#d32f2f")}>Xóa</button>
            </>
        )}
        </td>
    </tr>
));

export default function AdminPanel() {
    const [tab, setTab] = useState("users");
    const [showCreateCourse, setShowCreateCourse] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState(null);

    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = currentUser.role === "admin";

    const fetchUsers = useCallback(async () => {
        setLoadingUsers(true);
        try {
        const res = await api.get("/users");

        if (res.data?.users) {
            setUsers(res.data.users);
            setTotalUsers(res.data.total || res.data.users.length);
        } else if (Array.isArray(res.data)) {
            setUsers(res.data);
            setTotalUsers(res.data.length);
        } else {
            setUsers([]);
            setTotalUsers(0);
        }
        } catch (err) {
        console.error("Lỗi tải users:", err);
        setUsers([]);
        setTotalUsers(0);
        } finally {
        setLoadingUsers(false);
        }
    }, []);

    const fetchCourses = useCallback(async () => {
        setLoadingCourses(true);
        try {
        const res = await api.get("/courses/all");
        const courseList = Array.isArray(res.data) ? res.data : [];
        setCourses(courseList);
        } catch (err) {
        console.error("Lỗi tải courses:", err);
        setCourses([]);
        } finally {
        setLoadingCourses(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        fetchCourses();
    }, [fetchUsers, fetchCourses]);

    useEffect(() => {
        if (tab === "users") fetchUsers();
        if (tab === "courses") fetchCourses();
    }, [tab]);

    const handleToggleApprove = async (id) => {
        if (!window.confirm("Thay đổi trạng thái duyệt?")) return;
        try {
        const res = await api.patch(`/courses/${id}/toggle-approve`);
        setCourses(prev => prev.map(c => c._id === id ? { ...c, isApproved: res.data.course?.isApproved ?? !c.isApproved } : c));
        } catch (err) {
        alert("Lỗi server");
        }
    };

    const handleTogglePublish = async (id) => {
        try {
        const res = await api.patch(`/courses/${id}/toggle-publish`);
        setCourses(prev => prev.map(c => c._id === id ? { ...c, isPublished: res.data.isPublished } : c));
        } catch (err) {
        alert("Lỗi server");
        }
    };

    const handleEditCourse = (id) => {
        if (!isAdmin) return alert("Không có quyền!");
        setEditingCourseId(id);
        setShowCreateCourse(true);
    };

    const handleDeleteCourse = async (id, title) => {
        if (!isAdmin || !window.confirm(`Xóa khóa học "${title}"?`)) return;
        try {
        await api.delete(`/courses/${id}`);
        alert("Xóa thành công!");
        fetchCourses();
        } catch (err) {
        alert("Xóa thất bại");
        }
    };

    if (showCreateCourse) {
        return (
        <div style={containerStyle}>
            <div style={panelStyle}>
            <button onClick={() => { setShowCreateCourse(false); setEditingCourseId(null); }} style={backBtnStyle}>
                ← Quay lại Admin Panel
            </button>
            <CreateCourse courseIdToEdit={editingCourseId} onSave={fetchCourses} />
            </div>
        </div>
        );
    }

    return (
        <div style={containerStyle}>
        <div style={panelStyle}>
            <h2 style={titleStyle}>Admin Control Panel</h2>
            <p style={isAdmin ? adminTextStyle : userTextStyle}>
            {isAdmin ? "Bạn là Admin – Toàn quyền" : "Bạn không có quyền admin"}
            </p>

            <div style={tabContainerStyle}>
            <button onClick={() => setTab("users")} style={tab === "users" ? activeTabStyle : inactiveTabStyle}>
                Người dùng ({totalUsers})
            </button>
            <button onClick={() => setTab("courses")} style={tab === "courses" ? activeTabStyle : inactiveTabStyle}>
                Khóa học ({courses.length})
            </button>
            </div>

            {tab === "users" && (
            <div>
                {loadingUsers ? (
                <table style={tableStyle}>
                    <tbody>
                    {[...Array(10)].map((_, i) => (
                        <SkeletonRow key={i} />
                    ))}
                    </tbody>
                </table>
                ) : users.length === 0 ? (
                <p style={emptyStyle}>Không có người dùng nào.</p>
                ) : (
                <div style={scrollTableStyle}>
                    <table style={tableStyle}>
                    <thead>
                        <tr>
                        <th style={thStyle}>ID</th>
                        <th style={thStyle}>Tên</th>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>Vai trò</th>
                        <th style={thStyle}>Ngày tạo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                        <UserRow key={u._id} user={u} />
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </div>
            )}

            {tab === "courses" && (
            <>
                <div style={headerStyle}>
                <h3 style={sectionTitleStyle}>Quản lý khóa học</h3>
                <button
                    onClick={() => setShowCreateCourse(true)}
                    style={isAdmin ? createBtnStyle : createBtnDisabledStyle}
                    disabled={!isAdmin}
                >
                    + Tạo khóa học mới
                </button>
                </div>

                {loadingCourses ? (
                <div style={{ padding: "80px 0", textAlign: "center" }}>
                    <Spinner />
                </div>
                ) : courses.length === 0 ? (
                <p style={emptyStyle}>Chưa có khóa học nào.</p>
                ) : (
                <div style={scrollTableStyle}>
                    <table style={tableStyle}>
                    <thead>
                        <tr>
                        <th style={thStyle}>ID</th>
                        <th style={thStyle}>Tên khóa học</th>
                        <th style={thStyle}>Bài học</th>
                        <th style={thStyle}>Người tạo</th>
                        <th style={thStyle}>Duyệt</th>
                        <th style={thStyle}>Hiển thị</th>
                        <th style={thStyle}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map(c => (
                        <CourseRow
                            key={c._id}
                            course={c}
                            isAdmin={isAdmin}
                            onToggleApprove={handleToggleApprove}
                            onTogglePublish={handleTogglePublish}
                            onEdit={handleEditCourse}
                            onDelete={handleDeleteCourse}
                            navigate={navigate}
                        />
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </>
            )}
        </div>
        </div>
    );
}

const containerStyle = { minHeight: "100vh", background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)", display: "flex", justifyContent: "center", padding: "30px 15px" };
const panelStyle = { width: "100%", maxWidth: "1400px", background: "#fff", borderRadius: "24px", padding: "40px", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" };
const titleStyle = { textAlign: "center", fontSize: "36px", fontWeight: "800", color: "#0d47a1", margin: "0 0 10px" };
const adminTextStyle = { textAlign: "center", color: "#2e7d32", fontWeight: "bold", fontSize: "18px", marginBottom: "30px" };
const userTextStyle = { ...adminTextStyle, color: "#c62828" };
const tabContainerStyle = { display: "flex", justifyContent: "center", gap: "20px", marginBottom: "35px" };
const activeTabStyle = { padding: "16px 40px", background: "#1565c0", color: "#fff", border: "none", borderRadius: "18px", fontWeight: "bold", fontSize: "17px", cursor: "pointer", boxShadow: "0 8px 25px rgba(21,101,192,0.35)" };
const inactiveTabStyle = { ...activeTabStyle, background: "#e0e0e0", color: "#555", boxShadow: "none" };
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "15px" };
const sectionTitleStyle = { margin: 0, fontSize: "26px", color: "#333" };
const createBtnStyle = { background: "#2e7d32", color: "#fff", padding: "14px 28px", border: "none", borderRadius: "16px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", boxShadow: "0 6px 20px rgba(46,125,50,0.4)" };
const createBtnDisabledStyle = { ...createBtnStyle, background: "#aaa", cursor: "not-allowed", boxShadow: "none" };
const backBtnStyle = { padding: "12px 24px", background: "#607d8b", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "600", marginBottom: "20px" };
const scrollTableStyle = { overflow: "auto", maxHeight: "70vh", borderRadius: "16px" };
const tableStyle = { width: "100%", borderCollapse: "separate", borderSpacing: "0 12px" };
const thStyle = { padding: "18px", background: "#e3f2fd", color: "#0d47a1", textAlign: "left", fontWeight: "700", fontSize: "15px" };
const trStyle = { background: "#ffffff", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transition: "0.3s", borderRadius: "12px" };
const tdStyle = { padding: "16px 18px", verticalAlign: "middle" };
const actionBtnStyle = (bg, disabled = false) => ({
    padding: "8px 16px",
    background: disabled ? "#ccc" : bg,
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    margin: "0 4px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1
});
const roleBadge = (role) => ({
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#fff",
    background: role === "admin" ? "#c62828" : role === "instructor" ? "#ff8f00" : "#2e7d32"
});
const emptyStyle = { textAlign: "center", padding: "60px", color: "#777", fontSize: "18px", fontStyle: "italic" };
const searchStyle = { width: "100%", padding: "16px 20px", marginBottom: "25px", borderRadius: "14px", border: "2px solid #ddd", fontSize: "16px", outline: "none", transition: "0.3s" };