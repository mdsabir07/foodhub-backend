import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
import { success } from "better-auth";

// Extend Express Request type to include the authenticated user context
export interface AuthenticatedRequest extends Request {
    user?: typeof auth.$Infer.Session.user;
    session?: typeof auth.$Infer.Session.session;
}

export const requireAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        // Better Auth automatically parses cookie/headers from the incoming Node Request Object
        const session = await auth.api.getSession({
            headers: {
                cookie: req.headers.cookie || "",
                authorization: req.headers.authorization || "",
            },
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Please sign in to access this resource."
            });
        }

        // Attach user and session data to the request object for use in controllers
        req.user = session.user as any;
        req.session = session.session as any;

        next();
    } catch (error: any) {
        console.error("🔒 AUTH MIDDLEWARE ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during authentication."
        })
    }
}