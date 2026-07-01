import { prisma } from "../../lib/prisma";

export class OrderService {
    // 🚀 The Checkout Transaction Lifecycle
    async createOrderFromCart(userId: string, deliveryAddress: string) {
        // 1. Fetch the active cart items along with pricing details
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                cartItems: {
                    include: { meal: true }
                },
            },
        });

        if (!cart || cart.cartItems.length === 0) {
            throw new Error("Your shopping cart is completely empty.");
        }

        // 2. Compute the total cost securely on the backend
        const totalAmount = cart.cartItems.reduce((acc, current) => {
            return acc + (current.meal.price * current.quantity);
        }, 0);

        // 3. Execute the Transaction block safely
        return await prisma.$transaction(async (tx) => {
            // A. Generate the parent Order container matching your schema fields
            const order = await tx.order.create({
                data: {
                    customerId: userId,
                    deliveryAddress,
                    totalAmount,
                    status: "PLACED"
                }
            });

            // B. Map cart items into permanent frozen OrderItem records
            const orderItemsData = cart.cartItems.map((item) => ({
                orderId: order.id,
                mealId: item.mealId,
                quantity: item.quantity,
                price: item.meal.price // Freezing the historical cost
            }));

            await tx.orderItem.createMany({
                data: orderItemsData
            });

            // C. Wipe out all items from the customer's cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            // Return the completed order with items attached
            return tx.order.findUnique({
                where: { id: order.id },
                include: {
                    orderItems: {
                        include: { meal: true }
                    }
                }
            });
        });
    }

    // Fetch historical orders for a customer
    async getOrdersByCustomerId(userId: string) {
        return await prisma.order.findMany({
            where: { customerId: userId },
            include: {
                orderItems: {
                    include: { meal: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
    }
}

export const orderService = new OrderService();