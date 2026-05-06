import ReactStars from "react-rating-stars-component";
import axios from "axios";

export default function ReviewList({ reviews, onHelpful }) {
    const voteHelpful = async (id) => {
        try {
        const res = await axios.post(`/api/reviews/${id}/helpful`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        onHelpful(id, res.data.helpfulCount);
        } catch (err) {
        alert("Bạn cần đăng nhập để vote");
        }
    };

    return (
        <div className="space-y-6">
        {reviews.map((r) => (
            <div key={r._id} className="bg-white p-6 border rounded-lg">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {r.user.name[0]}
                </div>
                <div>
                <p className="font-semibold">{r.user.name}</p>
                <p className="text-sm text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                </p>
                </div>
                <ReactStars count={5} value={r.rating} size={24} edit={false} activeColor="#f59e0b" />
            </div>
            <p className="mt-3 text-gray-700">{r.comment}</p>
            <button
                onClick={() => voteHelpful(r._id)}
                className="mt-4 text-blue-600 text-sm hover:underline"
            >
                Helpful ({r.helpfulCount})
            </button>
            </div>
        ))}
        </div>
    );
}