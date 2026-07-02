import express, { Application } from "express";
import { mealRoutes } from "./modules/meal/meal.router";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { cartRoutes } from "./modules/cart/cart.router";
import { orderRoutes } from "./modules/order/order.router";
import { providerOrderRoutes } from "./modules/provider/provider-order.router";

const app: Application = express();

app.all("/api/auth/*splat", toNodeHandler(auth));

// Middleware
app.use(express.json());

// Root route for health check
app.get("/", (_req, res) => {
  res.json({ message: "FoodHub API is running", status: "OK" });
});

// Meal app API routing 
app.use("/api/meals", mealRoutes);

// Cart app API routing
app.use("/api/cart", cartRoutes);

// Order app API routing
app.use("/api/orders", orderRoutes);

// Provider Order app API routing
app.use("/api/provider/orders", providerOrderRoutes);

export default app;