import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/definition/:word", async (req, res) => {
    try {
        const word = req.params.word;
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        res.json(response.data[0]);
    } catch (error) {
        res.status(500).json({ error: "Word not found" });
    }
});

export default router;