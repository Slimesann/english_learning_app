import mongoose from "mongoose";

const wordSchema = new mongoose.Schema({
    word: { type: String, required: true, trim: true },
    meaning: { type: String, required: true },
    example: { type: String, required: false },
    category: { type: String, default: "general" },
    difficulty: { 
        type: String, 
        enum: ["easy", "medium", "hard"], 
        default: "easy" 
    },
}, { timestamps: true });

const Word = mongoose.model("Word", wordSchema);
export default Word;
