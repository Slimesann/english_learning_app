import { generateText } from "./geminiService.js"; 

export const evaluateWritingAI = async (topic, text) => {
    const prompt = `
        You are an IELTS examiner.
        Topic: ${topic}
        Student: """${text}"""

        Return JSON with:
        {
            "score": number,
            "feedback": "string"
        }
    `;

    const raw = await generateText(prompt);
    const json = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
    return json;
};
