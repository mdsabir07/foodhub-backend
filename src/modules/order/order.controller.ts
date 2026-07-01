import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { orderService } from "./order.service";

export class OrderController {
    // POST /api/orders - Checkout active cart
    async checkout(req: AuthenticatedRequest, res: Response) {
        try {
            const { deliveryAddress } = req.body;

            if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!deliveryAddress) return res.status(400).json({ success: false, message: "Delivery address is required to place an order." });

            const order = await orderService.createOrderFromCart(req.user.id, deliveryAddress);
            res.status(201).json({ success: true, message: "Order placed successfully", data: order });
        } catch (error: any) {
            console.error("❌ CHECKOUT ERROR:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // GET /api/orders - Get user's order history
    async getHistory(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

            const orders = await orderService.getOrdersByCustomerId(req.user.id);
            res.status(200).json({ success: true, data: orders });
        } catch (error: any) {
            console.error("❌ ORDER HISTORY ERROR:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const orderController = new OrderController();