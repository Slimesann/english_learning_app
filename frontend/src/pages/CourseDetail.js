import React, { useEffect, useState, useContext, useMemo, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCourseById, enrollCourse } from "../services/courseService";
import { getCourseProgress } from "../services/progress";
import { getReviewsByCourse, createReview } from "../services/reviewService";
import { AuthContext } from "../context/AuthContext";

function CourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, refreshUser, loading: authLoading } = useContext(AuthContext);

    const courseIdStr = useMemo(() => (courseId ? String(courseId) : null), [courseId]);

    const [course, setCourse] = useState(null);
    const [courseProgress, setCourseProgress] = useState({
        stats: { totalLessons: 0, completedLessons: 0, progressPercent: 0 },
        lessons: []
    });
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [error, setError] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
    };

    const compareCourseId = useCallback((enrolledCourseId, targetId) => {
        if (!enrolledCourseId || !targetId) return false;
        return (enrolledCourseId._id?.toString() || String(enrolledCourseId)) === targetId;
    }, []);

    const isEnrolled = useMemo(() => {
        return !!user?.enrolledCourses?.some(e => compareCourseId(e.courseId, courseIdStr));
    }, [user?.enrolledCourses, courseIdStr, compareCourseId]);

    const enrolledData = useMemo(() => {
        return user?.enrolledCourses?.find(e => compareCourseId(e.courseId, courseIdStr));
    }, [user?.enrolledCourses, courseIdStr, compareCourseId]);

    const userProgressFallback = enrolledData?.progress || 0;
    const courseInfoFromUser = enrolledData?.courseInfo;

    const displayTitle = course?.title || courseInfoFromUser?.title || "Đang tải...";
    const displayDescription = course?.description || courseInfoFromUser?.description || "Đang tải mô tả...";

    const totalLessons = useMemo(() => {
        return (
            courseProgress.stats.totalLessons ||
            courseInfoFromUser?.totalLessons ||
            course?.lessons?.length ||
            0
        );
    }, [courseProgress.stats.totalLessons, courseInfoFromUser?.totalLessons, course?.lessons?.length]);

    useEffect(() => {
        let isMounted = true;
        if (isAuthenticated && isMounted) refreshUser();
        return () => { isMounted = false; };
    }, [isAuthenticated]);

    useEffect(() => {
        if (!courseIdStr) {
            setError("ID khóa học không hợp lệ");
            setLoading(false);
            return;
        }

        let isMounted = true;
        const init = async () => {
            try {
                setError(null);
                setLoading(true);
                const data = await getCourseById(courseIdStr);
                if (!isMounted || !data?._id) throw new Error("Khóa học không tồn tại");
                setCourse(data);

                if (isAuthenticated && isEnrolled) {
                    const progressData = await getCourseProgress(courseIdStr);
                    if (isMounted) setCourseProgress(progressData);
                }
            } catch (err) {
                if (isMounted) setError(err.response?.data?.error || err.message || "Không thể tải khóa học");
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        if (!authLoading) init();
        return () => { isMounted = false; };
    }, [courseIdStr, isAuthenticated, authLoading, isEnrolled]);

    useEffect(() => {
        if (!course?._id) return;
        const fetchReviews = async () => {
            try {
                setReviewsLoading(true);
                const data = await getReviewsByCourse(course._id);
                setReviews(data.reviews || []);
            } catch (err) {
                console.error("Lỗi tải đánh giá:", err);
                setReviews([]);
            } finally {
                setReviewsLoading(false);
            }
        };
        fetchReviews();
    }, [course?._id]);

    const completionRate = useMemo(() => {
        if (courseProgress.stats.progressPercent > 0) return courseProgress.stats.progressPercent;
        return totalLessons > 0 ? Math.round((userProgressFallback / totalLessons) * 100) : 0;
    }, [courseProgress.stats.progressPercent, userProgressFallback, totalLessons]);

    const sortedLessonsWithProgress = useMemo(() => {
        if (!course?.lessons) return [];
        const progressMap = {};
        courseProgress.lessons.forEach(lp => {
            progressMap[lp.lessonId] = { completed: lp.completed, score: lp.score || 0 };
        });
        return [...course.lessons]
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(lesson => ({
                ...lesson,
                completed: !!progressMap[lesson._id]?.completed,
                score: progressMap[lesson._id]?.score || 0
            }));
    }, [course?.lessons, courseProgress.lessons]);

    const nextLesson = useMemo(() => {
        return sortedLessonsWithProgress.find(l => !l.completed) || null;
    }, [sortedLessonsWithProgress]);

    const SKILL_CONFIG = {
        speaking:      { name: "Speaking",      color: "#ec4899", bg: "#fdf2f8", icon: "Speaking" },
        listening:     { name: "Listening",     color: "#8b5cf6", bg: "#f5f3ff", icon: "Ear" },
        reading:       { name: "Reading",       color: "#06b6d4", bg: "#ecfeff", icon: "Book" },
        writing:       { name: "Writing",       color: "#f59e0b", bg: "#fffbeb", icon: "Pen" },
    };

    const handleEnroll = async () => {
        if (!isAuthenticated) return navigate("/login");
        if (isEnrolled) return showToast("Bạn đã thêm khóa học này rồi!", "info");

        setEnrolling(true);
        try {
            const result = await enrollCourse(courseIdStr);
            await refreshUser();
            showToast(result.msg || "Đã thêm khóa học thành công!", "success");
        } catch (err) {
            const msg = err.response?.data?.msg || err.response?.data?.error || "Lỗi khi thêm khóa học";
            showToast(msg, "error");
        } finally {
            setEnrolling(false);
        }
    };

    const handleStartLearning = () => {
        if (!isEnrolled || !courseIdStr) return;
        const target = nextLesson || sortedLessonsWithProgress[0];
        if (target) {
            navigate(`/courses/${courseIdStr}/lessons/${target._id}`);
        } else {
            showToast("Khóa học chưa có bài học nào.", "info");
        }
    };

    const handleSubmitReview = async () => {
        if (rating === 0) return showToast("Vui lòng chọn số sao!", "error");

        setSubmitting(true);
        try {
            await createReview(course._id, { rating, comment: comment.trim() || null });
            showToast("Cảm ơn bạn đã đánh giá!", "success");
            setRating(0);
            setComment("");
            const data = await getReviewsByCourse(course._id);
            setReviews(data.reviews || []);
        } catch (err) {
            const msg = err.response?.data?.msg || "Không thể gửi đánh giá. Có thể bạn đã đánh giá rồi!";
            showToast(msg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div style={{ padding: "120px 20px", textAlign: "center", background: "#f8fafc" }}>
                <div style={{ fontSize: "48px", marginBottom: "20px", color: "#94a3b8" }}>Loading...</div>
                <p style={{ color: "#64748b", fontSize: "18px" }}>Đang tải chi tiết khóa học...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: "80px 20px", textAlign: "center", background: "#f8fafc", minHeight: "100vh" }}>
                <p style={{ color: "#ef4444", fontSize: "22px", fontWeight: "600" }}>{error}</p>
                <Link to="/courses" style={{ color: "#3b82f6", fontSize: "17px", textDecoration: "underline" }}>
                    ← Quay lại danh sách khóa học
                </Link>
            </div>
        );
    }

    if (!course && !courseInfoFromUser) {
        return (
            <div style={{ padding: "80px 20px", textAlign: "center", background: "#f8fafc", minHeight: "100vh" }}>
                <p style={{ color: "#64748b", fontSize: "22px" }}>Không tìm thấy khóa học.</p>
                <Link to="/courses" style={{ color: "#3b82f6", fontSize: "17px", textDecoration: "underline" }}>
                    ← Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <>
            {/* TOAST NOTIFICATION */}
            {toast.show && (
                <div style={{
                    position: "fixed", top: "24px", right: "24px", zIndex: 9999,
                    background: toast.type === "success" ? "#10b981" : toast.type === "error" ? "#ef4444" : "#3b82f6",
                    color: "white", padding: "16px 28px", borderRadius: "16px",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.25)", fontWeight: "600",
                    display: "flex", alignItems: "center", gap: "12px", minWidth: "320px",
                    animation: "slideInDown 0.5s ease"
                }}>
                    {toast.type === "success" && "Check"}
                    {toast.type === "error" && "Cross"}
                    {toast.type === "info" && "Info"}
                    {toast.message}
                </div>
            )}

            <div style={{ padding: "40px 20px", maxWidth: "1400px", margin: "0 auto", background: "#f8fafc", minHeight: "100vh" }}>
                {/* HEADER + ENROLL BUTTON */}
                <div style={{ marginBottom: "40px" }}>
                    <h1 style={{
                        fontSize: "38px",
                        fontWeight: "900",
                        margin: "0 0 16px",
                        background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        {displayTitle}
                    </h1>
                    <p style={{ fontSize: "18px", color: "#475569", lineHeight: "1.7", margin: "0 0 32px", maxWidth: "800px" }}>
                        {displayDescription}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
                        {isAuthenticated ? (
                            isEnrolled ? (
                                <>
                                    <button
                                        onClick={handleStartLearning}
                                        style={{
                                            padding: "16px 36px",
                                            background: "linear-gradient(135deg, #10b981, #059669)",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "16px",
                                            fontSize: "18px",
                                            fontWeight: "800",
                                            cursor: "pointer",
                                            boxShadow: "0 10px 30px rgba(16, 192, 82, 0.4)",
                                            transition: "all 0.3s ease",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px"
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                                    >
                                        {nextLesson ? "Tiếp tục" : "Học từ đầu"}
                                    </button>

                                    {totalLessons > 0 && (
                                        <div style={{
                                            background: "white",
                                            padding: "16px 28px",
                                            borderRadius: "16px",
                                            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            color: "#1e293b"
                                        }}>
                                            Hoàn thành: <strong style={{ color: "#10b981" }}>{completionRate}%</strong>
                                            <span style={{ color: "#64748b", marginLeft: "8px" }}>
                                                ({courseProgress.stats.completedLessons || 0}/{totalLessons} bài)
                                            </span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    disabled={enrolling}
                                    style={{
                                        padding: "16px 40px",
                                        background: enrolling ? "#94a3b8" : "linear-gradient(135deg, #3b82f6, #2563eb)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "16px",
                                        fontSize: "18px",
                                        fontWeight: "800",
                                        cursor: enrolling ? "not-allowed" : "pointer",
                                        boxShadow: "0 10px 30px rgba(59,130,246,0.4)",
                                        transition: "all 0.3s ease"
                                    }}
                                    onMouseEnter={e => !enrolling && (e.currentTarget.style.transform = "translateY(-4px)")}
                                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                                >
                                    {enrolling ? "Đang thêm..." : "Thêm khóa học"}
                                </button>
                            )
                        ) : (
                            <Link
                                to="/login"
                                style={{
                                    padding: "16px 36px",
                                    background: "#3b82f6",
                                    color: "white",
                                    borderRadius: "16px",
                                    textDecoration: "none",
                                    fontWeight: "700",
                                    fontSize: "17px",
                                    boxShadow: "0 8px 25px rgba(59,130,246,0.3)",
                                    transition: "all 0.3s"
                                }}
                            >
                                Đăng nhập để thêm khóa học
                            </Link>
                        )}
                    </div>
                </div>

                {/* DANH SÁCH BÀI HỌC */}
                <div style={{ marginBottom: "60px" }}>
                    <h2 style={{
                        fontSize: "28px",
                        fontWeight: "800",
                        margin: "0 0 28px",
                        color: "#1e293b",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                    }}>
                        Danh sách bài học
                        <span style={{ fontSize: "18px", fontWeight: "600", color: "#64748b" }}>
                            ({totalLessons} bài)
                        </span>
                    </h2>

                    {totalLessons === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "80px 40px",
                            background: "white",
                            borderRadius: "20px",
                            border: "3px dashed #cbd5e1",
                            color: "#94a3b8"
                        }}>
                            <p style={{ fontSize: "20px", margin: "0 0 12px" }}>Chưa có bài học nào</p>
                            <p>Khóa học đang được cập nhật. Hãy quay lại sau nhé!</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: "20px" }}>
                            {sortedLessonsWithProgress.map((lesson, index) => {
                                const isCompleted = lesson.completed;
                                const isNext = !isCompleted && !sortedLessonsWithProgress.slice(0, index).some(l => !l.completed);
                                const canAccess = isEnrolled;
                                const scorePercent = Math.round(lesson.score || 0);
                                const skillKey = lesson.skillType?.toLowerCase();
                                const skill = skillKey ? SKILL_CONFIG[skillKey] : null;

                                return (
                                    <div
                                        key={lesson._id}
                                        style={{
                                            background: "white",
                                            borderRadius: "20px",
                                            padding: "24px",
                                            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                                            border: `2px solid ${isNext ? "#3b82f6" : isCompleted ? "#10b981" : "#e2e8f0"}`,
                                            transition: "all 0.4s ease",
                                            position: "relative",
                                            overflow: "hidden"
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-8px)"}
                                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                                    >
                                        {canAccess ? (
                                            <Link
                                                to={`/courses/${courseIdStr}/lessons/${lesson._id}`}
                                                style={{
                                                    textDecoration: "none",
                                                    color: "inherit",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    gap: "20px"
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "16px",
                                                        marginBottom: "12px"
                                                    }}>
                                                        <div style={{
                                                            fontSize: "20px",
                                                            fontWeight: "700",
                                                            color: "#1e293b"
                                                        }}>
                                                            {index + 1}. {lesson.title}
                                                        </div>
                                                        {isNext && (
                                                            <span style={{
                                                                background: "#3b82f6",
                                                                color: "white",
                                                                padding: "6px 14px",
                                                                borderRadius: "20px",
                                                                fontSize: "13px",
                                                                fontWeight: "bold"
                                                            }}>
                                                                Next
                                                            </span>
                                                        )}
                                                    </div>

                                                    {skill && (
                                                        <div style={{
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "8px",
                                                            background: skill.bg,
                                                            color: skill.color,
                                                            padding: "8px 16px",
                                                            borderRadius: "30px",
                                                            fontSize: "14px",
                                                            fontWeight: "600",
                                                            border: `1px solid ${skill.color}40`
                                                        }}>
                                                            {skill.icon}
                                                            {skill.name}
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "12px"
                                                }}>
                                                    {isCompleted && (
                                                        <div style={{
                                                            background: "#10b981",
                                                            color: "white",
                                                            padding: "10px 20px",
                                                            borderRadius: "30px",
                                                            fontSize: "15px",
                                                            fontWeight: "bold"
                                                        }}>
                                                            Check {scorePercent}%
                                                        </div>
                                                    )}
                                                    {!isCompleted && scorePercent > 0 && (
                                                        <div style={{
                                                            background: "#fb923c",
                                                            color: "white",
                                                            padding: "10px 20px",
                                                            borderRadius: "30px",
                                                            fontSize: "15px",
                                                            fontWeight: "bold"
                                                        }}>
                                                            {scorePercent}%
                                                        </div>
                                                    )}
                                                    {!isCompleted && scorePercent === 0 && (
                                                        <div style={{
                                                            background: "#e2e8f0",
                                                            color: "#64748b",
                                                            padding: "10px 20px",
                                                            borderRadius: "30px",
                                                            fontSize: "15px",
                                                            fontWeight: "600"
                                                        }}>
                                                            Chưa học
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        ) : (
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                color: "#94a3b8",
                                                fontStyle: "italic"
                                            }}>
                                                <div>
                                                    {index + 1}. {lesson.title}
                                                    {skill && (
                                                        <span style={{
                                                            marginLeft: "16px",
                                                            padding: "6px 14px",
                                                            background: skill.bg,
                                                            color: skill.color,
                                                            borderRadius: "30px",
                                                            fontSize: "13px"
                                                        }}>
                                                            {skill.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <small>Yêu cầu thêm khóa học</small>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* PHẦN ĐÁNH GIÁ – ĐẸP NHƯ DISQUS */}
                <div style={{ marginTop: "80px", paddingTop: "60px", borderTop: "3px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                        <h2 style={{ fontSize: "30px", fontWeight: "900", margin: 0, color: "#1e293b" }}>
                            Đánh giá từ học viên
                        </h2>
                        {course?.ratingCount > 0 && (
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                background: "white",
                                padding: "12px 24px",
                                borderRadius: "20px",
                                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                                fontSize: "20px"
                            }}>
                                <span style={{ color: "#fbbf24", fontSize: "32px" }}>
                                    {"★".repeat(Math.round(course.averageRating || 0))}{"☆".repeat(5 - Math.round(course.averageRating || 0))}
                                </span>
                                <div>
                                    <div style={{ fontWeight: "bold", color: "#1e293b" }}>
                                        {course.averageRating?.toFixed(1)} / 5.0
                                    </div>
                                    <div style={{ fontSize: "14px", color: "#64748b" }}>
                                        {course.ratingCount} đánh giá
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Form đánh giá */}
                    {isAuthenticated && isEnrolled && (
                        <div style={{
                            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                            borderRadius: "24px",
                            padding: "36px",
                            marginBottom: "48px",
                            border: "2px dashed #0ea5e9",
                            boxShadow: "0 10px 30px rgba(14, 165, 233, 0.15)"
                        }}>
                            <h3 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 24px", color: "#0c4a6e" }}>
                                Chia sẻ trải nghiệm của bạn
                            </h3>

                            <div style={{ marginBottom: "24px" }}>
                                <label style={{ display: "block", marginBottom: "12px", fontWeight: "700", color: "#1e293b", fontSize: "16px" }}>
                                    Đánh giá của bạn <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <div style={{ display: "flex", gap: "16px", fontSize: "48px", justifyContent: "center" }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            onClick={() => setRating(star)}
                                            style={{
                                                cursor: "pointer",
                                                color: rating >= star ? "#fbbf24" : "#e2e8f0",
                                                transition: "all 0.3s ease",
                                                transform: rating >= star ? "scale(1.15)" : "scale(1)",
                                                filter: rating >= star ? "drop-shadow(0 4px 12px rgba(251,191,36,0.5))" : "none"
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.3)"}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = rating >= star ? "scale(1.15)" : "scale(1)"}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <p style={{ textAlign: "center", marginTop: "12px", color: "#64748b", fontSize: "15px" }}>
                                    {rating === 0 ? "Nhấp để chọn số sao" : `Bạn đánh giá: ${rating} sao`}
                                </p>
                            </div>

                            <div style={{ marginBottom: "28px" }}>
                                <label style={{ display: "block", marginBottom: "12px", fontWeight: "700", color: "#1e293b", fontSize: "16px" }}>
                                    Nhận xét (tùy chọn)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Bạn thích điều gì nhất ở khóa học này? Có gợi ý gì không?"
                                    rows={4}
                                    style={{
                                        width: "95%",
                                        padding: "16px 20px",
                                        borderRadius: "16px",
                                        border: "2px solid #e0e7ff",
                                        background: "white",
                                        fontSize: "16px",
                                        resize: "vertical",
                                        outline: "none",
                                        transition: "all 0.3s",
                                        boxShadow: "inset 0 3px 8px rgba(0,0,0,0.05)"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                                    onBlur={(e) => e.target.style.borderColor = "#e0e7ff"}
                                />
                            </div>

                            <div style={{ textAlign: "center" }}>
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={submitting || rating === 0}
                                    style={{
                                        padding: "16px 48px",
                                        background: (rating === 0 || submitting) ? "#94a3b8" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "16px",
                                        fontSize: "18px",
                                        fontWeight: "800",
                                        cursor: (rating === 0 || submitting) ? "not-allowed" : "pointer",
                                        boxShadow: (rating === 0 || submitting) ? "none" : "0 12px 35px rgba(99, 102, 241, 0.4)",
                                        transition: "all 0.4s ease",
                                        minWidth: "220px"
                                    }}
                                    onMouseEnter={(e) => rating > 0 && !submitting && (e.currentTarget.style.transform = "translateY(-4px)")}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                                >
                                    {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Danh sách đánh giá */}
                    {reviewsLoading ? (
                        <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
                            <p>Đang tải đánh giá...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "80px 40px",
                            background: "white",
                            borderRadius: "24px",
                            border: "3px dashed #cbd5e1"
                        }}>
                            <p style={{ fontSize: "22px", color: "#64748b", margin: "0 0 16px" }}>
                                Chưa có đánh giá nào
                            </p>
                            <p style={{ color: "#94a3b8" }}>
                                Hãy là người đầu tiên chia sẻ cảm nhận của bạn!
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: "24px" }}>
                            {reviews.slice(0, 6).map((review) => (
                                <div
                                    key={review._id}
                                    style={{
                                        background: "white",
                                        borderRadius: "20px",
                                        padding: "28px",
                                        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                                        border: "1px solid #e2e8f0"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px" }}>
                                        <div style={{
                                            width: "60px",
                                            height: "60px",
                                            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontWeight: "bold",
                                            fontSize: "22px",
                                            boxShadow: "0 8px 20px rgba(59,130,246,0.3)"
                                        }}>
                                            {review.user?.name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: "700", fontSize: "18px", color: "#1e293b" }}>
                                                {review.user?.name || "Ẩn danh"}
                                            </div>
                                            <div style={{ color: "#64748b", fontSize: "14px" }}>
                                                {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric"
                                                })}
                                            </div>
                                        </div>
                                        <div style={{ color: "#fbbf24", fontSize: "32px" }}>
                                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p style={{
                                            margin: 0,
                                            lineHeight: "1.7",
                                            color: "#475569",
                                            fontSize: "16px",
                                            background: "#f8fafc",
                                            padding: "16px 20px",
                                            borderRadius: "16px",
                                            borderLeft: "4px solid #3b82f6"
                                        }}>
                                            {review.comment}
                                        </p>
                                    )}
                                </div>
                            ))}
                            {reviews.length > 6 && (
                                <p style={{ textAlign: "center", marginTop: "32px", color: "#64748b", fontStyle: "italic" }}>
                                    ... và {reviews.length - 6} đánh giá khác
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* CSS ANIMATIONS */}
            <style jsx>{`
                @keyframes slideInDown {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </>
    );
}

export default CourseDetail;