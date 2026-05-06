import React, { useEffect, useState } from "react";
import { getCourses } from "../services/courseService";
import { Link } from "react-router-dom";

function CourseList() {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [availableLevels, setAvailableLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState("all");
    const [loading, setLoading] = useState(true);

    const levelConfig = {
        beginner: { label: "Beginner", color: "#10b981", bgActive: "#10b98130" },
        intermediate: { label: "Intermediate", color: "#f59e0b", bgActive: "#f59e0b30" },
        advanced: { label: "Advanced", color: "#ef4444", bgActive: "#ef444430" }
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getCourses({ limit: 100 });
                const publicCourses = (data.courses || [])
                    .filter(c => c.isApproved && c.isPublished)
                    .map(c => ({
                        ...c,
                        level: c.level || "beginner",
                        duration: c.duration || "02:40",
                        thumbnail: c.thumbnail || "https://res.cloudinary.com/daqtutvru/image/upload/v1764280707/engthumb_pirhgw.jpg"
                    }));

                const uniqueLevels = [...new Set(publicCourses.map(c => c.level))].sort();
                setAvailableLevels(uniqueLevels);
                setCourses(publicCourses);
                setFilteredCourses(publicCourses);
            } catch (err) {
                console.error("Lỗi tải khóa học:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        if (selectedLevel === "all") {
            setFilteredCourses(courses);
        } else {
            setFilteredCourses(courses.filter(c => c.level === selectedLevel));
        }
    }, [selectedLevel, courses]);

    if (loading) return <LoadingGrid />;

    return (
        <div style={{
            padding: "40px 20px",
            maxWidth: "1400px",
            margin: "0 auto",
            minHeight: "100vh",
            color: "white",
            fontFamily: "'Segoe UI', sans-serif"
        }}>

            <div style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "50px"
            }}>
                <button
                    onClick={() => setSelectedLevel("all")}
                    style={{
                        padding: "12px 28px",
                        borderRadius: "30px",
                        border: selectedLevel === "all" ? "2px solid #60a5fa" : "2px solid #334155",
                        background: selectedLevel === "all" ? "#60a5fa30" : "transparent",
                        color: selectedLevel === "all" ? "#60a5fa" : "#cbd5e1",
                        fontWeight: selectedLevel === "all" ? "700" : "500",
                        fontSize: "16px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        minWidth: "160px"
                    }}
                >
                    Tất cả cấp độ
                </button>

                {availableLevels.map(levelKey => {
                    const config = levelConfig[levelKey];
                    if (!config) return null;
                    return (
                        <button
                            key={levelKey}
                            onClick={() => setSelectedLevel(levelKey)}
                            style={{
                                padding: "12px 28px",
                                borderRadius: "30px",
                                border: `2px solid ${selectedLevel === levelKey ? config.color : "#000000ff"}`,
                                background: selectedLevel === levelKey ? config.bgActive : "transparent",
                                color: selectedLevel === levelKey ? "white" : "#030303ff",
                                fontWeight: selectedLevel === levelKey ? "700" : "500",
                                fontSize: "16px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                minWidth: "160px"
                            }}
                        >
                            {config.label}
                        </button>
                    );
                })}
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                gap: "36px 28px",
                padding: "0 10px"
            }}>
                {filteredCourses.length === 0 ? (
                    <div style={{
                        gridColumn: "1 / -1",
                        textAlign: "center",
                        padding: "120px 20px",
                        color: "#64748b",
                        fontSize: "24px",
                        fontWeight: "500"
                    }}>
                        Chưa có khóa học ở cấp độ này
                    </div>
                ) : (
                    filteredCourses.map(course => (
                        <VideoCourseCard key={course._id} course={course} levelConfig={levelConfig} />
                    ))
                )}
            </div>
        </div>
    );
}

function VideoCourseCard({ course, levelConfig }) {
    const levelInfo = levelConfig[course.level] || levelConfig.beginner;

    return (
        <Link to={`/courses/${course._id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{
                borderRadius: "20px",
                overflow: "hidden",
                background: "#1e293b",
                boxShadow: "0 12px 35px rgba(0,0,0,0.5)",
                transition: "all 0.4s ease",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-16px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
                <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        style={{
                            position: "absolute",
                            top: 0, left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                        }}
                    />
                    <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent 40%)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <div style={{
                            width: "88px", height: "88px", background: "rgba(255,255,255,0.95)",
                            borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="#1e293b">
                                <path d="M8 5v14l11-7L8 5z"/>
                            </svg>
                        </div>
                    </div>

                    <div style={{
                        position: "absolute", top: "16px", right: "16px",
                        background: levelInfo.color, color: "white",
                        padding: "8px 16px", borderRadius: "12px",
                        fontSize: "14px", fontWeight: "bold", letterSpacing: "0.5px"
                    }}>
                        {levelInfo.label}
                    </div>

                    <div style={{
                        position: "absolute", bottom: "16px", right: "16px",
                        background: "rgba(0,0,0,0.8)", color: "white",
                        padding: "8px 14px", borderRadius: "8px", fontSize: "14px", fontWeight: "600"
                    }}>
                        {course.duration}
                    </div>
                </div>

                <div style={{ padding: "24px", flexGrow: 1 }}>
                    <h3 style={{
                        margin: "0 0 14px",
                        fontSize: "20px",
                        fontWeight: "700",
                        lineHeight: "1.4",
                        color: "#f8fafc"
                    }}>
                        {course.title}
                    </h3>
                    <p style={{
                        color: "#94a3b8",
                        fontSize: "15px",
                        margin: "0 0 20px",
                        lineHeight: "1.6",
                        flexGrow: 1
                    }}>
                        {course.description?.slice(0, 110) || "Khóa học tiếng Anh thực tế qua video, luyện nghe, nói, từ vựng và ngữ pháp..."}...
                    </p>

                    <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                        <span style={{
                            background: "#334155",
                            padding: "10px 18px",
                            borderRadius: "24px",
                            fontSize: "14px",
                            fontWeight: "500"
                        }}>
                            Dictation
                        </span>
                        <span style={{
                            background: "#334155",
                            padding: "10px 18px",
                            borderRadius: "24px",
                            fontSize: "14px",
                            fontWeight: "500"
                        }}>
                            Shadowing
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function LoadingGrid() {
    return (
        <div style={{ padding: "60px 20px", background: "#0f172a", minHeight: "100vh" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "36px 28px" }}>
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} style={{
                        height: "420px", background: "#1e293b", borderRadius: "20px",
                        animation: "pulse 1.8s infinite"
                    }}></div>
                ))}
            </div>
            <style jsx>{`
                @keyframes pulse { 0%,100% {opacity:.6} 50% {opacity:1} }
            `}</style>
        </div>
    );
}

export default CourseList;