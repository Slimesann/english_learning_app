import API from "./api";

// Lấy danh sách quiz theo lessonId
export const getQuizByLesson = async (lessonId) => {
    const res = await API.get(`/quizzes/${lessonId}`);
    return res.data;
};

// Lấy chi tiết quiz theo quizId
export const getQuizById = async (quizId, token = "") => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await API.get(`/quizzes/detail/${quizId}`, { headers });
    return res.data;
};

// Nộp bài quiz
export const submitQuiz = async (quizId, answersPayload, token = "") => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await API.post(`/quizzes/${quizId}/submit`, answersPayload, { headers });
    return res.data;
};

export const getQuiz = getQuizById;