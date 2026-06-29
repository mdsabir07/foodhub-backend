import express, { Application } from "express";
import { mealRoutes } from "./modules/meal/meal.router";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";

const app: Application = express();

app.all("/api/auth/*splat", toNodeHandler(auth));

// Middleware
app.use(express.json());

// Root route for health check
app.get("/", (_req, res) => {
  res.json({ message: "FoodHub API is running", status: "OK" });
});

// Main app API routing 
app.use("/api/meals", mealRoutes);

export default app;