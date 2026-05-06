import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { Search, Filter, ChevronRight, BookOpen, Clock, Users, Star } from "lucide-react";

const LEVEL_LABELS = {
    beginner: "Sơ cấp",
    intermediate: "Trung cấp",
    advanced: "Nâng cao"
};

const LEVEL_COLORS = {
    beginner: "#10b981",
    intermediate: "#f59e0b",
    advanced: "#ef4444"
};

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const urlQuery = searchParams.get("q") || "";
    const urlLevel = searchParams.get("level") || "";

    const [searchTerm, setSearchTerm] = useState(urlQuery);
    const [selectedLevel, setSelectedLevel] = useState(urlLevel);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const limit = 12;

    const fetchCourses = async (reset = false) => {
        if (!urlQuery && !urlLevel) {
            setResults([]);
            setTotal(0);
            return;
        }

        setLoading(true);
        try {
            const res = await api.get("/courses", {
                params: {
                    search: urlQuery || undefined,
                    level: urlLevel || undefined,
                    limit,
                    page: reset ? 1 : page
                }
            });

            const courses = res.data.courses || res.data || [];
            const totalCount = res.data.total || courses.length;

            setResults(prev => reset ? courses : [...prev, ...courses]);
            setTotal(totalCount);
            setHasMore(courses.length === limit);
            if (reset) setPage(1);
        } catch (err) {
            console.error("Lỗi tìm kiếm:", err);
            setResults([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    // Khi URL thay đổi (ví dụ: từ Navbar điều hướng sang)
    useEffect(() => {
        setSearchTerm(urlQuery);
        setSelectedLevel(urlLevel);
        fetchCourses(true);
    }, [urlQuery, urlLevel]);

    // Load more khi scroll xuống đáy
    useEffect(() => {
        if (page > 1) fetchCourses();
    }, [page]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.set("q", searchTerm.trim());
        if (selectedLevel) params.set("level", selectedLevel);
        setSearchParams(params);
    };

    const loadMore = () => {
        if (!loading && hasMore) setPage(prev => prev + 1);
    };

    return (
        <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", padding: "80px 20px 40px" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h1 style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 12px" }}>
                        <Search size={36} style={{ display: "inline-block", marginRight: "12px", verticalAlign: "middle" }} />
                        Tìm kiếm khóa học
                    </h1>
                    {urlQuery && (
                        <p style={{ fontSize: "18px", color: "#94a3b8" }}>
                            Kết quả cho: <strong style={{ color: "#60a5fa" }}>"{urlQuery}"</strong>
                            {urlLevel && <> • Trình độ: <span style={{ color: LEVEL_COLORS[urlLevel] || "#60a5fa" }}>{LEVEL_LABELS[urlLevel]}</span></>}
                        </p>
                    )}
                </div>

                {/* Search Bar + Filter */}
                <form onSubmit={handleSearch} style={{ marginBottom: "32px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                    <div style={{ flex: "1", minWidth: "280px", position: "relative" }}>
                        <Search size={20} style={{ position: "absolute", left: "16px", top: "14px", color: "#94a3b8" }} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm khóa học..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: "90%",
                                padding: "14px 16px 14px 48px",
                                borderRadius: "12px",
                                border: "1px solid #334155",
                                background: "#1e293b",
                                color: "#fff",
                                fontSize: "16px",
                                outline: "none"
                            }}
                        />
                    </div>

                    <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        style={{
                            padding: "14px 50px",
                            borderRadius: "12px",
                            background: "#1e293b",
                            color: "#fff",
                            border: "1px solid #334155",
                            Width: "150px"
                        }}
                    >
                        <option value="">Mức độ</option>
                        <option value="beginner">Sơ cấp</option>
                        <option value="intermediate">Trung cấp</option>
                        <option value="advanced">Nâng cao</option>
                    </select>

                    <button
                        type="submit"
                        style={{
                            padding: "14px 32px",
                            background: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            borderRadius: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        <Filter size={18} />
                        Tìm kiếm
                    </button>
                </form>

                {/* Results Info */}
                <div style={{ marginBottom: "24px", fontSize: "15px", color: "#94a3b8" }}>
                    {loading && page === 1 ? "Đang tìm kiếm..." : `Tìm thấy ${total} khóa học`}
                </div>

                {/* Grid Results */}
                {results.length === 0 && !loading ? (
                    <div style={{ textAlign: "center", padding: "80px 20px", color: "#64748b" }}>
                        <Search size={64} style={{ marginBottom: "20px", opacity: 0.5 }} />
                        <p style={{ fontSize: "18px" }}>Không tìm thấy khóa học nào.</p>
                        <p>Hãy thử từ khóa khác hoặc bỏ bộ lọc trình độ.</p>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gap: "24px",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))"
                    }}>
                        {results.map((course) => (
                            <Link
                                key={course._id}
                                to={`/courses/${course._id}`}
                                style={{
                                    background: "#1e293b",
                                    borderRadius: "16px",
                                    overflow: "hidden",
                                    transition: "all 0.3s",
                                    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
                                    textDecoration: "none",
                                    color: "inherit"
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-8px)"}
                                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                            >
                                <div style={{ padding: "20px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, flex: 1 }}>
                                            {course.title}
                                        </h3>
                                        <ChevronRight size={20} style={{ color: "#60a5fa" }} />
                                    </div>

                                    {course.description && (
                                        <p style={{ color: "#94a3b8", fontSize: "14px", margin: "8px 0 16px", lineHeight: "1.5" }}>
                                            {course.description.length > 100
                                                ? course.description.substring(0, 100) + "..."
                                                : course.description}
                                        </p>
                                    )}

                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "13px", color: "#cbd5e1" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <BookOpen size={14} />
                                            {course.lessons?.length || 0} bài học
                                        </span>
                                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Clock size={14} />
                                            {course.duration || "Chưa rõ"} phút
                                        </span>
                                        {course.level && (
                                            <span style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                                color: LEVEL_COLORS[course.level] || "#60a5fa",
                                                fontWeight: 600
                                            }}>
                                                {LEVEL_LABELS[course.level] || course.level}
                                            </span>
                                        )}
                                    </div>

                                    {course.enrolledCount > 0 && (
                                        <div style={{ marginTop: "12px", fontSize: "13px", color: "#94a3b8" }}>
                                            <Users size={14} style={{ display: "inline", marginRight: "4px" }} />
                                            {course.enrolledCount.toLocaleString()} học viên
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Load More Button */}
                {hasMore && results.length > 0 && (
                    <div style={{ textAlign: "center", marginTop: "48px" }}>
                        <button
                            onClick={loadMore}
                            disabled={loading}
                            style={{
                                padding: "12px 32px",
                                background: loading ? "#334155" : "#3b82f6",
                                color: "#fff",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "15px",
                                cursor: loading ? "not-allowed" : "pointer"
                            }}
                        >
                            {loading ? "Đang tải thêm..." : "Xem thêm khóa học"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}