import React from "react";
import { Link } from "react-router-dom";

const VerifyFail = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
            ❌ Xác thực thất bại!
            </h1>
            <p className="text-gray-700 mb-6">
            Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng ký lại hoặc yêu cầu
            xác thực mới.
            </p>
            <Link
            to="/register"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
            Quay lại Đăng ký
            </Link>
        </div>
        </div>
    );
};

export default VerifyFail;
