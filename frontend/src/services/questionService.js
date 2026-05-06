import api from "./api";

export const createQuestion = (data) => api.post("/questions", data);
export const getQuestions = (page = 1, search = "", sortBy = "newest") => {
    return api.get("/questions", { params: { page, search, sortBy } });
};

export const likeQuestion = (id) => api.post(`/questions/${id}/like`);
export const replyQuestion = (id, content) => api.post(`/questions/${id}/replies`, { content });
export const likeReply = (questionId, replyId) => api.post(`/questions/${questionId}/replies/${replyId}/like`);
