import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

const isProd = process.env.NODE_ENV === "production";

const trustedOrigins = [
    "http://localhost:3000",
    // Backward-compatible default; override via env in production
    "https://dishmarket-psi.vercel.app",
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
].filter(Boolean);

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    trustedOrigins,

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
                // secure cookies must be used over HTTPS; avoid breaking local HTTP setups
                secure: isProd,
            },
        },
    },
});
