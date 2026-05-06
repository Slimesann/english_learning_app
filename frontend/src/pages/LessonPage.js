import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLessonDetail } from "../services/lessonService";
import { getQuizByLesson } from "../services/quizService";
import { getLessonProgress } from "../services/progress";
import { createQuestion } from "../services/questionService";
import Quiz from "../components/Quiz";
import ReadingLesson from "../pages/components/ReadingLesson";
import ListeningLesson from "../pages/components/ListeningLesson";
import WritingLesson from "../pages/components/WritingLesson";
import SpeakingLesson from "../pages/components/SpeakingLesson";
import { AuthContext } from "../context/AuthContext";

function LessonPage() {
    const { lessonId, courseId } = useParams();
    const navigate = useNavigate();
    const { user, updateUser, refreshUser } = useContext(AuthContext);

    const [lesson, setLesson] = useState(null);
    const [quizList, setQuizList] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [error, setError] = useState(null);
    const [course, setCourse] = useState(null);
    const [lessonProgress, setLessonProgress] = useState({ completed: false, score: 0 });

    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getLessonDetail(lessonId);
                setLesson(data);

                const quizData = await getQuizByLesson(lessonId);
                setQuizList(quizData || []);

                if (data.courseId) {
                    const { getCourseById } = await import("../services/courseService");
                    const courseRes = await getCourseById(data.courseId);
                    setCourse(courseRes);
                }

                if (user) {
                    try {
                        const res = await getLessonProgress(lessonId);
                        setLessonProgress(res || { completed: false, score: 0 });
                    } catch (progressErr) {
                        console.warn("Chưa có tiến độ lesson:", progressErr);
                        setLessonProgress({ completed: false, score: 0 });
                    }
                }
            } catch (err) {
                console.error("Lỗi khi tải lesson:", err);
                setError("Không thể tải dữ liệu bài học");
            }
        };
        fetchData();
    }, [lessonId, user]);

    const currentIndex = course?.lessons?.findIndex(l => l._id === lessonId) ?? -1;
    const prevLesson = currentIndex > 0 ? course?.lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < (course?.lessons?.length - 1) ? course?.lessons[currentIndex + 1] : null;

    const markLessonComplete = () => {
        const enrolled = user?.enrolledCourses?.find(e => e.courseId === courseId);
        if (!enrolled) return;

        const currentProgress = enrolled.progress || 0;
        const lessonIndex = currentIndex;

        if (lessonIndex >= currentProgress) {
            const newProgress = lessonIndex + 1;

            const updatedUser = {
                ...user,
                enrolledCourses: user.enrolledCourses.map(e =>
                    e.courseId === courseId
                        ? { ...e, progress: newProgress }
                        : e
                )
            };

            updateUser(updatedUser);
        }
    };

    useEffect(() => {
        if (lesson && course) {
            markLessonComplete();
        }
    }, [lesson, course]);

    const handleQuizFinish = async (quizResult) => {
        try {
            if (quizResult.score >= 80) {
                const res = await getLessonProgress(lessonId);
                setLessonProgress(res || { completed: false, score: 0 });
            }
            if (user) {
                await refreshUser();
            }
        } catch (err) {
            console.error("Lỗi refetch sau quiz:", err);
        }
        setSelectedQuiz(null);
    };

    const handlePrev = () => {
        if (prevLesson) {
            navigate(`/courses/${courseId}/lessons/${prevLesson._id}`);
        }
    };

    const handleNext = () => {
        if (nextLesson) {
            navigate(`/courses/${courseId}/lessons/${nextLesson._id}`);
        }
    };

    const handleSubmitQuestion = async () => {
        if (!newQuestion.trim()) return;

        try {
            await createQuestion({
                content: newQuestion.trim(),
                lessonId: lesson._id,
                courseId: course._id
            });

            setNewQuestion("");
            setShowQuestionModal(false);
            alert("Câu hỏi đã được đăng thành công!");
        } catch (err) {
            console.error("Lỗi khi đăng câu hỏi:", err);
            alert("Không thể đăng câu hỏi. Vui lòng thử lại!");
        }
    };

    if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
    if (!lesson || !course) return <p style={{ textAlign: "center" }}>Đang tải bài học...</p>;

    const renderLesson = () => {
        switch (lesson.skillType) {
            case "reading": return <ReadingLesson lesson={lesson} />;
            case "listening": return <ListeningLesson lesson={lesson} />;
            case "writing": return <WritingLesson lesson={lesson} />;
            case "speaking": return <SpeakingLesson lesson={lesson} />;
            default: return <p>Loại kỹ năng không hợp lệ.</p>;
        }
    };

    const NavigationButtons = () => (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "24px 0",
            flexWrap: "wrap",
            gap: "12px"
        }}>
            <button onClick={handlePrev} disabled={!prevLesson}
                style={{
                    padding: "10px 20px",
                    background: prevLesson ? "#3b82f6" : "#e2e8f0",
                    color: prevLesson ? "#fff" : "#94a3b8",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: prevLesson ? "pointer" : "not-allowed",
                    fontSize: "14px",
                }}>
                Bài trước
            </button>

            <div style={{ fontSize: "14px", color: "#475569", fontWeight: 500 }}>
                Bài {currentIndex + 1} / {course.lessons.length}
                {lessonProgress?.completed && <span style={{ color: "#10b981", marginLeft: 8 }}>Đã hoàn thành</span>}
            </div>

            {user && (
                <button
                    onClick={() => setShowQuestionModal(true)}
                    style={{
                        padding: "12px 24px",
                        background: "#8b5cf6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontSize: "15px",
                        boxShadow: "0 4px 12px rgba(139,92,246,0.3)"
                    }}>
                    Đặt câu hỏi về bài học này
                </button>
            )}

            <button onClick={handleNext} disabled={!nextLesson}
                style={{
                    padding: "10px 20px",
                    background: nextLesson ? "#10b981" : "#e2e8f0",
                    color: nextLesson ? "#fff" : "#94a3b8",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: nextLesson ? "pointer" : "not-allowed",
                    fontSize: "14px",
                }}>
                Bài tiếp
            </button>
        </div>
    );

    return (
        <div style={{
            padding: "20px",
            maxWidth: "1400px",
            margin: "0 auto",
            fontFamily: "system-ui, sans-serif"
        }}>
            <h2 style={{ marginBottom: "16px", color: "#1e293b" }}>
                {lesson.title}
                {lessonProgress?.completed && <span style={{ color: "#10b981", fontSize: "0.8em", marginLeft: 8 }}>Đã hoàn thành</span>}
            </h2>

            <NavigationButtons />

            {renderLesson()}

            {quizList?.length > 0 && (
                <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #e2e8f0" }}>
                    <h3 style={{ marginBottom: "12px" }}>Quiz</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {quizList.map((quiz) => (
                            <button
                                key={quiz._id}
                                onClick={() => setSelectedQuiz(quiz)}
                                style={{
                                    padding: "8px 16px",
                                    background: selectedQuiz?._id === quiz._id ? "#1e293b" : "#f1f5f9",
                                    color: selectedQuiz?._id === quiz._id ? "#fff" : "#1e293b",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: 500
                                }}
                            >
                                {quiz.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {selectedQuiz && (
                <div style={{ marginTop: "20px" }}>
                    <Quiz
                        questions={selectedQuiz.questions}
                        lessonId={lessonId}
                        courseId={courseId}
                        quizId={selectedQuiz._id}
                        onFinish={handleQuizFinish}
                    />
                </div>
            )}

            <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "2px dashed #e2e8f0" }}>
                <NavigationButtons />
            </div>

            {showQuestionModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                    onClick={() => setShowQuestionModal(false)}
                >
                    <div
                        style={{
                            background: "white",
                            padding: "32px",
                            borderRadius: "12px",
                            width: "90%",
                            maxWidth: "560px",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: "0 0 16px 0", fontSize: "20px" }}>
                            Đặt câu hỏi về bài học
                        </h3>
                        <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "14px" }}>
                            {lesson.title}
                        </p>

                        <textarea
                            rows={5}
                            placeholder="Ví dụ: Thầy ơi, em chưa hiểu cách dùng thì hiện tại hoàn thành với since/for lắm ạ..."
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                fontSize: "16px",
                                resize: "vertical",
                                fontFamily: "inherit"
                            }}
                        />

                        <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                            <button
                                onClick={() => setShowQuestionModal(false)}
                                style={{
                                    padding: "10px 20px",
                                    background: "#e2e8f0",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmitQuestion}
                                disabled={!newQuestion.trim()}
                                style={{
                                    padding: "10px 24px",
                                    background: newQuestion.trim() ? "#8b5cf6" : "#94a3b8",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: newQuestion.trim() ? "pointer" : "not-allowed",
                                    fontWeight: 600,
                                }}
                            >
                                Đăng câu hỏi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LessonPage;