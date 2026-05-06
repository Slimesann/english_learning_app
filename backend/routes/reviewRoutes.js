import express from "express";
import {
    createReview,
    getReviewsByCourse,
    toggleHelpful,
} from "../controllers/reviewController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router
    .route("/courses/:courseId/reviews")
    .post(authMiddleware, createReview)     
    .get(getReviewsByCourse);             

router.post("/reviews/:id/helpful", authMiddleware, toggleHelpful);

export default router;