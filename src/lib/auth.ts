import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    trustedOrigins: [
        "http://localhost:3000",
        "https://dishmarket-psi.vercel.app",
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
                sameSite: "none" as const,
                secure: true
            }
        }
    },
    // 🔐 ENFORCE CROSS-DOMAIN SESSION STORAGE
    advanced: {
        crossSubDomainCookies: {
            enabled: true
        }
    }
});