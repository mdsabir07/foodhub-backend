import { Router } from "express";
import { authorize, requireAuth } from "../../middleware/auth.middleware";
import { providerOrderController } from "./provider-order.controller";

const router = Router();

// Protect the entire sub-router path to logged in users with the PROVIDER role
router.get("/", requireAuth, authorize("PROVIDER"), providerOrderController.getDashboardOrders);
router.patch("/:id", requireAuth, authorize("PROVIDER"), providerOrderController.patchOrderStatus);

export const providerOrderRoutes: Router = router;