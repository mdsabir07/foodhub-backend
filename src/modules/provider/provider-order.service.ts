import { OrderStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

export class ProviderOrderService {
    // 1. Fetch all orders that contain a meal belonging to this provider
    async getIncomingOrders(providerId: string) {
        // providerId is the Better-Auth logged-in user id.
        // In Prisma, a Meal belongs to a provider via `Meal.userId`.
        return await prisma.order.findMany({
            where: {
                orderItems: {
                    some: {
                        meal: {
                            userId: providerId,
                        },
                    },
                },
            },
            include: {
                orderItems: {
                    where: {
                        meal: {
                            userId: providerId,
                        },
                    },
                    include: { meal: true },
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }

    // 2. Safely mutate the status flag of an order
    async updateStatus(orderId: string, providerId: string, status: OrderStatus) {
        // Verification: Ensure this order actually contains items belonging to this provider
        const targetOrder = await prisma.order.findFirst({
            where: {
                id: orderId,
                orderItems: {
                    some: {
                        meal: {
                            userId: providerId,
                        },
                    },
                },
            },
        });

        if (!targetOrder) {
            throw new Error("Order not found or does not belong to this provider");
        }

        return prisma.order.update({
            where: { id: orderId },
            data: { status },
        });
    }
}

export const providerOrderService = new ProviderOrderService();

