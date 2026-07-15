// 📁 src/app.ts
import express, { Application } from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

// Module Route Imports
import { categoryRoutes } from "./modules/category/category.routes";
import { mealRoutes } from "./modules/meal/meal.router";
import { cartRoutes } from "./modules/cart/cart.router";
import { orderRoutes } from "./modules/order/order.router";
import { providerOrderRoutes } from "./modules/provider/provider-order.router";
import { adminRoutes } from "./modules/admin/admin.router";

const app: Application = express();

// Cross-Origin Resource Sharing (CORS) Configuration
const corsOrigins = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests (no origin)
    if (!origin) return callback(null, true);
    if (corsOrigins.length === 0) return callback(null, true);

    // Fallback comparison strategy
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Required for Better-Auth secure session cookie transmission
  // ✅ FIXED: Added "PATCH" to allowed methods for user suspension status updates
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}));

// Body Parsing Middleware
app.use(express.json());

// Better-Auth Session Handler Wildcard Catch-All Route
app.all("/api/auth/*splat", toNodeHandler(auth));

// Global API Health Check Route
app.get("/", (_req, res) => {
  res.json({ message: "DishMarket API is running", status: "OK" });
});

// Application Resource Mounting Points
app.use("/api/categories", categoryRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/provider/orders", providerOrderRoutes);
app.use("/api/admin", adminRoutes); // Admin routes for user management and administrative tasks

export default app;