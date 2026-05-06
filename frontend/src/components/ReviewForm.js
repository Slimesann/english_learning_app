import { useState } from "react";
import ReactStars from "react-rating-stars-component";
import axios from "axios";

export default function ReviewForm({ courseId, onSuccess }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (!comment.trim()) return alert("Vui lòng viết nhận xét");
        setLoading(true);
        try {
        await axios.post(`/api/courses/${courseId}/reviews`, { rating, comment }, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setComment("");
        setRating(5);
        onSuccess();
        } catch (err) {
        alert(err.response?.data?.message || "Lỗi gửi đánh giá");
        }
        setLoading(false);
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg border">
        <h3 className="text-xl font-bold mb-4">Viết đánh giá</h3>
        <ReactStars count={5} size={40} value={rating} onChange={setRating} activeColor="#f59e0b" />
        <textarea
            className="w-full mt-4 p-3 border rounded-lg"
            rows="4"
            placeholder="Chia sẻ trải nghiệm của bạn..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
        />
        <button
            onClick={submit}
            disabled={loading}
            classdisabled={loading}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
            {loading ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
        </div>
    );
}