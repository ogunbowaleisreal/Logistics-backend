import { Request, Response } from "express";
import { FAQService } from "../../services/client/FAQ.Service";
import AppError from "../../utilities/ErrorHandler";
import { ExtendedRequest } from "../../utilities/Interfaces";
import logger from "../../../logger";

const faqService = new FAQService();

export const getFAQCategories = async (req: ExtendedRequest, res: Response) => {
  const filter = req.query;
  try {
    const categories = await faqService.getFAQCategories(
      req.businessId!,
      filter,
    );
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

export const getFAQs = async (req: ExtendedRequest, res: Response) => {
  const filter = req.query;
  try {
    const faq = await faqService.getFAQs(req.businessId!, filter);
    return res
      .status(200)
      .json({ message: "FAQ fetched successfully", data: faq });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
