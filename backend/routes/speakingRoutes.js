// routes/speakingRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { trackScript, evaluateSpeaking } from "../controllers/speakingController.js";

const router = express.Router();

// DÙNG process.cwd() → KHÔNG DÙNG import.meta.url
const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});

const upload = multer({ storage });

router.post("/track", (req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("multipart/form-data")) {
        upload.single("audio")(req, res, next);
    } else {
        next();
    }
}, trackScript);

router.post("/evaluate", upload.single("audio"), evaluateSpeaking);

export default router;