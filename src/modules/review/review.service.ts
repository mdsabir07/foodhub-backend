import { prisma } from "../../lib/prisma";

export class ReviewService {
    // 1. Create a new review for a meal
    async createReview(userId: string, mealId: string, rating: number, comment?: string) {
        // Validation check: Ensure the score stays within 1 to 5 stars
        if (rating < 1 || rating > 5) {
            throw new Error("Rating score must be an integer between 1 and 5.");
        }

        // Optional business rule check: Make sure the meal actually exists first
        const mealExists = await prisma.meal.findUnique({ where: { id: mealId } });
        if (!mealExists) {
            throw new Error("The meal you are trying to review does not exist.");
        }

        return await prisma.review.create({
            data: {
                customerId: userId,
                mealId,
                rating,
                ...(comment !== undefined ? { comment } : {})
            },
            include: {
                customer: { select: { name: true, image: true } }
            }
        });
    }

    // 2. Get all reviews for a specific meal
    async getMealReviews(mealId: string) {
        return await prisma.review.findMany({
            where: { mealId },
            include: {
                customer: { select: { name: true, image: true } }
            },
            orderBy: { createdAt: "desc" }
        });
    }
}

export const reviewService = new ReviewService();