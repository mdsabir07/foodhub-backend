import { NextFunction, Response } from "express"
import { AuthenticatedRequest } from "./auth.middleware"
import { success } from "better-auth"

export const requireRole = (...allowedRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        // 1. Ensure the user is actually attached to the request (safety check)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User context missing."
            });
        }

        // 2. Check if the user's role is included in the list of allowed roles
        const hasRole = allowedRoles.includes(req.user.role);
        if (!hasRole) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: You do not have permission to perform this action. Required role: [${allowedRoles.join(", ")}]`,
            });
        }

        // 3. If they pass the check, move to the controller!
        next();
    }
}