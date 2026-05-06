import api from "./api";

// Gửi bài viết để chấm điểm
export const evaluateWriting = async ({ topic, text, lessonId, courseId }) => {
    const res = await api.post("/writing/evaluate", {
        topic,
        text,
        lessonId,
        courseId
    });
    return res.data;
};
