
import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now }
});

const QuestionSchema = new mongoose.Schema({
    content: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    replies: [ReplySchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now }
});

QuestionSchema.index({ content: "text" });

export default mongoose.models.Question || mongoose.model("Question", QuestionSchema);