import api from "./api";

// Cập nhật tiến độ của 1 bài học sau khi user làm xong 
export async function updateLessonProgress(lessonId, payload) {
    try {
        if (!payload.score) {
            throw new Error("Payload phải có trường 'score' (tỷ lệ %)");
        }
        const res = await api.post(`/progress/lesson/${lessonId}`, payload);
        return res.data;
    } catch (err) {
        console.error("Lỗi cập nhật tiến độ:", err.response?.data || err.message);
        throw err.response?.data || { msg: "Lỗi server" };
    }
}

// Lấy tiến độ chi tiết của 1 bài học
export async function getLessonProgress(lessonId) {
    try {
        const res = await api.get(`/progress/lesson/${lessonId}`);
        return res.data;
    } catch (err) {
        console.error("Lỗi lấy tiến độ:", err.response?.data || err.message);
        if (err.response?.status === 404) {
            return { completed: false, score: 0, msg: "Chưa có tiến độ" };
        }
        throw err.response?.data || { msg: "Lỗi server" };
    }
}

// Lấy tiến độ toàn course 
export async function getCourseProgress(courseId) {
    try {
        const res = await api.get(`/progress/course/${courseId}`);
        return res.data;
    } catch (err) {
        console.error("Lỗi lấy tiến độ course:", err.response?.data || err.message);
        throw err.response?.data || { msg: "Lỗi server" };
    }
}