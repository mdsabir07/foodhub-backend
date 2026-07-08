import { Request, Response } from "express";
import { categoryService } from "./category.service";

export class CategoryController {
    // 1. HANDLE FETCH ALL CATEGORIES
    async getAll(req: Request, res: Response) {
        try {
            const categories = await categoryService.getAllCategories();
            return res.status(200).json({ success: true, message: "Categories fetched successfully", data: categories });
        } catch (error: any) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // 2. HANDLE CREATE NEW CATEGORY
    async create(req: Request, res: Response) {
        try {
            const { name } = req.body;

            if (!name || name.trim() === "") {
                return res.status(400).json({ success: false, message: "Category name is required." });
            }

            const newCategory = await categoryService.createCategory(name);
            return res.status(201).json({ success: true, message: "Category created successfully", data: newCategory });
        } catch (error: any) {
            // If our service threw the "already exists" error, catch it gracefully
            const statusCode = error.message === "This category already exists." ? 400 : 500;
            return res.status(statusCode).json({ success: false, error: error.message });
        }
    }
}

export const categoryController = new CategoryController();