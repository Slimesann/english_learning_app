// src/components/ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <p>Đang tải thông tin người dùng...</p>;

    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/403" replace />;
    }

    return children;
}

export default ProtectedRoute;
