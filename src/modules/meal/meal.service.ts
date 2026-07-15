import { prisma } from "../../lib/prisma";

export interface MealFilterQuery {
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
}

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
        const { categoryId, userId } = mealData;

        const [category, user] = await Promise.all([
            prisma.category.findUnique({
                where: { id: categoryId },
                select: { id: true },
            }),
            prisma.user.findUnique({
                where: { id: userId },
                select: { id: true },
            }),
        ]);

        if (!category || !user) {
            throw new Error("Invalid categoryId or userId. Make sure the referenced category and user exist.");
        }

        return await prisma.meal.create({
            data: mealData,
        });
    }

    // Get all meals with optional filters (Public Feature)
    async getAllMeals(filters: MealFilterQuery) {
        const { categoryId, minPrice, maxPrice, search } = filters;
        const whereClause: any = {};

        if (categoryId) {
            whereClause.categoryId = categoryId;
        }

        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price.gte = parseFloat(minPrice);
            if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
        }

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } }
            ];
        }

        return await prisma.meal.findMany({
            where: whereClause,
            include: {
                category: true,
                provider: {
                    select: { id: true, name: true }
                },
                reviews: true
            },
            orderBy: { createdAt: "desc" }
        });

    }

    // Get detailed singular meal profile card
    async getMealById(id: string) {
        const meal = await prisma.meal.findUnique({
            where: { id },
            include: {
                category: true,
                provider: {
                    select: { id: true, name: true, email: true },
                },
                reviews: {
                    include: { customer: { select: { name: true } } }
                }
            },
        });
        if (!meal) throw new Error("Requested meal could not be located.");
        return meal;
    }

    // Secure update ensuring meal ownership via userId
    async updateMeal(mealId: string, providerId: string, data: any) {
        const existingMeal = await prisma.meal.findFirst({
            where: {
                id: mealId,
                userId: providerId
            },
        });

        if (!existingMeal) throw new Error("Meal not found or you don't have permission to modify it.");

        return await prisma.meal.update({
            where: { id: mealId },
            data,
        });
    }

    // Secure deletion matching ownership rules
    async deleteMeal(mealId: string, providerId: string) {
        const existingMeal = await prisma.meal.findFirst({
            where: { id: mealId, userId: providerId },
        });

        if (!existingMeal) throw new Error("Meal not found or don't have permission to delete it.");

        return await prisma.meal.delete({
            where: { id: mealId },
        });
    }
}

export const mealService = new MealService();