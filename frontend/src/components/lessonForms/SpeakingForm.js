import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import FileInput from "../FileInput.js";
import Spinner from "../Spinner.js";

const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
const backPath = currentUser.role === "admin" ? "/admin" : "/instructor";

export default function SpeakingForm() {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();

    const [mediaUrl, setMediaUrl] = useState("");
    const [audioFile, setAudioFile] = useState(null);
    const [lines, setLines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const parseScript = (script) => {
        return script
            .split("\n")
            .map(line => {
                const match = line.match(/\[([\d.]+)-([\d.]+)\]\s*(.*)/);
                if (!match) return null;
                return {
                    start: parseFloat(match[1]),
                    end: parseFloat(match[2]),
                    text: match[3].trim()
                };
            })
            .filter(Boolean);
    };

    const requestWithRetry = async (requestFn, maxRetries = 3) => {
        for (let i = 0; i <= maxRetries; i++) {
            try {
                return await requestFn();
            } catch (err) {
                if (i === maxRetries) throw err;
                if (err.message.includes("Network Error")) {
                    console.log(`Mất kết nối, thử lại lần ${i + 1} sau 2s...`);
                    await new Promise(r => setTimeout(r, 2000));
                } else {
                    throw err;
                }
            }
        }
    };

    const handleTrackScript = async () => {
        if (!mediaUrl && !audioFile) {
            alert("Vui lòng nhập link YouTube hoặc tải lên file!");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await requestWithRetry(async () => {
                if (audioFile) {
                    const fd = new FormData();
                    fd.append("audio", audioFile);
                    return await api.post("/speaking/track", fd);
                } else {
                    return await api.post("/speaking/track", { mediaUrl });
                }
            });

            const newLines = parseScript(res.data.script);
            setLines(newLines);
            alert(`Đã dò ${newLines.length} câu!`);

            if (!mediaUrl && audioFile) {
                const fd = new FormData();
                fd.append("media", audioFile);
                try {
                    const uploadRes = await api.post(`/lessons/${lessonId}/media`, fd);
                    setMediaUrl(uploadRes.data.mediaUrl);
                } catch (err) {
                    console.warn("Không thể lưu mediaUrl:", err);
                }
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.details || err.message || "Lỗi không xác định";
            setError("Lỗi dò lời: " + msg);
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const updateLine = (index, field, value) => {
        const updated = [...lines];
        updated[index][field] = field === "text" ? value : parseFloat(value) || 0;
        setLines(updated);
    };

    const removeLine = (index) => {
        setLines(lines.filter((_, i) => i !== index));
    };

    const generateScript = () => {
        return lines
            .sort((a, b) => a.start - b.start)
            .map(l => `[${l.start.toFixed(1)}-${l.end.toFixed(1)}] ${l.text}`)
            .join("\n");
    };

    const handleSaveLesson = async () => {
        if (!courseId || !lessonId) return alert("Thiếu courseId hoặc lessonId!");
        if (lines.length === 0) return alert("Chưa có câu nào!");

        setLoading(true);
        setError("");

        try {
            let finalMediaUrl = mediaUrl;
            if (audioFile && !mediaUrl) {
                const fd = new FormData();
                fd.append("media", audioFile);
                const res = await api.post(`/lessons/${lessonId}/media`, fd);
                finalMediaUrl = res.data.mediaUrl;
            }

            await api.put(`/lessons/${lessonId}/content`, {
                content: generateScript(),
                mediaUrl: finalMediaUrl,
            });

            alert("Lưu bài học thành công!");
            navigate(`/admin/course/${courseId}/details`);
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            setError("Lỗi lưu bài học: " + msg);
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluate = async () => {
        if (!audioFile) return alert("Chọn file ghi âm!");
        setLoading(true);
        setError("");

        try {
            const fd = new FormData();
            fd.append("audio", audioFile);
            fd.append("originalScript", generateScript() || "Hello");
            const res = await api.post("/speaking/evaluate", fd);
            setResult(res.data);
        } catch (err) {
            const msg = err.response?.data?.error || err.message;
            setError("Lỗi chấm phát âm: " + msg);
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => navigate(`/admin/course/${courseId}/details`);
    const handleFinish = () => navigate(backPath);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (lines.length > 0) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [lines]);

    return (
        <div style={{ maxWidth: 900, margin: "auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
            <h2>Shadowing Lesson - Tự động dò lời + timestamp</h2>
            <p style={{ color: "gray" }}>Course ID: <b>{courseId}</b> | Lesson ID: <b>{lessonId}</b></p>

            {error && (
                <div style={{ background: "#ffebee", color: "#c62828", padding: 12, borderRadius: 6, marginBottom: 15 }}>
                    {error}
                </div>
            )}

            <label>URL YouTube hoặc file audio/video</label>
            <input
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                style={s.input}
            />
            <FileInput accept="audio/*,video/*" onChange={setAudioFile} />

            <button onClick={handleTrackScript} style={s.btn("blue")} disabled={loading}>
                {loading ? "Đang dò lời..." : "Dò lời + Gán thời gian"}
            </button>

            <hr style={{ margin: "20px 0" }} />

            <h3>Danh sách câu ({lines.length})</h3>
            <div style={{ maxHeight: 400, overflowY: "auto", border: "1px solid #ddd", borderRadius: 8, padding: 10 }}>
                {lines.length === 0 ? (
                    <p style={{ color: "#999", textAlign: "center" }}>Nhấn "Dò lời" để bắt đầu</p>
                ) : (
                    lines.map((line, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                            <input value={line.start} onChange={e => updateLine(i, "start", e.target.value)} style={s.timeInput} />
                            <span>→</span>
                            <input value={line.end} onChange={e => updateLine(i, "end", e.target.value)} style={s.timeInput} />
                            <input value={line.text} onChange={e => updateLine(i, "text", e.target.value)} style={s.textInput} />
                            <button onClick={() => removeLine(i)} style={{ color: "red", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}>×</button>
                        </div>
                    ))
                )}
            </div>

            <div style={{ marginTop: 15, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={handleSaveLesson} style={s.btn("green")} disabled={loading}>
                    Lưu bài học
                </button>
                <button onClick={handleBack} style={s.btn("gray")} disabled={loading}>Quay lại Course</button>

                {currentUser.role === "admin" && (
                    <button onClick={handleFinish} style={s.btn("dark")} disabled={loading}>Về Admin</button>
                )}
                {currentUser.role === "instructor" && (
                    <button onClick={handleFinish} style={s.btn("dark")} disabled={loading}>Về Instructor</button>
                )}
            </div>

            {loading && <Spinner />}

            {result && (
                <div style={{ background: "#f0f8ff", padding: 15, marginTop: 15, borderRadius: 10, border: "1px solid #b3d9ff" }}>
                    <p><b>Độ chính xác:</b> {result.comparison?.accuracy ?? "?"}%</p>
                    <p><b>Nhận xét:</b> {result.comparison?.pronunciationFeedback || "Không có"}</p>
                    <p><b>Từ sai:</b> {(result.comparison?.missedWords || []).join(", ") || "Không"}</p>
                </div>
            )}
        </div>
    );
}

const s = {
    input: { width: "100%", padding: 10, marginBottom: 10, borderRadius: 6, border: "1px solid #ccc" },
    timeInput: { width: 70, padding: 8, borderRadius: 4, border: "1px solid #aaa", textAlign: "center" },
    textInput: { flex: 1, padding: 8, borderRadius: 4, border: "1px solid #aaa" },
    btn: (color) => {
        const colors = { blue: "#007bff", green: "#28a745", gray: "#6c757d", dark: "#343a40", purple: "#6f42c1" };
        return { margin: "0 5px", padding: "12px 20px", background: colors[color], color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 };
    }
};