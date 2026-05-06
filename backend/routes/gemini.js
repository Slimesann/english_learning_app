import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from "node-fetch";

const router = express.Router();

const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) {
    console.error("GEMINI_API_KEY missing!");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 1800,
    },
});

// Từ điển

async function fetchDictionary(word) {
    try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!res.ok) return null;

        const [entry] = await res.json();
        if (!entry) return null;

        const def = entry.meanings?.[0]?.definitions?.[0];

        return {
            word: entry.word,
            meaning: def?.definition || "",
            example: def?.example || "",
            partOfSpeech: entry.meanings?.[0]?.partOfSpeech || "",
            pronunciation: entry.phonetics?.[0]?.text || "",
        };
    } catch {
        return null;
    }
}

// Prompt

const BASE_PROMPT = `
You are an experienced **Vietnamese English teacher**.
You ALWAYS reply using the correct CASE format below.
Never add explanations outside the specified formats.
You give the output direct to the question like
### CASE 1. You will answer but without '### CASE 1'
-----------------------------------------------------------
### CASE 1 — WORD (meaning, example, usage)
Word: [...]
Part of Speech: [...]
Meaning (English): [...]
Meaning (Vietnamese): [...]
Example: [...]
→ [...]
Pronunciation: /.../
-----------------------------------------------------------

### CASE 2 — GRAMMAR (tense, structure, usage)
Grammar Point: [...]
Structure: [...]
Usage: [...]
Example: [...]
→ [...]
Negative: [...]
→ [...]
Question: [...]
→ [...]
-----------------------------------------------------------

### CASE 3 — GENERAL ENGLISH QUESTION  
Short bilingual explanation:  
English → Vietnamese  

-----------------------------------------------------------
### CASE 4 — SPELLING CORRECTION  
Original: [...]  
Corrected: [...]  
Explanation (EN → VI): [...]

-----------------------------------------------------------
### CASE 5 — PARAPHRASE (diễn đạt lại câu)  
Original: [...]  
Paraphrased: [...]  
→ [...]

-----------------------------------------------------------
### CASE 6 — FIX USER'S SENTENCE (grammar correction)  
Original: [...]  
Corrected: [...]  
Explanation (EN → VI): [...]

-----------------------------------------------------------
### CASE 7 — TRANSLATION  
English → Vietnamese  
Vietnamese → English  

-----------------------------------------------------------
### CASE 8 — SHORT CONVERSATION PRACTICE  
Topic: [...]  
Dialogue (A/B):  
A: [...]  
B: [...]  
→ Vietnamese translation  

-----------------------------------------------------------
### CASE 9 — OUTLINE (DÀN Ý CHỦ ĐỀ)  
Title: [...]  
Main Ideas:  
1. [...]  
2. [...]  
3. [...]  
Supporting Points:  
- [...]  
- [...]  
Conclusion: [...]

-----------------------------------------------------------
### CASE 10 — WRITING (TOPIC / PARAGRAPH / ESSAY / STORY)  
Title: [...]  
English Version: [...]  
Vietnamese Meaning: [...]

-----------------------------------------------------------

### CASE 11 - INTERACT
If user is response with 'hello/goodbye/....' first time of the chat, you will response like 'hello, how can i help you?'/'Goodbye, thank you for using our chat'/....
if the word appear the second time in the chat then give sort it into the other case to response.
Hello/Hi/... or any word mean greeting must be in this case if it is in the beginning of the chat or the end of the chat for goodbye,....

### RULES
- ALWAYS detect user intent automatically.
- ALWAYS use correct CASE format.
- KEEP English + Vietnamese.
- If user asks to “write about a topic” → always use CASE 10.
- If user asks for an outline → always use CASE 9.
- If spelling is wrong → silently correct using CASE 4.
- Do NOT add notes or disclaimers.
`;


router.post("/chat", async (req, res) => {
    try {
        const userInput = req.body.messages?.slice(-1)[0]?.content?.trim();
        if (!userInput) return res.status(400).json({ error: "No message" });

        const lower = userInput.toLowerCase();

        const isGrammar =
            /(thì|tense|câu điều kiện|khác nhau|difference|structure|cấu trúc|when to use)/i.test(lower);

        const isOutline =
            /(outline|dàn ý|main ideas|idea chính)/i.test(lower);

        const isWriting =
            /(write|viết|topic|essay|paragraph|story|bài luận|bài viết|đoạn văn)/i.test(lower);

        const isFixSentence =
            /(sai|chỉnh|sửa câu|correct this|fix this)/i.test(lower);

        const isParaphrase =
            /(paraphrase|diễn đạt lại|nói cách khác)/i.test(lower);

        const isTranslate =
            /(dịch|translate)/i.test(lower);

        const wordMatch = userInput.match(/^[a-zA-Z-]+$/);
        const word = wordMatch ? wordMatch[0].toLowerCase() : null;

        let dict = null;
        if (word) dict = await fetchDictionary(word);

        let TASK = "";

        if (isOutline) {
            TASK = `CASE 9 — Create an outline for: "${userInput}"`;
        } else if (isWriting) {
            TASK = `CASE 10 — Write a well-structured topic/paragraph/essay: "${userInput}"`;
        } else if (isFixSentence) {
            TASK = `CASE 6 — Fix the user's sentence: "${userInput}"`;
        } else if (isParaphrase) {
            TASK = `CASE 5 — Paraphrase: "${userInput}"`;
        } else if (isTranslate) {
            TASK = `CASE 7 — Translate: "${userInput}"`;
        } else if (isGrammar) {
            TASK = `CASE 2 — Explain grammar: "${userInput}"`;
        } else if (dict) {
            TASK = `CASE 1 — Use dictionary data:\n${JSON.stringify(dict, null, 2)}`;
        } else if (word) {
            TASK = `CASE 1 — Explain the word (auto-correct spelling if needed): "${word}"`;
        } else {
            TASK = `CASE 3 — General English question: "${userInput}"`;
        }

        const finalPrompt = `${BASE_PROMPT}\n\nUser: "${userInput}"\nTask: ${TASK}`;

        const result = await model.generateContent(finalPrompt);
        const reply = result.response?.text?.()?.trim();

        res.json({ reply: reply || "Sorry, I could not process your question." });
    } catch (err) {
        console.error("AI error:", err.message);
        res.status(500).json({ reply: "AI is busy. Try again later!" });
    }
});

export default router;
