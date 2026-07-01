import { prisma } from "../src/lib/prisma";

async function main() {
    console.log("🌱 Starting database seeding...");

    // 1. Clean up any existing categories to avoid duplicates
    await prisma.category.deleteMany();

    // 2. Create default system categories
    const categories = await prisma.category.createMany({
        data: [
            { name: "Fast Food", slug: "fast-food" },
            { name: "Healthy", slug: "healthy" },
            { name: "Desserts", slug: "desserts" },
            { name: "Beverages", slug: "beverages" },
        ],
    });

    console.log(`✅ Successfully seeded ${categories.count} categories!`);
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });