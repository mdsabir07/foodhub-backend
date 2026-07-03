import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { reviewService } from "./review.service";

export class ReviewController {
    // POST /api/meals/:mealId/reviews
    async addReview(req: AuthenticatedRequest, res: Response) {
        try {
            const { mealId } = req.params;
            const { rating, comment } = req.body;

            if (!mealId || typeof mealId !== "string") {
                return res.status(400).json({ success: false, message: "Invalid or missing meal ID parameter." });
            }

            const userId = req.user?.id;
            if (!userId || typeof userId !== "string") {
                return res.status(401).json({ success: false, message: "Authentication required." });
            }

            if (!rating) return res.status(400).json({ success: false, message: "A numerical rating is required." });

            const review = await reviewService.createReview(userId, mealId, Number(rating), comment);
            res.status(201).json({ success: true, message: "Review posted successfully!" });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // GET /api/meals/:mealId/reviews (Public Route)
    async getReviews(req: Request, res: Response) {
        try {
            const { mealId } = req.params;
            if (!mealId || typeof mealId !== "string") {
                return res.status(400).json({ success: false, message: "Invalid or missing meal ID parameter." })
            }
            const reviews = await reviewService.getMealReviews(mealId);
            res.status(200).json({ success: true, count: reviews.length, data: reviews });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const reviewController = new ReviewController();