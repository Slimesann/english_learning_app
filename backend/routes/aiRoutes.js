import express from "express";
import fs from "fs";
import { uploadSingle } from "../utils/multerConfig.js";
import { generateText, generateFromAudio } from "../utils/gemini.js";

const router = express.Router();

// reading
router.post("/reading", async (req, res) => {
    try {
        const { text, numQuestions } = req.body;
        const prompt = `
    Generate ${numQuestions || 5} English reading comprehension multiple-choice questions based on the text below.
    Return JSON array of objects with: { question, options, correctAnswer }.

    TEXT:
    ${text}
    `;
        const output = await generateText(prompt);
        res.json(JSON.parse(output));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Reading generation failed" });
    }
});

// listening
router.post("/listening", uploadSingle("audio"), async (req, res) => {
    try {
        const filePath = req.file.path;
        const prompt = "Transcribe this English audio and generate 5 comprehension questions as JSON.";
        const output = await generateFromAudio(filePath, prompt);
        res.json(JSON.parse(output));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Listening generation failed" });
    }
});

// writing
router.post("/writing", async (req, res) => {
    try {
        const { topic, essay } = req.body;
        const prompt = `
    You are an IELTS Writing Task 2 examiner.
    Evaluate the following essay on topic "${topic}".
    Give feedback on grammar, vocabulary, structure, and coherence.
    Then rate from 0-9.
    Return JSON: { feedback, score }.

    Essay:
    ${essay}
    `;
        const output = await generateText(prompt);
        res.json(JSON.parse(output));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Writing evaluation failed" });
    }
});

// speaking
router.post("/speaking", uploadSingle("audio"), async (req, res) => {
    try {
        const filePath = req.file.path;
        const prompt = `
            Listen to this student's speech and evaluate pronunciation, fluency, and grammar accuracy.
            Return JSON: { transcript, feedback, score }.
            `;
        const output = await generateFromAudio(filePath, prompt);
        res.json(JSON.parse(output));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Speaking evaluation failed" });
    }
});

export default router;
