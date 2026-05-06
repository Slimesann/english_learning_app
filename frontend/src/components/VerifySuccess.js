import React from "react";
import { Link } from "react-router-dom";

const VerifySuccess = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-green-600 mb-4">
            ✅ Xác thực thành công!
            </h1>
            <p className="text-gray-700 mb-6">
            Email của bạn đã được xác thực. Giờ bạn có thể đăng nhập.
            </p>
            <Link
            to="/login"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
            Đi tới Đăng nhập
            </Link>
        </div>
        </div>
    );
};

export default VerifySuccess;
