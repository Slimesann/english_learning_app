import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
    {
        lessonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson",
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: ["listening", "reading", "writing", "speaking", "mcq"],
            required: true,
        },
        question: { type: String, required: true },

        options: {
            type: [String],
            default: [],
        },

        correctAnswer: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: "exercises",
    }
);


exerciseSchema.pre("validate", function (next) {
    if (["mcq", "listening", "reading"].includes(this.type)) {
        if (!this.options || this.options.length === 0) {
            return next(new Error(`${this.type} exercise phải có options`));
        }
    }

    if (["writing", "speaking"].includes(this.type)) {
        if (this.options && this.options.length > 0) {
            this.options = [];
        }
    }
    next();
});

exerciseSchema.pre("save", function (next) {
    if (["writing", "speaking"].includes(this.type)) {
        this.options = [];
    }
    next();
});

const Exercise =
    mongoose.models.Exercise || mongoose.model("Exercise", exerciseSchema);

export default Exercise;