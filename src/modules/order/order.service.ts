import { prisma } from "../../lib/prisma";

interface FrontendCartData {
    items: Array<{ mealId: string; quantity: number; price: number }>;
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
}

export class OrderService {
    async createOrderFromCart(userId: string, deliveryAddress: string, cartData?: FrontendCartData) {

        // Execute everything within a unified safe transaction block
        return await prisma.$transaction(async (tx) => {

            // 🔄 STEP A: Synchronize incoming local storage state with the DB inside the isolated transaction
            if (cartData && cartData.items && cartData.items.length > 0) {
                let dbCart = await tx.cart.findUnique({ where: { userId } });
                if (!dbCart) {
                    dbCart = await tx.cart.create({ data: { userId } });
                }

                // Clean out old items within the isolated transaction instance 'tx'
                await tx.cartItem.deleteMany({ where: { cartId: dbCart.id } });

                const cartItemsToSeed = cartData.items.map((item) => ({
                    cartId: dbCart!.id,
                    mealId: item.mealId,
                    quantity: item.quantity,
                }));

                await tx.cartItem.createMany({ data: cartItemsToSeed });
            }

            // 1. Fetch active items securely from the transaction state
            const cart = await tx.cart.findUnique({
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

            // 2. Compute the total cost securely using the fresh DB values
            const totalAmount = cart.cartItems.reduce((acc: number, current) => {
                return acc + (current.meal.price * current.quantity);
            }, 0);

            // 3. Complete order processing sequentially
            // A. Generate parent Order record
            const order = await tx.order.create({
                data: {
                    customerId: userId,
                    deliveryAddress,
                    totalAmount,
                    status: "PLACED"
                }
            });

            // B. Map permanent history snapshot rows
            const orderItemsData = cart.cartItems.map((item: typeof cart.cartItems[0]) => ({
                orderId: order.id,
                mealId: item.mealId,
                quantity: item.quantity,
                price: item.meal.price
            }));

            await tx.orderItem.createMany({
                data: orderItemsData
            });

            // C. Clear the database cart table rows
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            // Return hydrated data payload
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