import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { cartService } from "./cart.service";

export class CartController {
    // GET /api/cart - Retrieve active cart
    async getCart(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const cart = await cartService.getCartByUserId(req.user.id);
            res.status(200).json({ success: true, data: cart })
        } catch (error: any) {
            console.error("❌ CART ERROR:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // POST /api/cart/items - Add a meal line item
    async addItem(req: AuthenticatedRequest, res: Response) {
        try {
            const { mealId, quantity } = req.body;

            if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!mealId) return res.status(400).json({ success: false, message: "Missing mealId" });

            const targetQuantity = quantity ? Number(quantity) : 1;
            if (Number.isNaN(targetQuantity) || targetQuantity <= 0) {
                return res.status(400).json({ success: false, message: "Quantity must be a valid positive number" });
            }

            const cartItem = await cartService.addItemToCart(req.user.id, mealId, targetQuantity);
            res.status(200).json({ success: true, message: "Item updated in cart successfully", data: cartItem });
        } catch (error: any) {
            console.error("❌ CART ERROR:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // PUT /api/cart/items - Update absolute quantity
    async updateQuantity(req: AuthenticatedRequest, res: Response) {
        try {
            const { mealId, quantity } = req.body;
            if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!mealId || quantity === undefined) {
                return res.status(400).json({ success: true, message: "Missing mealId or quantity" });
            }

            const parseQuantity = Number(quantity);
            if (Number.isNaN(parseQuantity)) {
                return res.status(400).json({ success: false, message: "Quantity must be a valid number" })
            }

            const updatedItem = await cartService.updateItemQuantity(req.user.id, mealId, parseQuantity);
            res.status(200).json({ success: true, message: "Cart updated successfully", data: updatedItem });
        } catch (error: any) {
            console.error("❌ CART ERROR:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // DELETE /api/cart/items/:mealId - Remove item entirely
    async removeItem(req: AuthenticatedRequest, res: Response) {
        try {
            const { mealId } = req.params as { mealId: string };
            if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!mealId) return res.status(400).json({ success: false, message: "Missing mealId parameter" });

            await cartService.removeItemFromCart(req.user.id, mealId);
            res.status(200).json({ success: true, message: "Item removed from cart completely" });
        } catch (error: any) {
            console.error("❌ CART ERROR:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const cartController = new CartController();