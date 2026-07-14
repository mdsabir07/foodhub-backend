import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    trustedOrigins: [
        "http://localhost:3000",
        process.env.BETTER_AUTH_TRUSTED_ORIGINS || ""
    ].filter(Boolean),
    emailAndPassword: {
        enabled: true
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "CUSTOMER"
            }
        }
    },
    // 🔐 Type-Safe Session Cookie Settings
    cookies: {
        sessionToken: {
            attributes: {
                sameSite: "none" as const, // 💡 Adding 'as const' ensures TypeScript compiles successfully
                secure: true
            }
        }
    }
});