import { prisma } from "../../lib/prisma";

export class CartService {
    // 1. Fetch a user's cart along with all items and meal details
    async getCartByUserId(userId: string) {
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                cartItems: {
                    include: {
                        meal: true
                    },
                },
            },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: {
                    cartItems: {
                        include: {
                            meal: true
                        },
                    },
                },
            });
        }
        return cart;
    }

    // 2. Add an item to the cart or increment quantity if it already exists
    async addItemToCart(userId: string, mealId: string, quantity: number) {
        const cart = await this.getCartByUserId(userId);

        return await prisma.cartItem.upsert({
            where: {
                cartId_mealId: {
                    cartId: cart.id,
                    mealId
                },
            },
            update: {
                quantity: { increment: quantity },
            },
            create: {
                cartId: cart.id,
                mealId,
                quantity
            },
        });
    }

    // 3. Update an item's absolute quantity, or wipe it out if it hits 0
    async updateItemQuantity(userId: string, mealId: string, quantity: number) {
        const cart = await this.getCartByUserId(userId);

        if (quantity <= 0) {
            return await this.removeItemFromCart(userId, mealId);
        }

        return await prisma.cartItem.update({
            where: {
                cartId_mealId: {
                    cartId: cart.id,
                    mealId
                },
            },
            data: {
                quantity
            },
        });
    }

    // 4. Instantly remove an item from the cart completely
    async removeItemFromCart(userId: string, mealId: string) {
        const cart = await this.getCartByUserId(userId);

        return await prisma.cartItem.delete({
            where: {
                cartId_mealId: {
                    cartId: cart.id,
                    mealId,
                },
            },
        });
    }
}

export const cartService = new CartService();
