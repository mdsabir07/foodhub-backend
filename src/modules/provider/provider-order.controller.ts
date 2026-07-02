import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { providerOrderService } from "./provider-order.service";
import { OrderStatus } from "../../../generated/prisma/enums";

export class ProviderOrderController {
    // GET /api/provider/orders
    async getDashboardOrders(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
            const orders = await providerOrderService.getIncomingOrders(req.user.id);
            res.status(200).json({ success: true, data: orders });
        } catch (error: any) {
            console.error("❌ PROVIDER ORDERS GET ERROR:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // PATCH /api/provider/orders/:id
    async patchOrderStatus(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
            if (!status) return res.status(400).json({ success: false, message: "Missing explicit 'status' property in body." });
            if (!id || Array.isArray(id)) return res.status(400).json({ success: false, message: "Missing or invalid order id." });

            // Ensure the incoming status string maps to valid Prisma enum values
            if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
                return res.status(400).json({ success: false, message: `Invalid status code. options: ${Object.values(OrderStatus).join(", ")}` });
            }

            const updateOrder = await providerOrderService.updateStatus(id, req.user.id, status as OrderStatus);
            return res.status(200).json({ success: true, data: updateOrder });
        } catch (error: any) {
            console.error("❌ PROVIDER ORDER STATUS UPDATE ERROR:", error);
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const providerOrderController = new ProviderOrderController();