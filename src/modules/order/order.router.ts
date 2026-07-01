import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { orderController } from "./order.controller";

const router = Router();

router.post("/", requireAuth, orderController.checkout);
router.get("/", requireAuth, orderController.getHistory);

export const orderRoutes: Router = router;