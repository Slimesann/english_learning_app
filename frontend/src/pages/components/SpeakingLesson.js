// src/components/SpeakingLesson.js
import React, { useState, useRef, useEffect } from "react";
import api from "../../services/api";

function SpeakingLesson({ lesson }) {
    const [currentLine, setCurrentLine] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordings, setRecordings] = useState({});
    const [allRecorded, setAllRecorded] = useState(false);
    const [hasPlayed, setHasPlayed] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false); // <-- THÊM DÒNG NÀY

    // Key lưu tiến độ riêng cho từng lesson
    const STORAGE_KEY = `speaking_progress_${lesson._id}`;

    // Refs
    const playerRef = useRef(null);
    const playerContainerRef = useRef(null);
    const audioRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const checkEndRef = useRef(null);

    const isYouTube = lesson.mediaUrl?.includes("youtube.com") || lesson.mediaUrl?.includes("youtu.be");

    // Parse script
    const parsedLines = (lesson.content || "")
        .split("\n")
        .map((line) => {
            const m = line.match(/\[([\d.]+)-([\d.]+)\]\s*(.*)/);
            if (!m) return null;
            return {
                start: parseFloat(m[1]),
                end: parseFloat(m[2]),
                text: m[3].trim(),
            };
        })
        .filter(Boolean);

    // ================== KHÔI PHỤC & LƯU TIẾN ĐỘ ==================
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setRecordings(data.recordings || {});
                setCurrentLine(data.currentLine || 0);
            } catch (e) {
                console.warn("Không đọc được tiến độ cũ");
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, [lesson._id]);

    useEffect(() => {
        if (Object.keys(recordings).length === 0 && currentLine === 0) return;

        const progress = { recordings, currentLine };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

        const completed = Object.keys(recordings).length === parsedLines.length &&
            Object.values(recordings).every(r => r?.result);
        setAllRecorded(completed);
    }, [recordings, currentLine]);

    useEffect(() => {
        if (!isYouTube || !playerContainerRef.current) return;

        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScript = document.getElementsByTagName("script")[0];
        firstScript.parentNode.insertBefore(tag, firstScript);

        window.onYouTubeIframeAPIReady = () => {
            playerRef.current = new window.YT.Player(playerContainerRef.current, {
                height: "330",
                width: "100%",
                videoId: getYouTubeId(lesson.mediaUrl),
                playerVars: { autoplay: 0, controls: 1, modestbranding: 1, rel: 0, fs: 1 },
                events: { onReady: () => console.log("YouTube Ready") },
            });
        };

        return () => playerRef.current?.destroy?.();
    }, [isYouTube, lesson.mediaUrl]);

    const getYouTubeId = (url) => {
        const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&#?]+)/);
        return match ? match[1] : null;
    };

    const playCurrentLine = () => {
        const line = parsedLines[currentLine];
        if (!line) return;

        setHasPlayed(false);
        if (checkEndRef.current?.clear) {
            checkEndRef.current.clear();
            checkEndRef.current = null;
        }

        if (isYouTube && playerRef.current?.seekTo) {
            playerRef.current.seekTo(line.start, true);
            playerRef.current.playVideo();

            const interval = setInterval(() => {
                const t = playerRef.current?.getCurrentTime() || 0;
                if (t >= line.end) {
                    clearInterval(interval);
                    playerRef.current.pauseVideo();
                    setTimeout(() => setHasPlayed(true), 300);
                }
            }, 100);
            checkEndRef.current = { clear: () => clearInterval(interval) };

        } else if (!isYouTube && audioRef.current) {
            const audio = audioRef.current;
            audio.currentTime = line.start;
            audio.play().catch(() => {});

            const handler = () => {
                if (audio.currentTime >= line.end) {
                    audio.pause();
                    audio.removeEventListener("timeupdate", handler);
                    setTimeout(() => setHasPlayed(true), 300);
                }
            };
            audio.addEventListener("timeupdate", handler);
            checkEndRef.current = { clear: () => audio.removeEventListener("timeupdate", handler) };
        }
    };

    useEffect(() => {
        if (isPlaying) playCurrentLine();
    }, [currentLine, isPlaying]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const rec = new MediaRecorder(stream);
            mediaRecorderRef.current = rec;
            chunksRef.current = [];

            rec.ondataavailable = (e) => chunksRef.current.push(e.data);

            rec.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                const url = URL.createObjectURL(blob);
                const lineText = parsedLines[currentLine]?.text || "";

                setRecordings(p => ({ ...p, [currentLine]: { url, loading: true } }));

                const fd = new FormData();
                fd.append("audio", blob);
                fd.append("originalScript", lineText);

                try {
                    const res = await api.post("/speaking/evaluate", fd);
                    setRecordings(p => ({
                        ...p,
                        [currentLine]: { url, result: res.data, loading: false },
                    }));
                } catch (err) {
                    setRecordings(p => ({
                        ...p,
                        [currentLine]: { url, error: "Lỗi mạng", loading: false },
                    }));
                }
            };

            rec.start();
            setIsRecording(true);
        } catch (err) {
            alert("Không thể truy cập microphone!");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
            setIsRecording(false);
        }
    };

    const nextLine = () => {
        if (currentLine < parsedLines.length - 1) {
            setCurrentLine(currentLine + 1);
            setHasPlayed(false);
        } else {
            setIsPlaying(false);
        }
    };

    const prevLine = () => {
        if (currentLine > 0) setCurrentLine(currentLine - 1);
    };

    const retryLine = () => {
        setRecordings(p => ({ ...p, [currentLine]: null }));
        setHasPlayed(false);
        playCurrentLine();
    };

    const startLesson = () => {
        setIsPlaying(true);
        setHasPlayed(false);
    };

    const submitSpeaking = async () => {
        const u = JSON.parse(localStorage.getItem("user"));
        const scores = Object.values(recordings).map(r => r.result?.comparison?.accuracy || 0);
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length || 0);

        try {
            await api.post("/results", {
                userId: u._id,
                courseId: lesson.courseId,
                lessonId: lesson._id,
                type: "speaking",
                score: avg,
            });
            alert(`Nộp bài thành công! Điểm: ${avg}%`);
        } catch (err) {
            alert("Lỗi nộp bài!");
        }
    };

    return (
        <>
            {showResetConfirm && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.65)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        animation: "fadeIn 0.3s ease"
                    }}
                    onClick={() => setShowResetConfirm(false)}
                >
                    <div
                        style={{
                            background: "white",
                            padding: "36px 48px",
                            borderRadius: 24,
                            maxWidth: 460,
                            textAlign: "center",
                            boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
                            animation: "popup 0.4s ease"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ fontSize: 80, marginBottom: 16 }}>Warning</div>
                        <h2 style={{ margin: "16px 0", fontSize: 26, fontWeight: 700, color: "#2c3e50" }}>
                            Xóa toàn bộ tiến độ?
                        </h2>
                        <p style={{ color: "#7f8c8d", lineHeight: 1.6, marginBottom: 32 }}>
                            Tất cả câu đã ghi âm sẽ bị xóa vĩnh viễn.<br />
                            <strong>Không thể khôi phục được!</strong>
                        </p>
                        <div>
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                style={{
                                    padding: "14px 32px",
                                    background: "#95a5a6",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 14,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    margin: "0 12px"
                                }}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem(STORAGE_KEY);
                                    setRecordings({});
                                    setCurrentLine(0);
                                    setAllRecorded(false);
                                    setShowResetConfirm(false);
                                }}
                                style={{
                                    padding: "14px 32px",
                                    background: "#e74c3c",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 14,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    margin: "0 12px",
                                    boxShadow: "0 6px 16px rgba(231,76,60,0.4)"
                                }}
                            >
                                Xóa hết, làm lại
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ padding: 20, maxWidth: 1300, margin: "auto" }}>
                <h2 style={{ textAlign: "center", marginBottom: 10 }}>Bài nói – Shadowing</h2>

                <div style={{ textAlign: "right", marginBottom: 15 }}>
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        style={{
                            padding: "10px 22px",
                            background: "#e74c3c",
                            color: "white",
                            border: "none",
                            borderRadius: 12,
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(231,76,60,0.35)"
                        }}
                    >
                        Làm lại từ đầu
                    </button>
                </div>

                <div style={{ display: "flex", gap: 20 }}>
                    <div style={{ width: "55%" }}>
                        {isYouTube ? (
                            <div ref={playerContainerRef} style={{
                                width: "100%", height: 330, borderRadius: 16,
                                overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.15)"
                            }} />
                        ) : (
                            <audio ref={audioRef} controls src={lesson.mediaUrl}
                                style={{ width: "100%", borderRadius: 12 }} />
                        )}

                        <div style={{
                            marginTop: 20, background: "#fffce8", border: "2px solid #f7d76b",
                            padding: 18, borderRadius: 16, fontSize: 20, fontWeight: 700, textAlign: "center"
                        }}>
                            {parsedLines[currentLine]?.text || "—"}

                            {hasPlayed && (
                                <div style={{ marginTop: 18 }}>
                                    {!isRecording ? (
                                        <button style={btn} onClick={startRecording}>Bắt đầu ghi âm</button>
                                    ) : (
                                        <button style={{ ...btn, background: "#e74c3c" }} onClick={stopRecording}>
                                            Dừng ghi âm
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{
                        width: "45%", maxHeight: 620, overflowY: "auto",
                        borderRadius: 16, border: "1px solid #ddd", padding: 16,
                        background: "white", boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
                    }}>
                        {parsedLines.map((line, i) => {
                            const rec = recordings[i];
                            const isActive = i === currentLine;
                            const isDone = !!rec?.result;

                            return (
                                <div
                                    key={i}
                                    onClick={() => setCurrentLine(i)}
                                    style={{
                                        background: isActive ? "#fff7c4" : isDone ? "#d5f5e3" : "#fafafa",
                                        border: isActive ? "2px solid #f4c542" : "1px solid #eaeaea",
                                        padding: 14, borderRadius: 12, marginBottom: 12,
                                        cursor: "pointer", transition: "all 0.2s"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <b>[{line.start.toFixed(1)} - {line.end.toFixed(1)}s]</b>
                                        {isDone && <span style={{ color: "#27ae60", fontWeight: "bold", fontSize: 12 }}>ĐÃ HOÀN THÀNH</span>}
                                    </div>
                                    <div style={{ marginTop: 6 }}>{line.text}</div>
                                    {rec?.result && (
                                        <div style={{ marginTop: 8, fontSize: 13, color: "#2c3e50" }}>
                                            <b>Điểm:</b> {rec.result.comparison?.accuracy}%
                                            <br /><b>Bạn nói:</b> {rec.result.transcript}
                                        </div>
                                    )}
                                    {rec?.loading && <small style={{ color: "#f39c12" }}>Đang đánh giá...</small>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ marginTop: 30, textAlign: "center" }}>
                    {!isPlaying ? (
                        <button style={btn} onClick={startLesson}>
                            {Object.keys(recordings).length === 0 ? "Bắt đầu bài học" : "Tiếp tục bài học"}
                        </button>
                    ) : (
                        <>
                            <button style={btn} onClick={prevLine} disabled={currentLine === 0}>Câu trước</button>
                            <button style={btn} onClick={retryLine}>Ghi lại câu này</button>
                            <button style={btn} onClick={nextLine}>
                                {currentLine === parsedLines.length - 1 ? "Kết thúc" : "Câu sau"}
                            </button>
                        </>
                    )}
                </div>

                {allRecorded && (
                    <div style={{ textAlign: "center", marginTop: 30 }}>
                        <button style={{ ...btn, background: "#27ae60", padding: "16px 40px", fontSize: 18 }} onClick={submitSpeaking}>
                            Nộp bài – Điểm trung bình: {Math.round(
                                Object.values(recordings).reduce((a, r) => a + (r.result?.comparison?.accuracy || 0), 0) /
                                Object.keys(recordings).length
                            )}%
                        </button>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes popup { 
                    0% { transform: scale(0.7); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </>
    );
}

const btn = {
    padding: "12px 28px",
    background: "#3498db",
    border: "none",
    borderRadius: 12,
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    margin: "0 10px",
    fontSize: 15,
    minWidth: 130
};

export default SpeakingLesson;