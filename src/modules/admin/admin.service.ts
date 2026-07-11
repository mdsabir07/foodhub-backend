import { prisma } from "../../lib/prisma";

export class AdminService {
    // ==========================================================
    // 1. DATABASE TRANSACTION: FETCH ALL USERS
    // ==========================================================
    async fetchAllUsers() {
        return await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isSuspended: true,
                createdAt: true,
                emailVerified: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    // ==========================================================
    // 2. DATABASE TRANSACTION: UPDATE USER SUSPENSION
    // ==========================================================
    async toggleUserSuspension(id: string, isSuspended: boolean) {
        return await prisma.user.update({
            where: { id },
            data: { isSuspended },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isSuspended: true,
            },
        });
    }
}

export const adminService = new AdminService();