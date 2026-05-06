// src/components/DictionaryWidget.js
import { useState } from "react";
import { motion } from "framer-motion";

function DictionaryWidget({ onClose }) {  // ← THÊM PROP onClose
    const [word, setWord] = useState("");
    const [definition, setDefinition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async () => {
        if (!word.trim()) return;
        setLoading(true);
        setError("");
        setDefinition(null);

        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            const data = await res.json();
            if (Array.isArray(data) && data[0]) {
                setDefinition(data[0]);
            } else {
                setError("Không tìm thấy nghĩa cho từ này");
            }
        } catch {
            setError("Lỗi kết nối API");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            style={{
                position: "fixed",
                bottom: "100px",
                right: "24px",
                width: "320px",
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                padding: "16px",
                fontFamily: "Arial, sans-serif",
                zIndex: 1000,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h4 style={{ margin: 0, fontWeight: "bold" }}>Từ điển nhanh</h4>
                <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>×</button>
            </div>

            <input
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Nhập từ tiếng Anh..."
                style={{
                    width: "92%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    fontSize: "14px",
                    outline: "none"
                }}
            />

            <button
                onClick={handleSearch}
                style={{
                    width: "100%",
                    padding: "10px",
                    background: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold"
                }}
            >
                Tra cứu
            </button>

            {loading && <p style={{ margin: "12px 0", color: "#666" }}>Đang tải...</p>}
            {error && <p style={{ margin: "12px 0", color: "#e74c3c" }}>{error}</p>}

            {definition && (
                <div style={{ marginTop: "12px" }}>
                    <h5 style={{ margin: "0 0 4px", fontWeight: "bold", color: "#1976d2" }}>{definition.word}</h5>
                    <p style={{ margin: "0 0 8px", color: "#444" }}>
                        {definition.meanings[0].definitions[0].definition}
                    </p>
                    {definition.meanings[0].definitions[0].example && (
                        <p style={{ margin: 0, fontSize: "13px", color: "#777", fontStyle: "italic" }}>
                            Ví dụ: {definition.meanings[0].definitions[0].example}
                        </p>
                    )}
                </div>
            )}
        </motion.div>
    );
}

export default DictionaryWidget;