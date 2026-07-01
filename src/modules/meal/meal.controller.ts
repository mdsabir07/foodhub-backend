import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { mealService } from "./meal.service";

export class MealController {
    // Handle creating a meal
    async createMeal(req: AuthenticatedRequest, res: Response) {
        try {
            const { name, description, price, image, categoryId } = req.body;

            if (!req.user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            // basic validation 
            if (!name || !description || price === undefined || !categoryId) {
                res.status(400).json({ success: false, message: "Missing required fields" });
                return;
            }

            const parsedPrice = Number(price);
            if (Number.isNaN(parsedPrice)) {
                res.status(400).json({ success: false, message: "Price must be a valid number" });
                return;
            }

            const meal = await mealService.createMeal({
                name, description, price: parsedPrice, image, categoryId, userId: req.user.id
            });

            res.status(201).json({ success: true, data: meal });
        } catch (error: any) {
            console.error("❌ BACKEND ERROR:", error);
            res.status(400).json({ success: false, error: error.message || "Failed to create meal" });
        }
    }

    // getting all meals with filter parsing
    async getAll(req: Request, res: Response) {
        try {
            const { categoryId, available, search } = req.query;

            // 🧠 Strict boolean check: only filter if explicitly passed as "true" or "false"
            let isAvailable: boolean | undefined = undefined;
            if (available === "true") isAvailable = true;
            else if (available === "false") isAvailable = false;

            const meals = await mealService.getAllMeals({
                categoryId: categoryId as string,
                isAvailable,
                search: search as string
            });

            res.status(200).json({ success: true, data: meals })
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
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const mealController = new MealController();