import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { mealService } from "./meal.service";

export class MealController {
    // Handle creating a meal
    async createMeal(req: AuthenticatedRequest, res: Response) {
        try {
            const providerId = req.user?.id;

            if (!providerId || typeof providerId !== "string") {
                res.status(401).json({ success: false, message: "Authentication required" });
                return;
            }

            // Destructure price out so we can clean it
            const { name, description, price, image, categoryId } = req.body;

            const meal = await mealService.createMeal({
                name, description, price: parseFloat(price), image, categoryId, userId: providerId
            });

            res.status(201).json({ success: true, data: meal });
        } catch (error: any) {
            console.error("❌ BACKEND ERROR:", error);
            res.status(400).json({ success: false, error: error.message || "Failed to create meal" });
        }
    }

    // Public route: Everyone can access, so standard Request is perfect here
    async getAll(req: Request, res: Response) {
        try {
            const meals = await mealService.getAllMeals(req.query);

            res.status(200).json({ success: true, count: meals.length, data: meals })
        } catch (error: any) {
            console.error("❌ BACKEND ERROR:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Handle getting a unique meal
    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            // Strict validation check
            if (!id || typeof id !== "string") {
                res.status(400).json({ success: false, message: "Invalid or missing Meal ID parameter" });
                return;
            }
            const meal = await mealService.getMealById(id);

            if (!meal) {
                res.status(404).json({ success: false, message: "Meal not found" });
                return;
            }

            res.status(200).json({ success: true, data: meal });
        } catch (error: any) {
            res.status(404).json({ success: false, error: error.message });
        }
    }

    // Protected mutation: Needs AuthenticatedRequest for req.user.id
    async updateMeal(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            if (!id || typeof id !== "string") {
                res.status(400).json({ success: false, message: "Invalid or missing Meal ID parameter" });
                return;
            }

            const providerId = req.user?.id;
            if (!providerId || typeof providerId !== "string") {
                res.status(401).json({ success: false, message: "Authentication required" });
                return;
            }

            // Build update payload and ensure price is fixed if it's being updated
            const updateData = {...req.body};
            if(updateData.price) {
                updateData.price = parseFloat(updateData.price); // Ensure numeric type safety
            }

            const updatedMeal = await mealService.updateMeal(id, providerId, updateData);
            res.status(200).json({ success: true, data: updatedMeal });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // Protected mutation: Needs AuthenticatedRequest for req.user.id
    async deleteMeal(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            if (!id || typeof id !== "string") {
                return res.status(400).json({ success: false, message: "Invalid or missing Meal ID parameter" });
            }

            const providerId = req.user?.id;
            if (!providerId || typeof providerId !== "string") {
                return res.status(400).json({ success: false, message: "Authentication required" });
            }

            await mealService.deleteMeal(id, providerId);
            res.status(200).json({ success: true, message: "Meal removed successfully" });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

export const mealController = new MealController();