import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { updateLessonProgress } from "../services/progress";
import api from "../services/api.js";
import Result from "./result";  

function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5);
}

function Quiz({ questions = [], lessonId, courseId, quizId, onFinish }) {
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [resultData, setResultData] = useState(null);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        const randomized = questions.map((q) => {
            const shuffledOptions = shuffleArray(q.options);
            return {
                ...q,
                options: shuffledOptions,
                correctAnswerIndex: shuffledOptions.indexOf(q.correctAnswer),
            };
        });
        setShuffledQuestions(shuffleArray(randomized));
    }, [questions]);

    const handleChange = (questionId, optionValue) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionValue }));
    };

    const calculateScore = () => {
        return shuffledQuestions.reduce((total, q) => {
            return total + (answers[q._id] === q.options[q.correctAnswerIndex] ? 1 : 0);
        }, 0);
    };

    const saveQuizResult = async (score, correct, total) => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;

        try {
            await api.post("/results", {
                userId: user.id || user._id,
                courseId,
                lessonId,
                type: "quiz",
                score,
                correctAnswers: correct,
                totalQuestions: total,
                scorePercent: Math.round((correct / total) * 100),
            });
        } catch (err) {
            console.error("Không thể lưu kết quả quiz:", err?.response?.data || err.message);
        }
    };

    const handleSubmit = async () => {
        if (submitting || Object.keys(answers).length === 0) return;
        setSubmitting(true);

        const score = calculateScore();  
        const total = shuffledQuestions.length;
        const scorePercent = Math.round((score / total) * 100);  

        try {
            await updateLessonProgress(lessonId, { 
                completed: scorePercent >= 80,  
                score: scorePercent, 
                quizId, 
                answers 
            }, localStorage.getItem("token") || "");

            await saveQuizResult(score, score, total); 

            setResultData({ 
                score, 
                total, 
                scorePercent, 
                answers, 
                passed: scorePercent >= 80  
            });
            setShowResult(true);

            if (onFinish) onFinish({ answers, score: scorePercent }); 
        } catch (err) {
            console.error("Lỗi khi lưu tiến độ:", err);
            alert("Có lỗi khi nộp bài. Vui lòng thử lại!");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetry = () => {
        setAnswers({});
        setShowResult(false);
        setResultData(null);
    };

    if (showResult && resultData) {
        return (
            <Result 
                result={resultData} 
                onRetry={handleRetry} 
            />
        );
    }

    return (
        <div style={{ fontFamily: "Arial, sans-serif", padding: 16 }}>
            <h3 style={{ color: "#2c3e50", marginBottom: 20 }}>Bài tập Quiz</h3>

            {shuffledQuestions.length === 0 ? (
                <p style={{ color: "#e74c3c", fontStyle: "italic" }}>Chưa có câu hỏi.</p>
            ) : (
                shuffledQuestions.map((q, idx) => (
                    <div
                        key={q._id}
                        style={{
                            marginBottom: 24,
                            padding: 16,
                            background: "#f8f9fa",
                            borderRadius: 12,
                            border: "1px solid #eee"
                        }}
                    >
                        <div style={{ fontWeight: "bold", marginBottom: 12, fontSize: 16 }}>
                            {idx + 1}. {q.question}
                        </div>
                        {q.options.map((opt) => (
                            <label
                                key={opt}
                                style={{
                                    display: "block",
                                    margin: "8px 0",
                                    padding: "8px",
                                    borderRadius: 8,
                                    background: answers[q._id] === opt ? "#e3f2fd" : "transparent",
                                    border: answers[q._id] === opt ? "2px solid #2196f3" : "1px solid #ddd",
                                    cursor: "pointer"
                                }}
                            >
                                <input
                                    type="radio"
                                    name={q._id}
                                    value={opt}
                                    checked={answers[q._id] === opt}
                                    onChange={() => handleChange(q._id, opt)}
                                    style={{ marginRight: 8 }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                ))
            )}

            <div style={{ textAlign: "center", marginTop: 28 }}>
                <button
                    onClick={handleSubmit}
                    disabled={submitting || Object.keys(answers).length !== shuffledQuestions.length}
                    style={{
                        padding: "14px 32px",
                        background: Object.keys(answers).length === shuffledQuestions.length ? "#27ae60" : "#95a5a6",
                        color: "#fff",
                        border: "none",
                        borderRadius: 12,
                        fontSize: 16,
                        fontWeight: "bold",
                        cursor: Object.keys(answers).length === shuffledQuestions.length ? "pointer" : "not-allowed",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        transition: "all 0.2s"
                    }}
                >
                    {submitting ? "Đang nộp..." : "Nộp bài"}
                </button>
            </div>

            {Object.keys(answers).length !== shuffledQuestions.length && shuffledQuestions.length > 0 && (
                <p style={{ textAlign: "center", color: "#e67e22", marginTop: 12, fontSize: 14 }}>
                    Vui lòng trả lời tất cả câu hỏi!
                </p>
            )}
        </div>
    );
}

Quiz.propTypes = {
    questions: PropTypes.array.isRequired,
    lessonId: PropTypes.string.isRequired,
    courseId: PropTypes.string,
    quizId: PropTypes.string.isRequired,
    onFinish: PropTypes.func,
};

export default Quiz;