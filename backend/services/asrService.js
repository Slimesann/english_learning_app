
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

const PYTHON_CMD = "C:\\Users\\Admin\\AppData\\Local\\Programs\\Python\\Python311\\python.exe";

const SCRIPT = path.resolve(process.cwd(), "services", "whisper_transcribe.py");

const SYSTEM_TEMP_DIR = "C:\\temp\\Windows\\Temp\\whisper_tmp";

if (!fs.existsSync(SYSTEM_TEMP_DIR)) {
    fs.mkdirSync(SYSTEM_TEMP_DIR, { recursive: true });
}

export async function transcribeAudio(audioPath) {
    return new Promise((resolve) => {
        if (!fs.existsSync(audioPath)) {
            return resolve({ error: "File audio không tồn tại" });
        }

        const jsonPath = path.join(
            SYSTEM_TEMP_DIR,
            `whisper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.json`
        );

        const args = [SCRIPT, audioPath, jsonPath];

        console.log("=== WHISPER START (ẩn CMD + không reset) ===");
        console.log("Cmd:", PYTHON_CMD, args.join(" "));

        const python = spawn(PYTHON_CMD, args, {
            detached: true,
            stdio: ["ignore", "pipe", "pipe"],
            windowsHide: true, 
            shell: false
        });

        python.unref();
        python.stdout.unref();
        python.stderr.unref();

        let stdoutOutput = "";
        let stderrOutput = "";

        python.stdout.on("data", (data) => {
            const msg = data.toString();
            stdoutOutput += msg;
            if (msg.trim()) console.log("[WHISPER OUT]:", msg.trim());
        });

        python.stderr.on("data", (data) => {
            const msg = data.toString();
            stderrOutput += msg;
            if (msg.trim()) console.warn("[WHISPER ERR]:", msg.trim());
        });

        python.on("error", (err) => {
            console.error("Không thể chạy Python:", err.message);
            resolve({ error: "Không thể chạy Python", details: err.message });
        });

        python.on("close", (code) => {
            console.log(`Whisper kết thúc – mã thoát: ${code}`);

            if (code !== 0) {
                return resolve({
                    error: `Whisper lỗi (code ${code})`,
                    details: stderrOutput || "Không rõ lỗi"
                });
            }

            try {
                let result;

                if (stdoutOutput.trim()) {
                    result = JSON.parse(stdoutOutput.trim());
                } else if (fs.existsSync(jsonPath)) {
                    result = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
                    fs.unlink(jsonPath, () => {});
                } else {
                    throw new Error("Không có dữ liệu từ Whisper");
                }

                if (result.error) {
                    return resolve({ error: result.error });
                }

                resolve({
                    text: result.text?.trim() || "",
                    segments: (result.segments || []).map(s => ({
                        start: parseFloat(s.start) || 0,
                        end: parseFloat(s.end) || 0,
                        text: (s.text || "").trim()
                    }))
                });

            } catch (err) {
                console.error("Lỗi parse kết quả:", err.message);
                resolve({ error: "Lỗi xử lý kết quả", details: err.message });
            }
        });
    });
}