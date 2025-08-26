import { ExtendedRequest } from "../../utilities/Interfaces";
import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import logger from "../../../logger";
import { CategoryService } from "../../services/admin/Category.Service";
import { SubcategoryService } from "../../services/admin/Subcategory.Service";

const categoryService = new CategoryService();
const subcategoryService = new SubcategoryService(categoryService);

export const createSubcategory = async (
  req: ExtendedRequest,
  res: Response
) => {
  const payload = req.body;
  try {
    const subcategory = await subcategoryService.createSubcategory(payload);
    return res
      .status(201)
      .json({ message: "Subcategory created successfully", data: subcategory });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateSubcategory = async (
  req: ExtendedRequest,
  res: Response
) => {
  const payload = req.body;
  try {
    const subcategory = await subcategoryService.updateSubcategory(payload);
    return res
      .status(200)
      .json({ message: "Subcategory updated successfully", data: subcategory });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getSubcategories = async (req: ExtendedRequest, res: Response) => {
  const filter = req.query;
  try {
    const subcategories = await subcategoryService.getSubcategories(filter);
    return res.status(200).json({
      message: "Subcategories fetched successfully",
      data: subcategories,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteSubcategory = async (
  req: ExtendedRequest,
  res: Response
) => {
  const { subcategoryID } = req.query as { subcategoryID: string };
  try {
    await subcategoryService.deleteSubcategory(subcategoryID);
    return res.status(200).json({ message: "Subcategory deleted successfully" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
