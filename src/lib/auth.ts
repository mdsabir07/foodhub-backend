import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// ⚡ Import the native bearer plugin
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),
    trustedOrigins: [
        "http://localhost:3000",
        "https://dishmarket-psi.vercel.app", // Ensure your Vercel URL is exactly here
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
    cookies: {
        sessionToken: {
            attributes: {
                sameSite: "none" as const,
                secure: true
            }
        }
    },
    // 🔐 FORCE BETTER-AUTH TO GENERATE AND ACCEPT API TOKENS IN THE RESPONSE BODY
    plugins: [
        bearer()
    ]
});