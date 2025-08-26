import { ExtendedRequest } from "../../utilities/Interfaces";
import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { CategoryService } from "../../services/client/Category.Service";
import logger from "../../../logger";

const categoryService = new CategoryService();

export const createCategory = async (req: ExtendedRequest, res: Response) => {
  const payload = req.body;
  try {
    const category = await categoryService.createCategory(payload);
    return res
      .status(201)
      .json({ message: "Category create successfully", data: category });
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
