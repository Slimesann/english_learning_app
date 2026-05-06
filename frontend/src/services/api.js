// src/services/api.js
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    timeout: 180000,
});

// === REQUEST INTERCEPTOR ===
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        } else {
            config.headers["Content-Type"] = "application/json";
        }

        return config;
    },
    (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
    }
);

// === RESPONSE INTERCEPTOR ===
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // BỎ LOG LỖI 400 "ĐÃ THÊM RỒI"
        const isAlreadyEnrolled = 
            error.response?.status === 400 && 
            (error.response?.data?.msg?.includes("đã thêm") || 
            error.response?.data?.msg?.includes("already"));

        if (!isAlreadyEnrolled) {
            console.error("API Error:", {
                url: error.config?.url,
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
            });
        }

        // Xử lý 401
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;