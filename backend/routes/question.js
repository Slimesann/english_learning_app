import express from "express";
import { createQuestion, getQuestions, likeQuestion, replyQuestion, likeReply } from "../controllers/questionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createQuestion);
router.get("/", getQuestions);
router.post("/:id/like", likeQuestion);
router.post("/:id/replies", replyQuestion);
router.post("/:id/replies/:replyId/like", likeReply);

export default router;