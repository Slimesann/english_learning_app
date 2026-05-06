import React from "react";

export default function QuizPreview({ items = [] }) {
    if (!items || items.length === 0) {
        return <p style={{ color: "gray" }}>Chưa có quiz nào</p>;
    }

    return (
        <div style={{ marginTop: 20 }}>
        <h4>Quiz Preview</h4>
        <ul>
            {items.map((q, i) => (
            <li key={i} style={{ marginBottom: 12 }}>
                <strong>{q.question || `Câu hỏi ${i + 1}`}</strong>
                <ul>
                {q.options?.map((opt, j) => (
                    <li key={j}>
                    {opt} {opt === q.answer ? "✅" : ""}
                    </li>
                ))}
                </ul>
            </li>
            ))}
        </ul>
        </div>
    );
}
