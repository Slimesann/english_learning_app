import React, { useState, useEffect, useRef } from "react";
import { chatWithAI } from "../services/geminiService";

// ICON GỬI CỦA BẠN (đã tối ưu link Cloudinary)
const SEND_ICON_URL = "https://res.cloudinary.com/daqtutvru/image/upload/v1764279568/send_l1ynkg.png";

function EnglishChatBox({ onClose }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    /* --- Load & Save history --- */
    useEffect(() => {
        const saved = localStorage.getItem("englishChatHistory");
        if (saved) {
            try { setMessages(JSON.parse(saved)); }
            catch { localStorage.removeItem("englishChatHistory"); }
        } else {
            setMessages([{
                role: "assistant",
                content: "Hi! I'm your English learning assistant. Ask me anything!",
                timestamp: new Date().toISOString()
            }]);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("englishChatHistory", JSON.stringify(messages));
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    /* --- Send Message --- */
    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: "user", content: input.trim(), timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const reply = await chatWithAI([...messages, userMessage]);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: reply || "I'm not sure how to respond to that.",
                timestamp: new Date().toISOString()
            }]);
        } catch (err) {
            console.error("AI Error:", err);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Sorry, I could not connect to the AI server.",
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    /* --- Render AI message --- */
    const renderAssistantMessage = (content) => {
        if (!content || typeof content !== "string")
            return <div style={{ color: "#999", fontStyle: "italic" }}>...</div>;

        const clean = content.replace(/\*\*/g, "").replace(/\*/g, "").replace(/_/g, "").trim();
        const lines = clean.split("\n");

        return lines.map((line, i) => {
            const text = line.trim();
            if (!text) return null;

            if (text.startsWith("Word:")) return <div key={i} style={{ fontWeight: "bold", fontSize: "16px", color: "#1976d2", margin: "12px 0 6px" }}>{text}</div>;
            if (text.startsWith("Part of Speech:")) return <div key={i} style={{ fontStyle: "italic", color: "#7c3aed", marginBottom: 6 }}>{text}</div>;
            if (text.startsWith("Meaning") || text.startsWith("Definition")) return <div key={i} style={{ marginBottom: 8, lineHeight: "1.5" }}>{text}</div>;
            if (text.startsWith("Example:")) return (
                <div key={i} style={{ background: "#f0f8ff", padding: "10px 14px", borderRadius: "12px", borderLeft: "4px solid #1976d2", margin: "10px 0", fontStyle: "italic", color: "#1e40af" }}>
                    {text}
                </div>
            );
            if (text.startsWith("Pronunciation")) return (
                <div key={i} style={{ fontFamily: "monospace", background: "#fff0f0", padding: "8px 12px", borderRadius: "8px", display: "inline-block", fontSize: "14px", color: "#c0392b", margin: "8px 0" }}>
                    {text}
                </div>
            );
            if (text.startsWith("Grammar Point")) return <div key={i} style={{ fontWeight: "bold", fontSize: "15px", color: "#d97706", margin: "16px 0 8px" }}>{text}</div>;
            if (text.startsWith("Structure:")) return (
                <div key={i} style={{ background: "#fff8e1", padding: "12px 16px", borderRadius: "12px", border: "1px solid #ffc107", fontFamily: "monospace", fontSize: "14px", margin: "12px 0", color: "#92400e" }}>
                    {text}
                </div>
            );

            return <div key={i} style={{ marginBottom: 8, lineHeight: "1.6" }}>{text}</div>;
        });
    };

    return (
        <div style={{
            position: "fixed",
            bottom: "100px",
            right: "24px",
            width: "400px",
            height: "560px",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
            zIndex: 1000,
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            fontFamily: "'Segoe UI', sans-serif"
        }}>
            {/* HEADER */}
            <div style={{
                background: "linear-gradient(135deg, #1976d2, #0d47a1)",
                color: "white",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: "17px"
            }}>
                <span>English Assistant</span>
                <button onClick={onClose} style={{
                    background: "none", border: "none", color: "white", fontSize: "28px",
                    cursor: "pointer", width: "36px", height: "36px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                >×</button>
            </div>

            {/* MESSAGES */}
            <div style={{
                flex: 1, overflowY: "auto", padding: "16px",
                background: "#f5f7fa",
                backgroundImage: "radial-gradient(circle at 10px 10px, #e3e8ee 1px, transparent 0)",
                backgroundSize: "20px 20px"
            }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ marginBottom: "16px", display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                        <div style={{
                            maxWidth: "82%", padding: "12px 16px", borderRadius: "18px",
                            background: msg.role === "user" ? "#1976d2" : "white",
                            color: msg.role === "user" ? "white" : "#1a1a1a",
                            boxShadow: msg.role === "user" ? "0 4px 12px rgba(25,118,210,0.3)" : "0 2px 8px rgba(0,0,0,0.1)",
                            border: msg.role === "assistant" ? "1px solid #e0e0e0" : "none"
                        }}>
                            {msg.role === "assistant" ? renderAssistantMessage(msg.content) : msg.content}
                            <div style={{ fontSize: "10px", marginTop: "6px", opacity: 0.7, textAlign: msg.role === "user" ? "right" : "left" }}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading */}
                {loading && (
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                        <div style={{
                            background: "white", padding: "12px 16px", borderRadius: "18px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: "1px solid #e0e0e0",
                            display: "flex", alignItems: "center", gap: "8px"
                        }}>
                            <div style={{ display: "flex", gap: "4px" }}>
                                <span style={{ width: 8, height: 8, background: "#999", borderRadius: "50%", animation: "pulse 1.5s infinite" }}></span>
                                <span style={{ width: 8, height: 8, background: "#999", borderRadius: "50%", animation: "pulse 1.5s infinite 0.2s" }}></span>
                                <span style={{ width: 8, height: 8, background: "#999", borderRadius: "50%", animation: "pulse 1.5s infinite 0.4s" }}></span>
                            </div>
                            <span style={{ fontSize: "14px", color: "#666" }}>AI is thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT + NÚT GỬI BẰNG ẢNH CỦA BẠN */}
            <div style={{
                padding: "16px",
                borderTop: "1px solid #eee",
                background: "white",
                display: "flex",
                gap: "12px",
                alignItems: "flex-end"
            }}>
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about English..."
                    rows={1}
                    style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: "24px",
                        border: "2px solid #e0e0e0",
                        fontSize: "15px",
                        resize: "none",
                        outline: "none",
                        transition: "all 0.2s",
                        maxHeight: "100px",
                        overflowY: "auto",
                        fontFamily: "inherit"
                    }}
                    onFocus={e => e.target.style.borderColor = "#1976d2"}
                    onBlur={e => e.target.style.borderColor = "#e0e0e0"}
                    disabled={loading}
                />

                {/* NÚT GỬI DÙNG ẢNH CỦA BẠN */}
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: loading || !input.trim() ? "#e0e0e0" : "#1976d2",
                        border: "none",
                        cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        boxShadow: loading || !input.trim() ? "none" : "0 6px 20px rgba(25,118,210,0.4)",
                        position: "relative"
                    }}
                    onMouseEnter={e => !loading && input.trim() && (e.currentTarget.style.transform = "scale(1.12)")}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                    <img
                        src={SEND_ICON_URL}
                        alt="Send"
                        style={{
                            width: "28px",
                            height: "28px",
                            filter: loading || !input.trim() ? "grayscale(100%) opacity(0.6)" : "none",
                            transition: "filter 0.3s"
                        }}
                    />

                    {/* Loading spinner phủ lên ảnh khi đang gửi */}
                    {loading && (
                        <div style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(25,118,210,0.9)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <div style={{
                                width: "20px",
                                height: "20px",
                                border: "3px solid transparent",
                                borderTop: "3px solid white",
                                borderRadius: "50%",
                                animation: "spin 1s linear infinite"
                            }}></div>
                        </div>
                    )}
                </button>
            </div>

            {/* CSS */}
            <style jsx>{`
                @keyframes pulse { 0%,100% {opacity:.4;transform:scale(.8)} 50% {opacity:1;transform:scale(1)} }
                @keyframes spin { from {transform:rotate(0deg)} to {transform:rotate(360deg)} }
            `}</style>
        </div>
    );
}

export default EnglishChatBox;