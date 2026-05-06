import React from "react";

export default function Spinner() {
    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
        <div
            style={{
            width: "30px",
            height: "30px",
            border: "4px solid #ccc",
            borderTop: "4px solid #333",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "auto",
            }}
        />
        <style>{`
            @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
            }
        `}</style>
        <p>Đang tải...</p>
        </div>
    );
}
