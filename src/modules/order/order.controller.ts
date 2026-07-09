import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { orderService } from "./order.service";

// 📦 Define the interface matching the frontend payload shape exactly
interface FrontendCartData {
    items: Array<{ mealId: string; quantity: number; price: number }>;
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
}

export class OrderController {
    // POST /api/orders - Checkout active cart
    async checkout(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            console.log("📥 RECEIVED CHECKOUT BODY:", JSON.stringify(req.body, null, 2));

            const { items, subtotal, deliveryFee, totalAmount, deliveryAddress } = req.body;

            if (!deliveryAddress) {
                return res.status(400).json({ success: false, message: "Delivery address is required to place an order." });
            }

            // Group the financial and item attributes into the matching CartData format
            const cartData: FrontendCartData = {
                items: items.map((item: any) => ({
                    mealId: item.mealId,
                    quantity: parseInt(item.quantity, 10),
                    price: parseFloat(Number(item.price).toFixed(2)) // Force exactly 2 decimal places
                })),
                subtotal: parseFloat(Number(subtotal).toFixed(2)),
                deliveryFee: parseFloat(Number(deliveryFee).toFixed(2)),
                totalAmount: parseFloat(Number(totalAmount).toFixed(2))
            };

            // Pass the data cleanly down to your updated transaction layer
            const order = await orderService.createOrderFromCart(
                req.user.id,
                deliveryAddress,
                cartData
            );

            return res.status(201).json({
                success: true,
                message: "Order placed successfully",
                data: order
            });
        } catch (error: any) {
            console.error("❌ CHECKOUT ERROR:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // GET /api/orders - Get user's order history
    async getHistory(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const orders = await orderService.getOrdersByCustomerId(req.user.id);
            return res.status(200).json({ success: true, data: orders });
        } catch (error: any) {
            console.error("❌ ORDER HISTORY ERROR:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const orderController = new OrderController();