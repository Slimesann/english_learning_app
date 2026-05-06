import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
    console.warn("⚠️ Missing GEMINI_API_KEY in environment variables!");
}

// Khởi tạo model Gemini
const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

//  Generate text từ prompt (cho chat, phân tích, feedback, ...)
export async function generateText(prompt) {
    if (!model) throw new Error("AI model not configured (GEMINI_API_KEY).");

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.error("❌ Lỗi generateText:", err);
        throw new Error("Gemini text generation failed.");
    }
}

// Phân tích hoặc chuyển âm thanh sang text (tự động nhận file path, Buffer hoặc URL)
export async function generateFromAudio(audioInput, task = "Transcribe this audio to English text.") {
    if (!model) throw new Error("AI model not configured (GEMINI_API_KEY).");

    try {
        if (typeof audioInput === "string" && audioInput.startsWith("http")) {
            const prompt = `${task}\nAudio source: ${audioInput}`;
            const result = await model.generateContent(prompt);
            return result.response.text();
        }

        let buffer;
        if (Buffer.isBuffer(audioInput)) {
            buffer = audioInput;
        } else if (typeof audioInput === "string" && fs.existsSync(audioInput)) {
            buffer = fs.readFileSync(audioInput);
        } else {
            throw new Error("Invalid audio input. Expected URL, file path, or Buffer.");
        }

        const inlineData = {
            mimeType: "audio/mp3", 
            data: buffer.toString("base64"),
        };

        const result = await model.generateContent([
            { inlineData },
            { text: task },
        ]);

        return result.response.text();
    } catch (err) {
        console.error("❌ Lỗi generateFromAudio:", err);
        throw new Error("Gemini audio transcription failed.");
    }
}

// Chat mặc định với Gemini (có thể mở rộng cho speaking/chatbot)

export async function chatWithGemini(messages = []) {
    if (!model) throw new Error("AI model not configured (GEMINI_API_KEY).");

    try {
        const chat = model.startChat({
            history: messages.map(m => ({
                role: m.role || "user",
                parts: [{ text: m.content }],
            })),
        });

        const result = await chat.sendMessage(messages[messages.length - 1].content);
        return result.response.text();
    } catch (err) {
        console.error("❌ Lỗi chatWithGemini:", err);
        throw new Error("Gemini chat failed.");
    }
}
