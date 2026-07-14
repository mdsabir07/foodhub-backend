import { Response } from "express";
import { adminService } from "./admin.service";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

// ==========================================================
// 1. GET ALL USERS (Delegates to Service Layer)
// ==========================================================
export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const users = await adminService.fetchAllUsers();

        return res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error: any) {
        console.error("❌ GET ALL USERS CONTROLLER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user directory list.",
            error: error.message,
        });
    }
};

// ==========================================================
// 2. UPDATE USER SUSPENSION STATUS (Delegates to Service Layer)
// ==========================================================
export const updateUserStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { isSuspended } = req.body;

        // Validation check to ensure a boolean value is supplied
        if (typeof isSuspended !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "A boolean 'isSuspended' status must be explicitly provided.",
            });
        }

        // Prevent admins from accidentally suspending themselves
        if (req.user?.id === id) {
            return res.status(403).json({
                success: false,
                message: "Access Denied: You cannot suspend your own administrative account.",
            });
        }

        // Execute dynamic database write through Service
        const updatedUser = await adminService.toggleUserSuspension(id as string, isSuspended);

        return res.status(200).json({
            success: true,
            message: `User account has been successfully ${isSuspended ? "suspended" : "reactivated"}.`,
            data: updatedUser,
        });
    } catch (error: any) {
        console.error("❌ UPDATE USER STATUS CONTROLLER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update user account privileges.",
            error: error.message,
        });
    }
};