import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
    {
        lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
        required: true,
        },
        title: { type: String, required: true },
        questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exercise" }],
        duration: { type: Number, default: 0 }, 
        attemptsAllowed: { type: Number, default: 1 }, 
        passScore: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);

export default Quiz;
