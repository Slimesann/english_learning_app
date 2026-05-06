import React, { useState } from "react";
import axios from "axios";

const QuizManager = ({ lessonId, token }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [manualQuestions, setManualQuestions] = useState([
        { question: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);

    const [text, setText] = useState(""); 
    const [audioFile, setAudioFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState("manual");

    // 🟩 Thêm câu hỏi thủ công
    const handleAddQuestion = () => {
        setManualQuestions([
        ...manualQuestions,
        { question: "", options: ["", "", "", ""], correctAnswer: "" },
        ]);
    };

    const handleChangeQuestion = (index, field, value) => {
        const newQuestions = [...manualQuestions];
        if (field === "question" || field === "correctAnswer") {
        newQuestions[index][field] = value;
        } else if (field.startsWith("option")) {
        const optIndex = parseInt(field.replace("option", ""), 10);
        newQuestions[index].options[optIndex] = value;
        }
        setManualQuestions(newQuestions);
    };

    // 🟦 Gửi quiz thủ công
    const handleSubmitManual = async () => {
        try {
        setLoading(true);
        const res = await axios.post(
            "/api/quizzes",
            {
            lessonId,
            title: "Manual Quiz",
            questions: manualQuestions,
            },
            {
            headers: { Authorization: `Bearer ${token}` },
            }
        );
        setQuizzes([...quizzes, res.data]);
        alert("✅ Quiz created successfully!");
        } catch (err) {
        alert("❌ " + (err.response?.data?.error || err.message));
        } finally {
        setLoading(false);
        }
    };

    // 🟨 Generate quiz bằng AI cho Reading
    const handleGenerateReading = async () => {
        try {
        if (!text) return alert("Please enter reading text first!");
        setLoading(true);
        const res = await axios.post("/api/reading/generate-quiz", {
            text,
            numQuestions: 5,
        });
        setManualQuestions(res.data);
        alert("✅ AI generated quiz successfully!");
        } catch (err) {
        alert("❌ " + (err.response?.data?.error || err.message));
        } finally {
        setLoading(false);
        }
    };

    // 🟧 Generate quiz bằng AI cho Listening
    const handleGenerateListening = async () => {
        try {
        if (!audioFile) return alert("Please upload an audio file!");
        setLoading(true);

        const formData = new FormData();
        formData.append("audio", audioFile);

        const res = await axios.post("/api/listening/generate-quiz", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        setManualQuestions(res.data);
        alert("✅ AI generated quiz from audio!");
        } catch (err) {
        alert("❌ " + (err.response?.data?.error || err.message));
        } finally {
        setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
        <h2 style={styles.heading}>🧩 Quiz Manager</h2>

        {/* Chọn chế độ */}
        <div style={styles.modeSelect}>
            <label>
            <input
                type="radio"
                checked={mode === "manual"}
                onChange={() => setMode("manual")}
            />{" "}
            Manual
            </label>
            <label>
            <input
                type="radio"
                checked={mode === "reading"}
                onChange={() => setMode("reading")}
            />{" "}
            AI Reading
            </label>
            <label>
            <input
                type="radio"
                checked={mode === "listening"}
                onChange={() => setMode("listening")}
            />{" "}
            AI Listening
            </label>
        </div>

        {/* Form Manual */}
        {mode === "manual" && (
            <div style={styles.section}>
            <h3>Add Questions Manually</h3>
            {manualQuestions.map((q, idx) => (
                <div key={idx} style={styles.questionBlock}>
                <input
                    type="text"
                    placeholder="Question"
                    value={q.question}
                    onChange={(e) =>
                    handleChangeQuestion(idx, "question", e.target.value)
                    }
                    style={styles.input}
                />
                {q.options.map((opt, i) => (
                    <input
                    key={i}
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) =>
                        handleChangeQuestion(idx, `option${i}`, e.target.value)
                    }
                    style={styles.input}
                    />
                ))}
                <input
                    type="text"
                    placeholder="Correct Answer"
                    value={q.correctAnswer}
                    onChange={(e) =>
                    handleChangeQuestion(idx, "correctAnswer", e.target.value)
                    }
                    style={styles.input}
                />
                </div>
            ))}
            <button onClick={handleAddQuestion} style={styles.button}>
                ➕ Add Question
            </button>
            <button onClick={handleSubmitManual} style={styles.button}>
                💾 Save Quiz
            </button>
            </div>
        )}

        {/* Form Reading AI */}
        {mode === "reading" && (
            <div style={styles.section}>
            <h3>Generate Quiz from Reading Text (AI)</h3>
            <textarea
                placeholder="Enter reading passage..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={styles.textarea}
            />
            <button onClick={handleGenerateReading} style={styles.button}>
                🤖 Generate Quiz
            </button>
            </div>
        )}

        {/* Form Listening AI */}
        {mode === "listening" && (
            <div style={styles.section}>
            <h3>Generate Quiz from Audio (AI)</h3>
            <input
                type="file"
                accept="audio/*,video/*"
                onChange={(e) => setAudioFile(e.target.files[0])}
                style={styles.input}
            />
            <button onClick={handleGenerateListening} style={styles.button}>
                🎧 Generate from Audio
            </button>
            </div>
        )}

        {/* Loading Spinner */}
        {loading && (
            <div style={styles.loadingOverlay}>
            <div style={styles.spinner}></div>
            <p>Generating...</p>
            </div>
        )}
        </div>
    );
};

export default QuizManager;

const styles = {
    container: {
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "20px",
        background: "#fafafa",
        position: "relative",
    },
    heading: {
        textAlign: "center",
    },
    modeSelect: {
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        marginBottom: "15px",
    },
    section: {
        marginTop: "10px",
    },
    questionBlock: {
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "6px",
        padding: "10px",
        marginBottom: "10px",
    },
    input: {
        display: "block",
        width: "100%",
        margin: "5px 0",
        padding: "8px",
    },
    textarea: {
        width: "100%",
        height: "120px",
        padding: "10px",
        marginBottom: "10px",
    },
    button: {
        margin: "5px",
        padding: "8px 16px",
        border: "none",
        borderRadius: "4px",
        backgroundColor: "#007bff",
        color: "#fff",
        cursor: "pointer",
    },
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(255,255,255,0.7)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    spinner: {
        width: "40px",
        height: "40px",
        border: "4px solid #ccc",
        borderTopColor: "#007bff",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    },
};
