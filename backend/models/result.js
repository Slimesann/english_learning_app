import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },

    type: {
        type: String,
        enum: ["quiz", "writing"],
        required: true
    },

    score: { type: Number, default: null },             
    correctAnswers: { type: Number, default: null },    
    totalQuestions: { type: Number, default: null },    
    scorePercent: { type: Number, default: null },      


    writingText: { type: String, default: "" },        
    feedback: { type: String, default: "" },         

    status: {
        type: String,
        enum: ["pending", "completed", "reviewed"],
        default: "completed"
    },

    timeSpent: { type: Number, default: null },        
    attemptNumber: { type: Number, default: 1 },       

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

ResultSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const Result = mongoose.models.Result || mongoose.model("Result", ResultSchema);
export default Result;
