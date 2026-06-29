import { Request, Response } from "express";
import { MealService } from "./meal.service";

const mealService = new MealService();

export class MealController {
    // Handle creating a meal
    async createMeal(req: Request, res: Response) {
        try {
            const { name, description, price, image, categoryId, userId } = req.body;

            // basic validation 
            if (!name || !price || !categoryId || !userId) {
                res.status(400).json({ message: "Missing required fields" });
                return;
            }

            const meal = await mealService.createMeal({
                name, description, price: Number(price), image, categoryId, userId
            });

            res.status(201).json({ success: true, data: meal });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.meal })
        }
    }

    // getting all meals with filter parsing
    async getAll(req: Request, res: Response) {
        try {
            const { categoryId, available, search } = req.body;

            const meals = await mealService.getAllMeals({
                categoryId: categoryId as string,
                isAvailable: available ? available === "true" : undefined,
                search: search as string
            });

            res.status(200).json({ success: true, data: meals })
        } catch (error: any) {
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