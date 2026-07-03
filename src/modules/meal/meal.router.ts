import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";
import { mealController } from "./meal.controller";
import { reviewRoutes } from "../review/review.router";

const router = Router();

// Route Forwarding for Reviews
router.use("/:mealId/reviews", reviewRoutes);

// 🌐 Public Routes (Anyone can browse)
router.get("/", mealController.getAll);
router.get("/:id", mealController.getById);

// 🍳 Provider/Admin Routes (Protected mutations)
router.post("/", requireAuth, requireRole("PROVIDER", "ADMIN"), mealController.createMeal);
router.put("/:id", requireAuth, requireRole("PROVIDER", "ADMIN"), mealController.updateMeal); // 👈 Added
router.delete("/:id", requireAuth, requireRole("PROVIDER", "ADMIN"), mealController.deleteMeal); // 👈 Added

export const mealRoutes: Router = router;