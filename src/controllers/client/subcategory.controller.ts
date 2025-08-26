import { ExtendedRequest } from "../../utilities/Interfaces";
import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import logger from "../../../logger";
import { SubcategoryService } from "../../services/client/Subcategory.Service";

const subcategoryService = new SubcategoryService();

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
