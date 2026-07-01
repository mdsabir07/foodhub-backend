import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { cartController } from "./cart.controller";

const router = Router();

router.get("/", requireAuth, cartController.getCart);
router.post("/items", requireAuth, cartController.addItem);
router.put("/items", requireAuth, cartController.updateQuantity);
router.delete("/items/:mealId", requireAuth, cartController.removeItem);

export const cartRoutes: Router = router;