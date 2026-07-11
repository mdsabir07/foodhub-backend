import { prisma } from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

async function main() {
    console.log("🌱 Starting database seeding...");

    // ==========================================
    // SEED DEFAULT SYSTEM ADMIN ACCOUNT ONLY
    // ==========================================
    console.log("🔎 Checking for existing Admin user...");
    const adminEmail = "admin@sabiha.com";
    
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (!existingAdmin) {
        console.log("📥 Seeding default system Admin via Better-Auth APIs...");
        
        try {
            // 1. Create the credentials user using Better-Auth's native server engine.
            // This safely hashes the password and creates the relational tables.
            await auth.api.signUpEmail({
                body: {
                    name: "System Administrator",
                    email: adminEmail,
                    password: "AdminPass123!", // Password will hash correctly automatically
                }
            });

            console.log("🛡️ Elevating seeded account privileges to ADMIN...");
            
            // 2. Elevate the user role in Prisma safely
            await prisma.user.update({
                where: { email: adminEmail },
                data: {
                    role: "ADMIN",
                    emailVerified: true
                }
            });

            console.log(`✅ Admin user seeded and elevated successfully! (${adminEmail})`);
        } catch (authError: any) {
            console.error("❌ Better-Auth Registration API failed:", authError?.message || authError);
            throw authError;
        }
    } else {
        console.log("ℹ️ Admin user already exists. Skipping seeder insert.");
    }
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });