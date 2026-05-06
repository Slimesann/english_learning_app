// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";
import { logoutService } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Avatar mặc định (đã tồn tại vĩnh viễn trên Cloudinary của bạn)
    const DEFAULT_AVATAR = "https://res.cloudinary.com/daqtutvru/image/upload/v1764064861/avatars/btr6syse9ecis5sqfa4q.png";

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
                api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
            } catch (error) {
                console.error("Lỗi khi parse user từ localStorage:", error);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
            }
        }
        setLoading(false);
    }, []);

    const login = (newToken, newUser) => {
        if (!newToken || !newUser) return;

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    };

    const logout = async () => {
        try {
            await logoutService();
        } catch (err) {
            console.warn("Không thể gọi logoutService:", err.message);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
            delete api.defaults.headers.common["Authorization"];
        }
    };

    const refreshAuth = (newToken, newUser) => {
        if (newToken) {
            localStorage.setItem("token", newToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            setToken(newToken);
        }
        if (newUser) {
            localStorage.setItem("user", JSON.stringify(newUser));
            setUser({ ...newUser, _refresh: Date.now() }); // Ép re-render
        }
    };

    const updateUser = (updatedUser) => {
        const finalUser = {
            ...updatedUser,
            avatar: updatedUser.avatar || DEFAULT_AVATAR,
            _refresh: Date.now() // Ép React nhận thay đổi
        };
        setUser(finalUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    // HÀM QUAN TRỌNG NHẤT – ĐÃ SỬA HOÀN HẢO
    const refreshUser = async () => {
        if (!token) return null;

        try {
            const res = await api.get("/auth/me");
            const updatedUser = res.data.user || res.data;

            // Đảm bảo luôn có avatar (fallback nếu backend quên)
            if (!updatedUser.avatar) {
                updatedUser.avatar = DEFAULT_AVATAR;
            }

            // Lưu vào localStorage
            localStorage.setItem("user", JSON.stringify(updatedUser));

            // ÉP REACT RE-RENDER 100% bằng key ẩn
            const newUserState = { ...updatedUser, _refresh: Date.now() };
            setUser(newUserState);

            return newUserState;
        } catch (err) {
            console.error("Lỗi refreshUser:", err);
            if (err.response?.status === 401) {
                logout();
            }
            return null;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                login,
                logout,
                refreshAuth,
                updateUser,
                refreshUser,
                loading,
            }}
        >
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};