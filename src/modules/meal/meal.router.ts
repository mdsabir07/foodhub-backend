import { Router } from "express";
import { MealController } from "./meal.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();
const mealController = new MealController();

// Public Routes
router.get("/", mealController.getAll);
router.get("/:id", mealController.getById);

// Provider Route (Will secure later with Better Auth authentication middleware)
router.post("/", requireAuth, mealController.createMeal);

export const mealRoutes: Router = router;