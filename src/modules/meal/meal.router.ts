import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { mealController } from "./meal.controller";

const router = Router();

// Public Routes
router.get("/", mealController.getAll);
router.get("/:id", mealController.getById);

// Provider Route (Will secure later with Better Auth authentication middleware)
router.post("/", requireAuth, requireRole("PROVIDER", "ADMIN"), mealController.createMeal);

export const mealRoutes: Router = router;