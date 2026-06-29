import express, { Application } from "express";
import { mealRoutes } from "./modules/meal/meal.router";

const app: Application = express();

// Middleware
app.use(express.json());

// Main app API routing 
app.use("/api/meals", mealRoutes);

export default app;