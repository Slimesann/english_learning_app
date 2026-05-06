import API from "./api";

export const getExercises = () => API.get("/exercises");
export const getExerciseById = (id) => API.get(`/exercises/${id}`);
export const createExercise = (data) => API.post("/exercises", data);
export const updateExercise = (id, data) => API.put(`/exercises/${id}`, data);
export const deleteExercise = (id) => API.delete(`/exercises/${id}`);
