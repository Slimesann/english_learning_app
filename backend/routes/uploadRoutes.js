import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Tạo folder nếu chưa có
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "uploads/media";
        if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 123123123.mp3
    },
});

const upload = multer({ storage });

// Route để upload audio / image
router.post("/audio", upload.single("audio"), (req, res) => {
    console.log("📁 File uploaded:", req.file);
    res.json({
        message: "Upload thành công",
        url: `/uploads/media/${req.file.filename}`,
    });
});

export default router;
