import { ExtendedRequest } from "../../utilities/Interfaces";
import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import logger from "../../../logger";
import { CategoryService } from "../../services/admin/Category.Service";

const categoryService = new CategoryService();

export const createCategory = async (req: ExtendedRequest, res: Response) => {
  const payload = req.body;
  try {
    const category = await categoryService.createCategory(payload);
    return res
      .status(201)
      .json({ message: "Category created successfully", data: category });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const createDefaultCategory = async (
  req: ExtendedRequest,
  res: Response
) => {
  const payload = req.body;
  try {
    const category = await categoryService.createDefaultCategory(payload);
    return res.status(200).json({
      message: "Default category created successfully",
      data: category,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req: ExtendedRequest, res: Response) => {
  const payload = req.body;
  try {
    const category = await categoryService.updateCategory(payload);
    return res
      .status(200)
      .json({ message: "Category updated successfully", data: category });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req: ExtendedRequest, res: Response) => {
  const filter = req.query;
  try {
    const categories = await categoryService.getCategories(filter);
    return res
      .status(200)
      .json({ message: "Categories fetched successfully", data: categories });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req: ExtendedRequest, res: Response) => {
  const { categoryID } = req.query as { categoryID: string };
  try {
    const category = await categoryService.deleteCategory(categoryID);
    return res
      .status(200)
      .json({ message: "Category deleted successfully", data: category });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
