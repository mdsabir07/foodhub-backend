import { prisma } from "../../lib/prisma";

export class MealService {
    // Create a new meal (Provider Feature)
    async createMeal(mealData: {
        name: string;
        description: string;
        price: number;
        image?: string;
        categoryId: string;
        userId: string;
    }) {
        return await prisma.meal.create({
            data: mealData,
        });
    }

    // Get all meals with optional filters (Public Feature)
    async getAllMeals(filters: {
        categoryId?: string | undefined;
        isAvailable?: boolean | undefined;
        search?: string | undefined;
    }) {
        const { categoryId, isAvailable, search } = filters;

        return await prisma.meal.findMany({
            where: {
                ...(categoryId && { categoryId }),
                ...(isAvailable !== undefined && { isAvailable }),
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { description: { contains: search, mode: "insensitive" } },
                    ],
                }),
            },
            include: {
                category: {
                    select: {
                        name: true, slug: true
                    },
                },
            },
        });
    }

    // Get a specific meal by ID (Public Feature)
    async getMealById(id: string) {
        return await prisma.meal.findUnique({
            where: { id },
            include: {
                category: true,
                provider: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
}