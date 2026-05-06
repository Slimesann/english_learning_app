import axios from "axios";

const API_URL = "http://localhost:5000/api/lessons"; 

// Lấy chi tiết lesson (bao gồm quizzes)
export const getLessonDetail = async (lessonId, token = "") => {
    try {
        const res = await axios.get(`${API_URL}/${lessonId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return res.data;
    } catch (err) {
        console.error("Lỗi khi lấy lesson detail:", err);
        throw err;
    }
};

// Lấy danh sách quiz của 1 lesson (phục vụ getQuizByLesson nếu muốn tách riêng)
export const getLessonQuizzes = async (lessonId, token = "") => {
    try {
        const res = await axios.get(`${API_URL}/${lessonId}/quizzes`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return res.data;
    } catch (err) {
        console.error("Lỗi khi lấy quizzes của lesson:", err);
        throw err;
    }
};
