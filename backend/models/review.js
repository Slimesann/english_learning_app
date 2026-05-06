import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true, maxlength: 1000 },
        helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
        images: [{ type: String }],
        isDeleted: { type: Boolean, default: false }, 
    },
    { timestamps: true }
);

reviewSchema.index({ course: 1, createdAt: -1 });
reviewSchema.index({ course: 1, rating: -1 });
reviewSchema.index({ course: 1, "helpful.10": 1 }); 

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);