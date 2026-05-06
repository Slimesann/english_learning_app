// models/Progress.js - Giữ nguyên schema, chỉ thêm index nếu cần
import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
        completed: { type: Boolean, default: false },
        score: { type: Number, default: 0 },
    },
    { timestamps: true }
);

progressSchema.index({ userId: 1, lessonId: 1 });

const Progress =
    mongoose.models.Progress || mongoose.model("Progress", progressSchema);

export default Progress;