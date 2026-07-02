import { prisma } from "../../lib/prisma";

export class ProviderMenuService {
    // 1. Create a brand new meal tied to this provider
    async createMeal(providerId: string, data: { name: string; description: string; price: number; categoryId: string; dietaryPreferences?: string; }) {
        const { categoryId, ...restOfData } = data;
        return await prisma.meal.create({
            data: {
                ...restOfData,
                provider: {
                    connect: { id: providerId }
                },
                category: {
                    connect: { id: categoryId }
                }
            },
        });
    }

    // 2. Update an existing meal (ensuring it belongs to this provider)
    async updateMeal(mealId: string, providerId: string, data: Partial<{ name: string, description: string, price: number, categoryId: string }>) {
        const existingMeal = await prisma.meal.findFirst({
            where: { id: mealId, providerId },
        });
        if (!existingMeal) {
            throw new Error("Meal not found or you don't have permission to modify it.");
        }

        return await prisma.meal.update({
            where: { id: mealId },
            data,
        });
    }

    // 3. Remove a meal from the database cleanly
    async deleteMeal(mealId: string, providerId: string) {
        const existingMeal = await prisma.meal.findFirst({
            where: { id: mealId, providerId },
        });

        if (!existingMeal) {
            throw new Error("Meal not found or you don't have permission to delete it.");
        }

        return await prisma.meal.delete({
            where: { id: mealId },
        });
    }
}

export const providerMenuService = new ProviderMenuService();