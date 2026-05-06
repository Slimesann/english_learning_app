import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },

        role: {
            type: String,
            enum: ["user", "instructor", "admin"],
            default: "user",
        },

        verifyToken: { type: String, default: null },
        isVerified: { type: Boolean, default: false },
        isApproved: { type: Boolean, default: false },
        resetPasswordToken: { type: String, default: null },
        resetPasswordExpire: { type: Date, default: null },

        enrolledCourses: [
            {
                courseId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Course",
                    required: true
                },
                progress: {
                    type: Number,
                    default: 0,
                    min: 0
                },
                enrolledAt: {
                    type: Date,
                    default: Date.now
                },
                courseInfo: {
                    title: { type: String, default: "" },
                    description: { type: String, default: "" },
                    totalLessons: { type: Number, default: 0 }
                }
            }
        ]
    },
    {
        timestamps: true,
        collection: "users"
    }
);

// Hash password
userSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password") && this.password) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        next();
    } catch (err) {
        next(err);
    }
});

// So sánh password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.index({ resetPasswordExpire: 1 }, { expireAfterSeconds: 0 });

userSchema.index({ "enrolledCourses.courseId": 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;