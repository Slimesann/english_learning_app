import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
    courseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Course", 
        required: true 
    },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    mediaUrl: { type: String, default: "" },
    audioFile: { type: String, default: "" },
    order: { type: Number, default: 0 },

    skillType: { 
        type: String,
        enum: ["listening", "reading", "writing", "speaking"],
        required: true
    },

    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exercise" }],
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],

    isTest: { type: Boolean, default: false },
    testType: { type: String, enum: ["mini", "final"], required: false }
}, { timestamps: true });

const Lesson = mongoose.models.Lesson || mongoose.model("Lesson", LessonSchema);
export default Lesson;
