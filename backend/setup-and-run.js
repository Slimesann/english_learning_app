// setup-and-run.js
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

console.log("\nKIỂM TRA & CÀI ĐẶT HỆ THỐNG...\n");

let hasChanges = false;

// === 1. TẠO THƯ MỤC ===
const dirs = ["tmp", "uploads", "models"];
dirs.forEach(dir => {
    const p = path.join(__dirname, dir);
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
        console.log(`Tạo thư mục: ${dir}`);
        hasChanges = true;
    }
});

// === 2. KIỂM TRA PYTHON PACKAGES ===
let needPip = false;
try {
    execSync("py -3.11 -c \"import whisper, yt_dlp\" 2>nul", { stdio: "ignore" });
    console.log("openai-whisper + yt-dlp: ĐÃ CÀI");
} catch {
    needPip = true;
    console.log("openai-whisper + yt-dlp: CHƯA CÀI");
}

// === 3. KIỂM TRA FFMPEG ===
let needFfmpeg = false;
try {
    execSync("ffmpeg -version >nul 2>&1", { stdio: "ignore" });
    console.log("ffmpeg: ĐÃ CÀI");
} catch {
    needFfmpeg = true;
    console.log("ffmpeg: CHƯA CÀI");
}

// === 4. CÀI NẾU THIẾU ===
if (needPip) {
    console.log("\nCài openai-whisper + yt-dlp...");
    execSync('py -3.11 -m pip install -U openai-whisper yt-dlp', { stdio: "inherit" });
    hasChanges = true;
}

if (needFfmpeg) {
    console.log("\nCài ffmpeg bằng Chocolatey...");
    try {
        execSync('powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString(\'https://community.chocolatey.org/install.ps1\'))"', { stdio: "inherit" });
        execSync("choco install ffmpeg -y", { stdio: "inherit" });
        hasChanges = true;
    } catch (err) {
        console.error("Lỗi cài Chocolatey/ffmpeg:", err.message);
    }
}

// === KẾT LUẬN ===
if (!hasChanges) {
    console.log("\nTẤT CẢ ĐÃ SẴN SÀNG!");
    console.log("Dùng lệnh: npm run dev");
} else {
    console.log("\nCÀI ĐẶT HOÀN TẤT!");
    console.log("Giờ dùng: npm run dev");
}