import { prisma } from "../../lib/prisma";

export class CategoryService {
    // 1. FETCH ALL CATEGORIES
    async getAllCategories() {
        await prisma.category.findMany({
            orderBy: {
                name: "asc" // Automatically sorts them alphabetically (A-Z) for your frontend dropdown
            },
        });
    }

    // 2. CREATE A NEW CATEGORY
    async createCategory(name: string) {
        // Auto-generate a clean, URL-safe slug: "Fast Food 🍔" -> "fast-food"
        const slug = name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "") // Strip out emojis and special characters
            .replace(/[\s_-]+/g, "-") // Replace spaces or underscores with a single dash
            .replace(/^-+|-+$/g, "") // Trim any dangling dashes from the edges

        // Fail-safe check: Ensure this category name or slug doesn't already exist
        const existing = await prisma.category.findFirst({
            where: {
                OR: [{ name: name.trim() }, { slug }],
            },
        });

        if (existing) {
            throw new Error("This category already exists.");
        }

        return await prisma.category.create({
            data: {
                name: name.trim(),
                slug,
            },
        });
    }
}

export const categoryService = new CategoryService();