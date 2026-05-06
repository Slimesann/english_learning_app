import User from "../models/user.js";
import Quiz from "../models/Quiz.js";
import Lesson from "../models/lesson.js";
import Exercise from "../models/exercise.js";
import Result from "../models/result.js";

export async function syncAllIndexes() {
    try {
        console.log("🔄 Syncing MongoDB indexes...");

        await Promise.all([
            User.syncIndexes(),
            Quiz.syncIndexes(),
            Lesson.syncIndexes(),
            Exercise.syncIndexes(),
            Result.syncIndexes(),
        ]);

        console.log("✅ All indexes synced successfully!");
    } catch (err) {
        console.error("❌ Error syncing indexes:", err.message);
    }
}
