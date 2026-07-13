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
app.use(cors({
  origin: "https://dishmarket-psi.vercel.app",
  credentials: true, // Required for Better-Auth secure session cookie transmission
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body Parsing Middleware
app.use(express.json());

// Better-Auth Session Handler Wildcard Catch-All Route
app.all("/api/auth/*splat", toNodeHandler(auth));

// Global API Health Check Route
app.get("/", (_req, res) => {
  res.json({ message: "FoodHub API is running", status: "OK" });
});

// Application Resource Mounting Points
app.use("/api/categories", categoryRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/provider/orders", providerOrderRoutes);
app.use("/api/admin", adminRoutes); // Admin routes for user management and administrative tasks

export default app;