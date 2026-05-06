import api from "./api";

export const getReviewsByCourse = async (courseId, page = 1, sort = "newest") => {
    const res = await api.get(`/courses/${courseId}/reviews`, {
        params: { page, sort },
    });
    return res.data;
};

export const createReview = async (courseId, reviewData) => {
    const res = await api.post(`/courses/${courseId}/reviews`, reviewData);
    return res.data;
};

export const toggleHelpful = async (reviewId) => {
    const res = await api.post(`/reviews/${reviewId}/helpful`);
    return res.data;
};