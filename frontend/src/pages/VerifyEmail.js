import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function VerifyEmail() {
    const { token } = useParams();
    const [msg, setMsg] = useState("Đang xác thực...");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const verify = async () => {
        try {
            const res = await axios.get(
            `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/auth/verify/${token}`
            );
            setMsg(res.data.message || "Xác thực thành công!");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            console.error("❌ Verify error:", err.response?.data || err.message);
            setMsg(err.response?.data?.message || "Xác thực thất bại");
        } finally {
            setLoading(false);
        }
        };
        verify();
    }, [token, navigate]);

    return (
        <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
        <h2>Xác thực Email</h2>
        <p style={{ color: msg.includes("thành công") ? "green" : "red" }}>
            {loading ? "Đang xử lý..." : msg}
        </p>
        </div>
    );
}

export default VerifyEmail;
