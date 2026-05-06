import React from "react";
import PropTypes from "prop-types";

function Result({ result, onRetry }) {
    if (!result) return null;

    const { score, total } = result;
    const percent = Math.round((score / total) * 100);

    return (
        <div
            style={{
                border: "1px solid #ddd",
                padding: 24,
                borderRadius: 16,
                marginTop: 20,
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                textAlign: "center",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
            }}
        >
            <h3 style={{ color: "#2c3e50", marginBottom: 16 }}>Kết quả Quiz</h3>
            <div style={{ fontSize: 36, fontWeight: "bold", color: percent >= 80 ? "#27ae60" : percent >= 50 ? "#e67e22" : "#e74c3c" }}>
                {score} / {total}
            </div>
            <p style={{ fontSize: 18, margin: "12px 0", color: "#34495e" }}>
                Tỷ lệ đúng: <strong>{percent}%</strong>
            </p>

            {percent === 100 ? (
                <p style={{ color: "#27ae60", fontSize: 18, fontWeight: "bold" }}>Xuất sắc! Bạn làm đúng tất cả!</p>
            ) : percent >= 80 ? (
                <p style={{ color: "#27ae60" }}>Rất tốt! Tiếp tục phát huy!</p>
            ) : percent >= 50 ? (
                <p style={{ color: "#e67e22" }}>Khá tốt, nhưng bạn có thể làm lại để cải thiện!</p>
            ) : (
                <p style={{ color: "#e74c3c" }}>Cần luyện tập thêm, thử lại nhé!</p>
            )}

            <button
                onClick={onRetry}
                style={{
                    marginTop: 20,
                    padding: "12px 28px",
                    background: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(52, 152, 219, 0.3)",
                    transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.target.style.background = "#2980b9"}
                onMouseOut={(e) => e.target.style.background = "#3498db"}
            >
                Làm lại Quiz
            </button>
        </div>
    );
}

Result.propTypes = {
    result: PropTypes.shape({
        score: PropTypes.number.isRequired,
        total: PropTypes.number.isRequired,
        answers: PropTypes.object.isRequired,
    }).isRequired,
    onRetry: PropTypes.func.isRequired,
};

export default Result;