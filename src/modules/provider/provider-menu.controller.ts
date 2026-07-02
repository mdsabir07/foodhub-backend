import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { providerMenuService } from "./provider-menu.service";

export class ProviderMenuController {
    // POST /api/provider/meals
    async addMeal(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
            const { name, price, categoryId, description, dietaryPreferences } = req.body;

            if (!name || !price || !categoryId) {
                return res.status(400).json({ success: false, message: "Missing required fields: name, price, or categoryId." });
            }

            const meal = await providerMenuService.createMeal(req.user.id, {
                name,
                price: parseFloat(price),
                categoryId,
                description,
                dietaryPreferences,
            });
            res.status(201).json({ success: true, message: "Meal added to menu successfully", data: meal });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message })
        }
    }

    // PUT /api/provider/meals/:id
    async editMeal(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!id || Array.isArray(id)) return res.status(400).json({ success: false, message: "Missing or meal invalid id" });

            const updateMeal = await providerMenuService.updateMeal(id, req.user.id, req.body);
            res.status(200).json({ success: true, message: "Meal updated successfully", data: updateMeal });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // DELETE /api/provider/meals/:id
    async removeMeal(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!id || Array.isArray(id)) return res.status(400).json({ success: false, message: "Missing or meal invalid id" });

            const updateMeal = await providerMenuService.deleteMeal(id, req.user.id);
            res.status(200).json({ success: true, message: "Meal updated successfully", data: updateMeal });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const providerMenuController = new ProviderMenuController();