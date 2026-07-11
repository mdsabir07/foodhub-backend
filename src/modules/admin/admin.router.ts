import { Router } from "express";
import { getAllUsers, updateUserStatus } from "./admin.controller";
import { authorize, requireAuth } from "../../middleware/auth.middleware";

const router = Router();

// ==========================================================
// 🔒 ADMIN-ONLY SECURED SUB-ROUTING MATRIX
// ==========================================================

// Apply standard global authentication & role authorizations
router.use(requireAuth);
router.use(authorize("ADMIN"));

// GET /api/admin/users - Retrieves all registered user accounts
router.get("/users", getAllUsers);

// PATCH /api/admin/users/:id - Modifies user status parameters (suspend/activate)
router.patch("/users/:id", updateUserStatus);

export const adminRoutes: Router = router;