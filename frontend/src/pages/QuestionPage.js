import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
    getQuestions,
    likeQuestion,
    replyQuestion,
    likeReply,
    createQuestion
} from "../services/questionService";
import { AuthContext } from "../context/AuthContext";

const LIKE_EMPTY = "https://res.cloudinary.com/daqtutvru/image/upload/v1764238170/like1_dphomz.png";
const LIKE_FILLED = "https://res.cloudinary.com/daqtutvru/image/upload/v1764238172/like2_q1vv5e.png";
const REPLY_ICON = "https://res.cloudinary.com/daqtutvru/image/upload/v1764238173/rep_es8hmq.png";

function QuestionsPage() {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState({ questions: [], pagination: { pages: 1, page: 1 } });
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [replyInputs, setReplyInputs] = useState({});
    const [loading, setLoading] = useState(false);

    const [showAskModal, setShowAskModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState("");
    const [asking, setAsking] = useState(false);

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const res = await getQuestions(page, search, sortBy);
            setData(res.data);
        } catch (err) {
            alert("Lỗi tải câu hỏi");
        } finally {
            setLoading(false);
        }
    };

    const submitQuestion = async () => {
        const content = newQuestion.trim();
        if (!content) return alert("Vui lòng nhập nội dung câu hỏi");

        setAsking(true);
        try {
            await createQuestion({ content });
            setShowAskModal(false);
            setNewQuestion("");
            setPage(1);
            loadQuestions();
            alert("Đặt câu hỏi thành công!");
        } catch (err) {
            alert("Gửi thất bại. Vui lòng thử lại.");
        } finally {
            setAsking(false);
        }
    };

    useEffect(() => {
        loadQuestions();
    }, [page, search, sortBy]);

    const handleLike = async (qid) => {
        if (!user) return alert("Đăng nhập để thích");
        try {
            const res = await likeQuestion(qid);
            setData(prev => ({
                ...prev,
                questions: prev.questions.map(q => q._id === qid ? res.data : q)
            }));
        } catch (err) { }
    };

    const handleReply = async (qid) => {
        const content = replyInputs[qid]?.trim();
        if (!content) return;
        try {
            const res = await replyQuestion(qid, content);
            setData(prev => ({
                ...prev,
                questions: prev.questions.map(q => q._id === qid ? res.data : q)
            }));
            setReplyInputs(prev => ({ ...prev, [qid]: "" }));
        } catch (err) { }
    };

    const handleLikeReply = async (qid, rid) => {
        try {
            const res = await likeReply(qid, rid);
            setData(prev => ({
                ...prev,
                questions: prev.questions.map(q => q._id === qid ? res.data : q)
            }));
        } catch (err) { }
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return d.toLocaleDateString("vi-VN");
    };

    const getPaginationRange = () => {
        const totalPages = data.pagination.pages || 1;
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
                range.push(i);
            }
        }

        let prev = null;
        range.forEach(n => {
            if (prev && n - prev > 1) rangeWithDots.push("...");
            rangeWithDots.push(n);
            prev = n;
        });
        return rangeWithDots;
    };

    const sortOptions = [
        { value: "newest", label: "Mới nhất", icon: "New" },
        { value: "oldest", label: "Cũ nhất", icon: "Old" },
        { value: "mostLiked", label: "Nhiều thích nhất", icon: "Heart" },
        { value: "mostReplied", label: "Nhiều trả lời nhất", icon: "Chat" },
    ];

    if (loading && page === 1) {
        return <div style={{ padding: "100px", textAlign: "center", color: "#64748b", fontSize: "20px" }}>Đang tải câu hỏi...</div>;
    }

    return (
        <div style={{ padding: "32px 20px", maxWidth: "1400px", margin: "0 auto", background: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "20px" }}>
                <div>
                    <h1 style={{ fontSize: "36px", fontWeight: "900", color: "#1e293b", margin: 0 }}>
                        Hỏi đáp cộng đồng
                    </h1>
                    <p style={{ color: "#64748b", margin: "8px 0 0", fontSize: "17px" }}>
                        {data.pagination.total || 0} câu hỏi đang chờ bạn giúp đỡ
                    </p>
                </div>

                {user ? (
                    <button
                        onClick={() => setShowAskModal(true)}
                        style={{
                            padding: "16px 36px",
                            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                            color: "white",
                            border: "none",
                            borderRadius: "20px",
                            fontSize: "17px",
                            fontWeight: "800",
                            fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",  // ← Quan trọng nhất
                            cursor: "pointer",
                            boxShadow: "0 10px 30px rgba(139,92,246,0.4)",
                            transition: "all 0.3s",
                            whiteSpace: "nowrap",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "180px",
                            letterSpacing: "0.5px"  // ← Tùy chọn: làm chữ đều và đẹp hơn
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                    >
                        ĐẶT CÂU HỎI
                    </button>
                ) : (
                    <Link to="/login" style={{
                        padding: "16px 36px",
                        background: "#3b82f6",
                        color: "white",
                        borderRadius: "20px",
                        textDecoration: "none",
                        fontWeight: "700",
                        fontSize: "17px"
                    }}>
                        Đăng nhập để hỏi
                    </Link>
                )}
            </div>

            <div style={{ display: "flex", gap: "20px", marginBottom: "40px", flexWrap: "wrap" }}>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ color: "#64748b", fontWeight: "600", fontSize: "15px", whiteSpace: "nowrap" }}>
                        Sắp xếp theo:
                    </span>
                    {sortOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => { setSortBy(option.value); setPage(1); }}
                            style={{
                                padding: "12px 20px",
                                background: sortBy === option.value ? "#8b5cf6" : "white",
                                color: sortBy === option.value ? "white" : "#475569",
                                border: sortBy === option.value ? "none" : "1px solid #cbd5e1",
                                borderRadius: "16px",
                                fontWeight: "700",
                                fontSize: "15px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                transition: "all 0.3s ease",
                                boxShadow: sortBy === option.value ? "0 8px 20px rgba(139,92,246,0.3)" : "0 4px 12px rgba(0,0,0,0.05)"
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {data.questions.length === 0 ? (
                <div style={{
                    textAlign: "center",
                    padding: "120px 40px",
                    background: "white",
                    borderRadius: "24px",
                    border: "4px dashed #e2e8f0"
                }}>
                    <div style={{ fontSize: "80px", marginBottom: "24px" }}>Empty</div>
                    <h3 style={{ fontSize: "28px", color: "#475569" }}>
                        {search ? "Không tìm thấy câu hỏi nào" : "Chưa có câu hỏi nào cả!"}
                    </h3>
                    <p style={{ color: "#94a3b8", fontSize: "18px" }}>
                        {search ? "Thử tìm từ khóa khác nhé!" : "Hãy là người đầu tiên đặt câu hỏi!"}
                    </p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "32px" }}>
                    {data.questions.map(q => (
                        <div
                            key={q._id}
                            style={{
                                background: "white",
                                borderRadius: "24px",
                                padding: "32px",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                                border: "1px solid #f1f5f9",
                                transition: "all 0.4s ease"
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-8px)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                                <img
                                    src={q.author?.avatar || "https://res.cloudinary.com/daqtutvru/image/upload/v1764064861/avatars/btr6syse9ecis5sqfa4q.png"}
                                    alt={q.author?.name}
                                    style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "4px solid #e2e8f0" }}
                                />
                                <div>
                                    <div style={{ fontWeight: "800", fontSize: "18px", color: "#1e293b" }}>
                                        {q.author?.name || "Ẩn danh"}
                                    </div>
                                    <div style={{ color: "#64748b", fontSize: "14px" }}>
                                        {formatDate(q.createdAt)}
                                    </div>
                                </div>
                            </div>

                            <p style={{ fontSize: "20px", lineHeight: "1.8", margin: "24px 0", color: "#1e293b", fontWeight: "500" }}>
                                {q.content}
                            </p>

                            <div style={{ display: "flex", alignItems: "center", gap: "36px", margin: "20px 0" }}>
                                <button
                                    onClick={() => handleLike(q._id)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "10px 16px",
                                        borderRadius: "16px",
                                        transition: "all 0.3s ease"
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                >
                                    <img
                                        src={q.likes.includes(user?._id) ? LIKE_FILLED : LIKE_EMPTY}
                                        alt="like"
                                        style={{ width: 28, height: 28, transition: "all 0.2s" }}
                                    />
                                    <span style={{
                                        fontWeight: "700",
                                        fontSize: "16px",
                                        color: q.likes.includes(user?._id) ? "#8b5cf6" : "#64748b"
                                    }}>
                                        {q.likes.length}
                                    </span>
                                </button>

                                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontWeight: "600" }}>
                                    <img src={REPLY_ICON} alt="reply" style={{ width: 26, height: 26 }} />
                                    <span style={{ fontSize: "16px" }}>{q.replies.length}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: "32px", borderTop: "2px dashed #e2e8f0", paddingTop: "28px" }}>
                                {q.replies.slice(0, 3).map(r => (
                                    <div key={r._id} style={{ marginBottom: "24px", paddingLeft: "16px", borderLeft: "4px solid #8b5cf6" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                                            <strong style={{ color: "#7c3aed", fontSize: "16px" }}>{r.author.name}</strong>
                                            <span style={{ fontSize: "13px", color: "#94a3b8" }}>{formatDate(r.createdAt)}</span>
                                        </div>
                                        <p style={{ margin: "8px 0", color: "#374151", lineHeight: "1.7", fontSize: "16px" }}>
                                            {r.content}
                                        </p>

                                        <button
                                            onClick={() => handleLikeReply(q._id, r._id)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                marginTop: "8px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px"
                                            }}
                                        >
                                            <img
                                                src={r.likes.includes(user?._id) ? LIKE_FILLED : LIKE_EMPTY}
                                                alt="like reply"
                                                style={{ width: 20, height: 20 }}
                                            />
                                            <span style={{
                                                fontSize: "13px",
                                                color: r.likes.includes(user?._id) ? "#8b5cf6" : "#94a3b8"
                                            }}>
                                                {r.likes.length}
                                            </span>
                                        </button>
                                    </div>
                                ))}

                                {q.replies.length > 3 && (
                                    <p style={{ color: "#8b5cf6", fontWeight: "600", cursor: "pointer", fontSize: "15px", marginTop: "16px" }}>
                                        Xem thêm {q.replies.length - 3} trả lời khác...
                                    </p>
                                )}

                                {user && (
                                    <div style={{ display: "flex", gap: "16px", marginTop: "32px", alignItems: "flex-start" }}>
                                        <img
                                            src={user.avatar || "https://res.cloudinary.com/daqtutvru/image/upload/v1764064861/avatars/btr6syse9ecis5sqfa4q.png"}
                                            alt="you"
                                            style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0 }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <textarea
                                                placeholder="Reply..."
                                                value={replyInputs[q._id] || ""}
                                                onChange={(e) => setReplyInputs(prev => ({ ...prev, [q._id]: e.target.value }))}
                                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleReply(q._id))}
                                                style={{
                                                    width: "95%",
                                                    padding: "16px 20px",
                                                    borderRadius: "16px",
                                                    border: "2px solid #e2e8f0",
                                                    fontSize: "16px",
                                                    resize: "none",
                                                    minHeight: "90px",
                                                    outline: "none",
                                                    transition: "border 0.3s"
                                                }}
                                                onFocus={e => e.target.style.borderColor = "#8b5cf6"}
                                                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                                            />
                                            <div style={{ textAlign: "right", marginTop: "12px" }}>
                                                <button
                                                    onClick={() => handleReply(q._id)}
                                                    disabled={!replyInputs[q._id]?.trim()}
                                                    style={{
                                                        padding: "12px 32px",
                                                        background: replyInputs[q._id]?.trim() ? "#8b5cf6" : "#cbd5e1",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "16px",
                                                        fontWeight: "700",
                                                        cursor: replyInputs[q._id]?.trim() ? "pointer" : "not-allowed"
                                                    }}
                                                >
                                                    Gửi trả lời
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {data.pagination.pages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "16px", margin: "80px 0", flexWrap: "wrap" }}>
                    <button onClick={() => setPage(page - 1)} disabled={page === 1}
                        style={{ ...paginationBtn, opacity: page === 1 ? 0.4 : 1 }}>Prev</button>
                    {getPaginationRange().map((item, i) =>
                        item === "..." ? (
                            <span key={i} style={{ fontSize: "28px", color: "#cbd5e1" }}>...</span>
                        ) : (
                            <button
                                key={item}
                                onClick={() => setPage(item)}
                                style={{
                                    ...paginationBtn,
                                    background: page === item ? "#f97316" : "#1e293b",
                                    transform: page === item ? "scale(1.15)" : "scale(1)",
                                    boxShadow: page === item ? "0 0 20px rgba(249,115,22,0.6)" : "none"
                                }}
                            >
                                {item}
                            </button>
                        )
                    )}
                    <button onClick={() => setPage(page + 1)} disabled={page === data.pagination.pages}
                        style={{ ...paginationBtn, opacity: page === data.pagination.pages ? 0.4 : 1 }}>Next</button>
                </div>
            )}

            {showAskModal && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
                    backdropFilter: "blur(12px)"
                }} onClick={() => setShowAskModal(false)}>
                    <div style={{
                        background: "white", width: "90%", maxWidth: "680px", borderRadius: "28px",
                        padding: "48px", boxShadow: "0 30px 80px rgba(0,0,0,0.3)"
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ textAlign: "center", fontSize: "32px", fontWeight: "900", marginBottom: "32px", color: "#1e293b" }}>
                            Bạn đang thắc mắc gì hôm nay?
                        </h2>
                        <textarea
                            placeholder="Ví dụ: Tại sao lại nói 'I have been to London' mà không phải 'I went to London'?"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            style={{
                                width: "92%",
                                minHeight: "200px",
                                padding: "24px",
                                borderRadius: "20px",
                                border: "3px solid #e2e8f0",
                                fontSize: "18px",
                                resize: "vertical",
                                outline: "none"
                            }}
                            onFocus={e => e.target.style.borderColor = "#8b5cf6"}
                            onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                        />
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "20px", marginTop: "36px" }}>
                            <button onClick={() => setShowAskModal(false)} style={{
                                padding: "14px 36px",
                                background: "#e2e8f0",
                                color: "#475569",
                                border: "none",
                                borderRadius: "16px",
                                fontWeight: "600"
                            }}>
                                Hủy
                            </button>
                            <button
                                onClick={submitQuestion}
                                disabled={asking || !newQuestion.trim()}
                                style={{
                                    padding: "16px 48px",
                                    background: newQuestion.trim() ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "#94a3b8",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "16px",
                                    fontWeight: "800",
                                    fontSize: "17px",
                                    cursor: newQuestion.trim() ? "pointer" : "not-allowed"
                                }}
                            >
                                {asking ? "Đang gửi..." : "Gửi câu hỏi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const paginationBtn = {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "#1e293b",
    color: "white",
    border: "none",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease"
};

export default QuestionsPage;