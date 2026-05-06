import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import IntroducePage from "../pages/IntroducePage";
import Home from "../pages/Home";

const RootRedirect = () => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    // Đang kiểm tra token (tránh flash)
    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
            <div className="text-2xl font-semibold text-gray-700 animate-pulse">
            Đang tải...
            </div>
        </div>
        );
    }

    // ĐÃ ĐĂNG NHẬP → Trang Home (dashboard cá nhân)
    if (isAuthenticated) {
        return <Home />;
    }

    // CHƯA ĐĂNG NHẬP → Trang giới thiệu đẹp lung linh
    return <IntroducePage />;
};

export default RootRedirect;