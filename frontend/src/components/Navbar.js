import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import {
    Search, Menu, X, User, LogOut, Home, BookOpen,
    LayoutDashboard, Shield, GraduationCap, MessageCircle
} from "lucide-react";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user, logout } = useContext(AuthContext);

    const [searchTerm, setSearchTerm] = useState("");
    const [level, setLevel] = useState("");           
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCompact, setIsCompact] = useState(false);

    const searchRef = useRef(null);
    const navbarRef = useRef(null);

    // ────── Detect compact mode (mobile + zoom) ──────
    useEffect(() => {
        const checkCompactMode = () => {
            const zoom = window.devicePixelRatio * 100;
            const width = window.innerWidth;
            setIsCompact(zoom > 150 || width < 900);
        };

        checkCompactMode();
        window.addEventListener("resize", checkCompactMode);
        const resizeObserver = new ResizeObserver(checkCompactMode);
        if (navbarRef.current) resizeObserver.observe(navbarRef.current);

        return () => {
            window.removeEventListener("resize", checkCompactMode);
            resizeObserver.disconnect();
        };
    }, []);

    // ────── Debounce gợi ý tìm kiếm (chỉ chạy trên desktop) ──────
    useEffect(() => {
        const timer = setTimeout(() => {
            const trimmed = searchTerm.trim();
            if (trimmed.length >= 1 && !isCompact) {
                fetchSuggestions(trimmed, level);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [searchTerm, level, isCompact]);

    const fetchSuggestions = async (query, levelValue) => {
        setLoading(true);
        try {
            const res = await api.get("/courses", {
                params: { search: query, level: levelValue || undefined, limit: 6 }
            });
            const courses = res.data.courses || res.data || [];
            setSuggestions(courses);
            setShowSuggestions(true);
        } catch (err) {
            console.warn("Search error:", err.message);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    // ────── Chuyển hướng tới trang tìm kiếm nâng cao ──────
    const goToSearchPage = () => {
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.set("q", searchTerm.trim());
        if (level) params.set("level", level);

        navigate(`/search${params.toString() ? `?${params.toString()}` : ""}`);
        setShowSuggestions(false);
        setSearchTerm("");
        setLevel("");
    };

    const handleSelectCourse = (courseId) => {
        setSearchTerm("");
        setShowSuggestions(false);
        navigate(`/courses/${courseId}`);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
        setMobileMenuOpen(false);
    };

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <>
            {/* NAVBAR */}
            <nav ref={navbarRef} style={navbarStyle}>
                <div style={containerStyle}>
                    {/* LEFT */}
                    <div style={leftSectionStyle}>
                        <Link to="/" style={logoStyle}>
                            <span style={{ fontWeight: 800, fontSize: "22px", color: "#3b82f6" }}>EN</span>
                            <span style={{ fontWeight: 800, fontSize: "22px", color: "#fff" }}>App</span>
                        </Link>

                        <div style={desktopMenuStyle}>
                            <NavLink to="/" icon={<Home size={18} />} label="Trang chủ" compact={isCompact} active={isActive("/")} />
                            <NavLink to="/courses" icon={<BookOpen size={18} />} label="Khóa học" compact={isCompact} active={isActive("/courses")} />
                            <NavLink to="/questions" icon={<MessageCircle size={18} />} label="Hỏi đáp" compact={isCompact} active={isActive("/questions")} />
                        </div>

                        {/* DESKTOP SEARCH */}
                        {!isCompact && (
                            <div style={searchNearCoursesStyle} ref={searchRef}>
                                <div style={searchWrapperStyle}>
                                    <Search size={0} style={{ color: "#94a3b8", marginRight: "8px" }} />
                                    <input
                                        type="text"
                                        placeholder="Tìm khóa học..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                        onKeyDown={(e) => e.key === "Enter" && goToSearchPage()}
                                        style={searchInputStyle}
                                    />
                                    <button
                                        onClick={goToSearchPage}
                                        style={{ background: "none", border: "none", cursor: "pointer", padding: "0 6px" }}
                                        title="Tìm kiếm nâng cao"
                                    >
                                        {loading ? <div style={spinnerStyle}></div> : <Search size={18} color="#60a5fa" />}
                                    </button>
                                </div>

                                {/* Dropdown gợi ý + nút "Xem tất cả" */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div style={dropdownNearCoursesStyle}>
                                        {suggestions.map((course) => (
                                            <div
                                                key={course._id}
                                                onClick={() => handleSelectCourse(course._id)}
                                                style={suggestionItemStyle}
                                            >
                                                <div style={{ fontWeight: 600, color: "#fff" }}>
                                                    {highlightText(course.title, searchTerm)}
                                                </div>
                                                <div style={suggestionMetaStyle}>
                                                    {course.lessons?.length || 0} bài • {course.level || "Chưa xác định"}
                                                </div>
                                            </div>
                                        ))}
                                        <div
                                            onClick={goToSearchPage}
                                            style={{
                                                padding: "14px 16px",
                                                background: "#1e40af",
                                                color: "#fff",
                                                textAlign: "center",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                borderTop: "1px solid #334155"
                                            }}
                                        >
                                            Xem tất cả kết quả cho "{searchTerm}"
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* MOBILE SEARCH ICON lúp */}
                    {isCompact && (
                        <button
                            onClick={goToSearchPage}
                            style={searchIconBtnStyle}
                            title="Tìm kiếm nâng cao"
                        >
                            <Search size={20} />
                        </button>
                    )}

                    {/* RIGHT */}
                    <div style={rightSectionStyle}>
                        {isAuthenticated ? (
                            <>
                                <div style={desktopUserMenuStyle}>
                                    <NavLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" compact={isCompact} active={isActive("/dashboard")} />
                                    <NavLink to="/profile" icon={<User size={18} />} label="Profile" compact={isCompact} active={isActive("/profile")} />
                                    {user?.role === "admin" && (
                                        <NavLink to="/admin" icon={<Shield size={18} />} label="Admin" compact={isCompact} active={isActive("/admin")} />
                                    )}
                                    {user?.role === "instructor" && (
                                        <NavLink to="/instructor" icon={<GraduationCap size={18} />} label="Giảng viên" compact={isCompact} active={isActive("/instructor")} />
                                    )}
                                    <div style={userInfoStyle}>
                                        <div style={avatarStyle}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
                                        {!isCompact && <span style={{ marginLeft: "8px", fontWeight: 500 }}>{user?.name}</span>}
                                    </div>
                                    <button onClick={handleLogout} style={logoutBtnStyle} title="Đăng xuất">
                                        <LogOut size={16} />
                                    </button>
                                </div>

                                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={mobileMenuBtnStyle}>
                                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </>
                        ) : (
                            <Link to="/login" style={loginBtnStyle}>Đăng nhập</Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* MOBILE MENU (giữ nguyên) */}
            {mobileMenuOpen && isAuthenticated && (
                <div style={mobileOverlayStyle} onClick={() => setMobileMenuOpen(false)}>
                    <div style={mobileMenuStyle} onClick={(e) => e.stopPropagation()}>
                        <div style={mobileUserHeaderStyle}>
                            <div style={avatarStyle}>{user?.name?.[0]?.toUpperCase() || "U"}</div>
                            <div>
                                <div style={{ fontWeight: 600 }}>{user?.name}</div>
                                <div style={{ fontSize: "13px", color: "#94a3b8" }}>{user?.email}</div>
                            </div>
                        </div>
                        <hr style={{ border: "none", borderTop: "1px solid #334155", margin: "12px 0" }} />
                        <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>Trang chủ</MobileNavLink>
                        <MobileNavLink to="/courses" onClick={() => setMobileMenuOpen(false)}>Khóa học</MobileNavLink>
                        <MobileNavLink to="/questions" onClick={() => setMobileMenuOpen(false)}>Hỏi đáp cộng đồng</MobileNavLink>
                        <MobileNavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileNavLink>
                        <MobileNavLink to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</MobileNavLink>
                        {user?.role === "admin" && <MobileNavLink to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Panel</MobileNavLink>}
                        {user?.role === "instructor" && <MobileNavLink to="/instructor" onClick={() => setMobileMenuOpen(false)}>Giảng viên</MobileNavLink>}
                        <button onClick={handleLogout} style={mobileLogoutBtnStyle}>
                            <LogOut size={16} style={{ marginRight: "8px" }} />
                            Đăng xuất
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

/* ────────────────────────────── COMPONENTS ────────────────────────────── */
const NavLink = ({ to, icon, label, compact, active = false, highlight = false }) => (
    <Link
        to={to}
        style={{
            ...navLinkStyle,
            background: highlight || active,
            color: highlight || active ? "#ffffff" : "#cbd5e1",
            fontWeight: active || highlight ? 600 : 500,
            padding: "10px 14px",
            borderRadius: "10px",
            transition: "all 0.2s"
        }}
        title={compact ? label : ""}
    >
        {icon}
        {!compact && <span style={{ marginLeft: "8px" }}>{label}</span>}
    </Link>
);

const MobileNavLink = ({ to, children, onClick }) => (
    <Link to={to} onClick={onClick} style={mobileNavLinkStyle}>
        {children}
    </Link>
);

function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
        regex.test(part) ? <mark key={i} style={highlightStyle}>{part}</mark> : part
    );
}

/* ────────────────────────────── STYLES (giữ nguyên 100%) ────────────────────────────── */
const navbarStyle = { background: "#0f172a", color: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", position: "sticky", top: 0, zIndex: 1000, fontFamily: "'Inter', sans-serif" };
const containerStyle = { maxWidth: "1400px", margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" };
const leftSectionStyle = { display: "flex", alignItems: "center", gap: "16px", flex: 1 };
const logoStyle = { textDecoration: "none", display: "flex", alignItems: "center" };
const desktopMenuStyle = { display: "flex", gap: "4px", alignItems: "center" };
const navLinkStyle = { display: "flex", alignItems: "center", color: "#cbd5e1", textDecoration: "none", padding: "8px", borderRadius: "8px", fontWeight: 500, fontSize: "14px" };
const searchNearCoursesStyle = { position: "relative", flex: 1, maxWidth: "360px", marginLeft: "16px" };
const searchWrapperStyle = { display: "flex", alignItems: "center", background: "#1e293b", borderRadius: "12px", padding: "10px 14px" };
const searchInputStyle = { background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "15px", flex: 1 };
const spinnerStyle = { width: "16px", height: "16px", border: "2px solid #334155", borderTop: "2px solid #60a5fa", borderRadius: "50%", animation: "spin 1s linear infinite", marginLeft: "8px" };
const suggestionItemStyle = { padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #334155" };
const suggestionMetaStyle = { fontSize: "13px", color: "#94a3b8", marginTop: "4px" };
const dropdownNearCoursesStyle = { position: "absolute", top: "100%", left: 0, right: 0, background: "#1e293b", border: "1px solid #334155", borderRadius: "12px", overflowY: "auto", marginTop: "8px", zIndex: 1000, maxHeight: "420px" };
const rightSectionStyle = { display: "flex", alignItems: "center", gap: "8px" };
const desktopUserMenuStyle = { display: "flex", alignItems: "center", gap: "4px" };
const userInfoStyle = { display: "flex", alignItems: "center" };
const avatarStyle = { width: "32px", height: "32px", borderRadius: "50%", background: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px" };
const logoutBtnStyle = { background: "#ef4444", color: "#fff", border: "none", padding: "8px", borderRadius: "8px", cursor: "pointer" };
const loginBtnStyle = { background: "#3b82f6", color: "#fff", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontSize: "14px" };
const mobileMenuBtnStyle = { display: "none", background: "none", border: "none", color: "#fff", cursor: "pointer" };
const searchIconBtnStyle = { background: "#1e293b", border: "none", padding: "10px", borderRadius: "12px", cursor: "pointer", color: "#94a3b8", transition: "all 0.2s" };
const mobileOverlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999 };
const mobileMenuStyle = { background: "#0f172a", width: "280px", height: "100%", padding: "20px", overflowY: "auto", float: "right" };
const mobileUserHeaderStyle = { display: "flex", alignItems: "center", gap: "12px" };
const mobileNavLinkStyle = { display: "block", padding: "12px 16px", color: "#e2e8f0", textDecoration: "none", fontSize: "15px", borderRadius: "8px", margin: "4px 0" };
const mobileLogoutBtnStyle = { display: "flex", alignItems: "center", padding: "12px", width: "100%", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 500, marginTop: "20px" };
const highlightStyle = { background: "#60a5fa", color: "#fff", padding: "0 3px", borderRadius: "3px", fontWeight: 600 };

/* Animation */
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin { 
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default Navbar;