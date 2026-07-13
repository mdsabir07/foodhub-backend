// 📁 app/services/order.service.ts (or your backend location)
import { prisma } from "../../lib/prisma";

interface FrontendCartData {
    items: Array<{ mealId: string; quantity: number; price: number }>;
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
}

export class OrderService {
    async createOrderFromCart(userId: string, deliveryAddress: string, cartData?: FrontendCartData) {

        // Execute everything within a unified safe transaction block.
        // Smooth checkout + avoid P2028 by minimizing the *interactive* transaction work.
        // Strategy:
        // 1) Seed/overwrite the user's cart from frontend payload (outside the transaction).
        // 2) Fetch the cart with items.
        // 3) Run a short transaction that only creates the order + order items + clears cart.

        // STEP A: Seed/overwrite cart outside interactive transaction
        if (cartData?.items?.length) {
            const cart = await prisma.cart.upsert({
                where: { userId },
                create: { userId },
                update: {},
            });

            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
            const cartItemsToSeed = cartData.items.map((item) => ({
                cartId: cart.id,
                mealId: item.mealId,
                quantity: item.quantity,
            }));

            await prisma.cartItem.createMany({ data: cartItemsToSeed });
        }

        // STEP B: Read cart outside interactive transaction
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { cartItems: { include: { meal: true } } },
        });

        if (!cart || cart.cartItems.length === 0) {
            throw new Error("Your shopping cart is completely empty.");
        }

        const calculatedTotal = cart.cartItems.reduce((acc: number, current) => {
            const itemPrice = Number(current.meal.price);
            return acc + itemPrice * current.quantity;
        }, 0);

        const totalAmount = parseFloat(calculatedTotal.toFixed(2));

        // STEP C: Short write transaction (create order + items + clear cart)
        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    customerId: userId,
                    deliveryAddress,
                    totalAmount,
                    status: "PLACED",
                },
            });

            const orderItemsData = cart.cartItems.map((item) => ({
                orderId: order.id,
                mealId: item.mealId,
                quantity: item.quantity,
                price: item.meal.price,
            }));

            await tx.orderItem.createMany({ data: orderItemsData });
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

            return tx.order.findUnique({
                where: { id: order.id },
                include: { orderItems: { include: { meal: true } } },
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