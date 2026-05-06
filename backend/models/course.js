import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner",
        },
        description: { type: String, default: "" },
        lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        isPublished: { type: Boolean, default: false },
        isApproved: { type: Boolean, default: false},
        averageRating: { type: Number, default: 0 },
        ratingCount: { type: Number, default: 0 },
    },
    { 
        timestamps: true,
        collection: "courses"
    }
);

const Course =
    mongoose.models.Course || mongoose.model("Course", courseSchema);

export default Course;
