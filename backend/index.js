import dotenv from "dotenv";
dotenv.config();

import path from "path";
import fs from "fs";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import instructorRoutes from "./routes/instructor.js";
import courseRoutes from "./routes/courseRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import exerciseRoutes from "./routes/exerciseRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import learnRoutes from "./routes/learn.js";
import protectedRoutes from "./routes/protected.js";
import adminRoutes from "./routes/adminRoutes.js";
import readingRoutes from "./routes/readingRoutes.js";
import listeningRoutes from "./routes/listeningRoutes.js";
import writingRoutes from "./routes/writingRoutes.js";
import speakingRoutes from "./routes/speakingRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import { syncAllIndexes } from "./utils/syncIndexes.js";
import geminiRouter from "./routes/gemini.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import questionRoutes from "./routes/question.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure Upload Directory
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// MongoDB Connection
mongoose.set("strictQuery", true);
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("MongoDB Atlas connected!");
        await syncAllIndexes();
        app.listen(PORT, () =>
            console.log(`Server running on http://localhost:${PORT}`)
        );
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        process.exit(1);
    });

// Routes
app.get("/", (req, res) => res.send("API Server is running..."));

app.use("/api/speaking", (req, res, next) => {
    console.log(`[SPEAKING ROUTE] ${req.method} ${req.originalUrl}`);
    next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/learn", learnRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reading", readingRoutes);
app.use("/api/listening", listeningRoutes);
app.use("/api/writing", writingRoutes);
app.use("/api/speaking", speakingRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static(uploadDir));
app.use("/api/gemini", geminiRouter);
app.use("/api", reviewRoutes);
app.use("/api/questions", questionRoutes);

// Static Files
app.use(express.static(path.join(process.cwd(), "public")));

// 404 & Error Handling
app.use((req, res) => res.status(404).json({ msg: "Route không tồn tại" }));

app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
});