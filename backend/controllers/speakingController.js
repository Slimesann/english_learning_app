import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { transcribeAudio } from "../services/asrService.js";
import { compareAlignment } from "../services/comparisonService.js";

const execAsync = promisify(exec);

const TMP_DIR = path.resolve(process.cwd(), "tmp");
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const safeUnlink = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) console.warn("Cleanup failed:", filePath, err.message);
        });
    }
};

/** TRACK SCRIPT — DÙNG WHISPER + TIMESTAMP */
export const trackScript = async (req, res) => {
    let tempFiles = [];

    try {
        const { mediaUrl } = req.body;
        const audioFile = req.file;

        let audioPath = "";

        // === 1. LẤY AUDIO ===
        if (mediaUrl && (mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be"))) {
            const videoId = mediaUrl.includes("youtu.be")
                ? mediaUrl.split("youtu.be/")[1].split(/[?#&]/)[0]
                : new URL(mediaUrl).searchParams.get("v");

            if (!videoId) return res.status(400).json({ error: "Invalid YouTube URL" });

            const finalAudio = path.join(TMP_DIR, `${videoId}.mp3`);

            console.log("Tải audio từ YouTube:", videoId);
            await execAsync(
                `yt-dlp -f bestaudio --extract-audio --audio-format mp3 --audio-quality 0 -o "${finalAudio.replace(/\.mp3$/, '')}" "https://www.youtube.com/watch?v=${videoId}"`,
                { timeout: 300000 }
            );

            if (!fs.existsSync(finalAudio)) throw new Error("Audio not downloaded");
            audioPath = finalAudio;
            tempFiles.push(finalAudio);
        }
        else if (audioFile) {
            audioPath = path.resolve(audioFile.path);
            if (!fs.existsSync(audioPath)) {
                return res.status(400).json({ error: "File không tồn tại trên server" });
            }
            tempFiles.push(audioPath);
        }
        else {
            return res.status(400).json({ error: "Thiếu mediaUrl hoặc file audio!" });
        }

        // === 2. DÒ LỜI + TIMESTAMP ===
        console.log("Transcribing with Whisper...");
        const transcriptResult = await transcribeAudio(audioPath);

        if (transcriptResult.error) {
            return res.status(500).json({
                error: "Dò lời thất bại",
                details: transcriptResult.error
            });
        }

        if (!transcriptResult.segments || transcriptResult.segments.length === 0) {
            return res.status(400).json({ error: "Không phát hiện giọng nói" });
        }

        // === 3. GỘP SILENCE + TẠO SCRIPT ===
        let silenceSec = 0;
        try {
            const { stdout } = await execAsync(
                `ffmpeg -i "${audioPath}" -af silencedetect=noise=-40dB:d=0.5 -f null - 2>&1`
            );
            const match = stdout.match(/silence_end: (\d+\.?\d*)/);
            silenceSec = match ? parseFloat(match[1]) : 0;
        } catch (err) {
            console.warn("Silence detection failed:", err.message);
        }

        const script = transcriptResult.segments
            .map((seg, i) => {
                let start = seg.start;
                if (i === 0 && silenceSec > 0.5) start = 0.0;
                return `[${start.toFixed(1)}-${seg.end.toFixed(1)}] ${seg.text}`;
            })
            .join("\n");

        // GỬI PHẢN HỒI THÀNH CÔNG
        console.log("Gửi script về frontend...");
        res.json({
            message: "Dò lời thành công",
            script,
            silenceSec: silenceSec.toFixed(2),
            rawText: transcriptResult.text || "",
            lines: transcriptResult.segments.length
        });

    } catch (err) {
        console.error("trackScript error:", err.message);
        console.error("Stack:", err.stack);
        res.status(500).json({
            error: err.message || "Xử lý thất bại"
        });
    } finally {
        tempFiles.forEach(safeUnlink);
    }
};

/** EVALUATE SPEAKING */
export const evaluateSpeaking = async (req, res) => {
    let tempFiles = [];

    try {
        console.log("=== EVALUATE SPEAKING START ===");
        console.log("originalScript:", req.body.originalScript?.slice(0, 100));
        console.log("audioFile:", req.file?.filename);

        const { originalScript } = req.body;
        const audioFile = req.file;

        if (!audioFile) {
            console.log("Error: Thiếu file ghi âm");
            return res.status(400).json({ error: "Thiếu file ghi âm" });
        }
        if (!originalScript || typeof originalScript !== "string") {
            console.log("Error: Thiếu hoặc sai định dạng script gốc");
            return res.status(400).json({ error: "Thiếu hoặc sai định dạng script gốc" });
        }

        const audioPath = path.resolve(audioFile.path);
        if (!fs.existsSync(audioPath)) {
            console.log("Error: File audio không tồn tại");
            return res.status(400).json({ error: "File audio không tồn tại trên server" });
        }
        tempFiles.push(audioPath);

        console.log("Bắt đầu dò lời...");
        const transcriptResult = await transcribeAudio(audioPath);

        if (transcriptResult.error) {
            console.error("Whisper error:", transcriptResult.error);
            return res.status(500).json({
                error: "Dò lời thất bại",
                details: transcriptResult.error
            });
        }

        const userText = transcriptResult.text?.trim();
        if (!userText) {
            console.log("Không phát hiện giọng nói");
            return res.status(400).json({ error: "Không phát hiện giọng nói" });
        }

        console.log("Bạn nói:", userText);
        console.log("Script gốc:", originalScript);

        const comparison = compareAlignment(userText, originalScript);

        console.log("Gửi kết quả đánh giá về frontend...");
        res.json({
            message: "Đánh giá hoàn tất",
            transcript: userText,
            comparison
        });

    } catch (err) {
        console.error("=== EVALUATE SPEAKING CRASH ===");
        console.error("Error:", err.message);
        console.error("Stack:", err.stack);
        res.status(500).json({
            error: "Xử lý thất bại",
            details: err.message
        });
    } finally {
        tempFiles.forEach(safeUnlink);
    }
};