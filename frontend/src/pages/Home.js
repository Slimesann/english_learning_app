import React, { useEffect, useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api.js";

function Home() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [availableCourses, setAvailableCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const lastEnrolledRef = useRef(null);

    useEffect(() => {
        const fetchAvailableCourses = async () => {
            try {
                const res = await api.get("/courses", { params: { limit: 6 } });
                setAvailableCourses(res.data.courses || []);
            } catch (err) {
                console.error("Lỗi load khóa học:", err);
                setAvailableCourses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAvailableCourses();
    }, []);

    const enrolledCourses = user?.enrolledCourses || [];

    useEffect(() => {
        if (!lastEnrolledRef.current || enrolledCourses.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    navigate("/courses");
                }
            },
            { threshold: 0.8 }
        );

        observer.observe(lastEnrolledRef.current);

        return () => {
            if (lastEnrolledRef.current) {
                observer.unobserve(lastEnrolledRef.current);
            }
        };
    }, [enrolledCourses.length, navigate]);

    if (loading) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
            <h1 style={{ textAlign: "center", marginBottom: "10px" }}>Chào mừng đến với English Learning App</h1>
            <p style={{ textAlign: "center", marginBottom: "40px", color: "#666" }}>
                Hãy bắt đầu học tiếng Anh với các khóa học phù hợp với bạn.
            </p>

            {/* SECTION 1: KHÓA HỌC ĐÃ HỌC */}
            <section style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Khóa học của bạn</h2>
                {enrolledCourses.length > 0 ? (
                    <div style={horizontalSectionStyle}>
                        {enrolledCourses.map((enroll, index) => {
                            const course = enroll.courseInfo || {};
                            const progress = enroll.progress || 0;
                            const percent = course.totalLessons > 0 ? Math.round((progress / course.totalLessons) * 100) : 0;

                            const isLastItem = index === enrolledCourses.length - 1;

                            return (
                                <div
                                    key={enroll.courseId}
                                    ref={isLastItem ? lastEnrolledRef : null} // ← Gắn ref vào phần tử cuối
                                    style={{
                                        ...courseCardStyle,
                                        cursor: "default",
                                        borderRadius: "12px",
                                        overflow: "hidden"
                                    }}
                                >
                                    <div style={{ padding: "16px", background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                                        <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "#1e293b" }}>{course.title}</h3>
                                        <p style={{ margin: "0 0 12px", color: "#666", fontSize: "14px" }}>{course.description || "Khóa học tiếng Anh"}</p>
                                        <div style={{ marginBottom: "12px" }}>
                                            <span style={{ fontSize: "14px", color: "#666" }}>Tiến độ:</span>
                                            <div style={{ marginTop: "4px", background: "#e2e8f0", borderRadius: "6px", height: "8px", overflow: "hidden" }}>
                                                <div style={{
                                                    width: `${percent}%`,
                                                    background: percent >= 100 ? "#10b981" : "#3b82f6",
                                                    height: "100%",
                                                    borderRadius: "6px",
                                                    transition: "width 0.3s ease"
                                                }}></div>
                                            </div>
                                            <small style={{ color: "#666" }}>{progress}/{course.totalLessons} bài ({percent}%)</small>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={emptySectionStyle}>
                        <p style={{ textAlign: "center", color: "#666", fontSize: "16px" }}>
                            Bạn chưa tham gia khóa học nào. <Link to="/courses" style={{ color: "#3b82f6" }}>Khám phá ngay!</Link>
                        </p>
                    </div>
                )}
            </section>

            {/* SECTION 2: KHÓA HỌC CHƯA ĐĂNG KÝ */}
            <section style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Khóa học gợi ý</h2>
                {availableCourses.length > 0 ? (
                    <div style={horizontalSectionStyle}>
                        {availableCourses.map((course) => (
                            <Link key={course._id} to={`/courses/${course._id}`} style={courseCardStyle}>
                                <div style={{ padding: "16px", borderRadius: "12px", background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                                    <h3 style={{ margin: "0 0 8px", fontSize: "18px", color: "#1e293b" }}>{course.title}</h3>
                                    <p style={{ margin: "0 0 12px", color: "#666", fontSize: "14px" }}>{course.description || "Khóa học tiếng Anh"}</p>
                                    <div style={{ marginBottom: "12px" }}>
                                        <small style={{ color: "#666" }}>{course.lessons?.length || 0} bài • Cấp độ: {course.level}</small>
                                    </div>
                                    <button style={viewBtnStyle}>Tham gia ngay</button>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={emptySectionStyle}>
                        <p style={{ textAlign: "center", color: "#666", fontSize: "16px" }}>
                            Chưa có khóa học gợi ý. <Link to="/courses" style={{ color: "#3b82f6" }}>Xem tất cả!</Link>
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}

const sectionStyle = {
    marginBottom: "40px"
};

const sectionTitleStyle = {
    fontSize: "24px",
    color: "#1e293b",
    marginBottom: "16px",
    textAlign: "center"
};

const horizontalSectionStyle = {
    display: "flex",
    overflowX: "auto",
    gap: "20px",
    padding: "10px 0",
    scrollbarWidth: "thin",
    "&::-webkit-scrollbar": {
        height: "8px"
    },
    "&::-webkit-scrollbar-thumb": {
        background: "#cbd5e1",
        borderRadius: "4px"
    }
};

const courseCardStyle = {
    flex: "0 0 300px",
    textDecoration: "none",
    transition: "transform 0.2s, box-shadow 0.2s"
};

const viewBtnStyle = {
    width: "100%",
    padding: "10px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s"
};

const emptySectionStyle = {
    padding: "40px",
    textAlign: "center",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "2px dashed #cbd5e1"
};

export default Home;