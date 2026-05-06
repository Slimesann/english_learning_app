import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Dashboard() {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.enrolledCourses && user.enrolledCourses.length > 0) {
            const formatted = user.enrolledCourses
                .map(enrolled => {
                    const course = enrolled.courseId;
                    
                    if (!course) {
                        console.warn("Course ID null/undefined:", enrolled);
                        return null;
                    }

                    const courseId = course._id?.toString();

                    if (!courseId) {
                        console.warn("Course ID không hợp lệ:", course);
                        return null;
                    }

                    const { progress = 0, courseInfo = {} } = enrolled;
                    const { title = "Đang tải...", description = "", totalLessons = 0 } = courseInfo;

                    return {
                        courseId,
                        title,
                        description,
                        stats: {
                            completedLessons: Math.min(progress, totalLessons),
                            totalLessons,
                            progressPercent: totalLessons > 0 ? Math.round((progress / totalLessons) * 100) : 0
                        }
                    };
                })
                .filter(Boolean);

            setCourses(formatted);
        } else {
            setCourses([]);
        }
        setLoading(false);
    }, [user]);

    if (loading) return <p style={{ textAlign: "center", padding: "40px" }}>Đang tải dữ liệu...</p>;

    return (
        <div style={{
            padding: "20px",
            maxWidth: "800px",
            margin: "0 auto",
            fontFamily: "system-ui, sans-serif"
        }}>
            <h2 style={{ fontSize: "28px", marginBottom: "16px", color: "#1e293b" }}>
                Dashboard
            </h2>
            {user && (
                <p style={{ fontSize: "16px", color: "#475569", marginBottom: "24px" }}>
                    Xin chào, <strong>{user.name}</strong>
                </p>
            )}

            <h3 style={{ fontSize: "20px", margin: "24px 0 16px", color: "#1e293b" }}>
                Khóa học của bạn
            </h3>

            {courses.length === 0 ? (
                <div style={{
                    textAlign: "center",
                    padding: "40px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    border: "2px dashed #cbd5e1"
                }}>
                    <p style={{ color: "#64748b", fontSize: "16px" }}>
                        Bạn chưa tham gia khóa học nào
                    </p>
                    <Link
                        to="/courses"
                        style={{
                            display: "inline-block",
                            marginTop: "12px",
                            padding: "10px 20px",
                            background: "#3b82f6",
                            color: "#fff",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: 600
                        }}
                    >
                        Khám phá khóa học
                    </Link>
                </div>
            ) : (
                <div>
                    {courses.map((course) => (
                        <div
                            key={course.courseId} 
                            style={{
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                padding: "20px",
                                marginBottom: "20px",
                                background: "#fff",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                                transition: "all 0.2s"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: "0 0 8px", fontSize: "18px", color: "#1e293b" }}>
                                        <Link
                                            to={`/courses/${course.courseId}`}
                                            style={{ textDecoration: "none", color: "inherit" }}
                                        >
                                            {course.title}
                                        </Link>
                                    </h4>
                                    <p style={{ margin: "0 0 12px", fontSize: "14px", color: "#64748b" }}>
                                        {course.description}
                                    </p>
                                </div>
                                <Link
                                    to={`/courses/${course.courseId}`}
                                    style={{
                                        padding: "8px 16px",
                                        background: "#10b981",
                                        color: "#fff",
                                        borderRadius: "6px",
                                        textDecoration: "none",
                                        fontSize: "14px",
                                        fontWeight: 600
                                    }}
                                >
                                    Vào học
                                </Link>
                            </div>

                            <div style={{ marginTop: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                    <span style={{ fontSize: "14px", color: "#475569" }}>Tiến độ</span>
                                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
                                        {course.stats.completedLessons} / {course.stats.totalLessons} bài
                                    </span>
                                </div>
                                <div style={{
                                    background: "#e2e8f0",
                                    borderRadius: "8px",
                                    height: "24px",
                                    overflow: "hidden",
                                    position: "relative"
                                }}>
                                    <div style={{
                                        width: `${course.stats.progressPercent}%`,
                                        background: course.stats.progressPercent >= 100 ? "#10b981" : "#3b82f6",
                                        height: "100%",
                                        borderRadius: "8px",
                                        transition: "width 0.6s ease",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#fff",
                                        fontSize: "12px",
                                        fontWeight: 600
                                    }}>
                                        {course.stats.progressPercent}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;