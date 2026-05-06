import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Sinh văn bản từ prompt
export async function generateText(prompt) {
    const result = await model.generateContent(prompt);
    return result.response.text();
}

// Sinh output từ file audio
export async function generateFromAudio(filePath, task = "transcribe") {
    const audioBuffer = fs.readFileSync(filePath);
    const audioBase64 = audioBuffer.toString("base64");

    const result = await model.generateContent([
        { inlineData: { mimeType: "audio/mp3", data: audioBase64 } },
        { text: task },
    ]);

    return result.response.text();
}
