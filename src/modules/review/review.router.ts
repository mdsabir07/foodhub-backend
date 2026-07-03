import { Router } from "express";
import { reviewController } from "./review.controller";
import { requireAuth } from "../../middleware/auth.middleware";

// We use mergeParams: true here so we can access the :mealId from parent routes!
const router = Router({ mergeParams: true });

// Public route: Anyone can see a meal's feedback section
router.get("/", reviewController.getReviews);

// Protected route: Only logged in users can write a review
router.post("/", requireAuth, reviewController.addReview);

export const reviewRoutes: Router = router;