import { Router } from "express";
import { authorize, requireAuth } from "../../middleware/auth.middleware";
import { providerMenuController } from "./provider-menu.controller";

const router = Router();

// Apply global protection block for this router instance
router.use(requireAuth, authorize("PROVIDER"));

router.post("/", providerMenuController.addMeal);
router.put("/:id", providerMenuController.editMeal);
router.delete("/:id", providerMenuController.removeMeal);

export const providerMenuRoutes: Router = router;