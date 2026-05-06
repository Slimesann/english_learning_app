import React, { useState } from "react";
import axios from "../services/api.js";

const QuizManager = ({ lessonId }) => {
    const [mode, setMode] = useState("manual");
    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState([]);
    const [excelFile, setExcelFile] = useState(null);

    const generateAIQuiz = async () => {
        const res = await axios.post("/api/quizzes/generate-ai", {
        lessonId,
        numQuestions: 5,
        });
        setQuestions(res.data.items);
    };

    const uploadExcel = async () => {
        const fd = new FormData();
        fd.append("file", excelFile);
        const res = await axios.post("/api/quizzes/upload-excel", fd);
        setQuestions(res.data.items);
    };

    const saveQuiz = async () => {
        await axios.post("/api/quizzes/save", {
        lessonId,
        title,
        questions,
        });
        alert("✅ Quiz Saved Successfully!");
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    return (
        <div className="p-4">
        <h2 className="text-xl font-bold mb-3">📘 Quiz Manager</h2>
        <label>Quiz Title: </label>
        <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-1 w-full mb-3"
        />

        <div className="flex gap-3 mb-4">
            <button onClick={() => setMode("manual")}>📝 Manual</button>
            <button onClick={() => { setMode("ai"); generateAIQuiz(); }}>🤖 AI</button>
            <button onClick={() => setMode("excel")}>📁 Upload Excel</button>
        </div>

        {mode === "excel" && (
            <div>
            <input type="file" onChange={(e) => setExcelFile(e.target.files[0])} />
            <button onClick={uploadExcel} className="ml-2">Upload</button>
            </div>
        )}

        {questions.map((q, i) => (
            <div key={i} className="mb-3 p-2 border">
            <input
                className="border w-full mb-2"
                value={q.question}
                onChange={(e) => updateQuestion(i, "question", e.target.value)}
            />
            {q.options.map((opt, j) => (
                <input
                key={j}
                value={opt}
                className="border w-full mb-1"
                onChange={(e) => {
                    const newOptions = [...q.options];
                    newOptions[j] = e.target.value;
                    updateQuestion(i, "options", newOptions);
                }}
                />
            ))}
            <input
                className="border w-full"
                placeholder="Answer"
                value={q.answer}
                onChange={(e) => updateQuestion(i, "answer", e.target.value)}
            />
            </div>
        ))}

        <button onClick={saveQuiz} className="mt-3 p-2 bg-blue-500 text-white">
            💾 Save Quiz
        </button>
        </div>
    );
};

export default QuizManager;
