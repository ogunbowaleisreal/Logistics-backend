import { Request, Response } from "express";
import {
  FAQCategoryService,
  FAQService,
} from "../../services/admin/FAQ.Service";
import AppError from "../../utilities/ErrorHandler";
import { ExtendedRequest } from "../../utilities/Interfaces";
import logger from "../../../logger";

const faqCategoryService = new FAQCategoryService();
const faqService = new FAQService();

export const createFAQCategory = async (
  req: ExtendedRequest,
  res: Response
) => {
  const payload = req.body;
  try {
    const category = await faqCategoryService.createFAQCategory(payload);
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

export const getFAQCategories = async (req: ExtendedRequest, res: Response) => {
  const filter = req.query;
  try {
    const categories = await faqCategoryService.getFAQCategories(filter);
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

export const updateFAQCategory = async (
  req: ExtendedRequest,
  res: Response
) => {
  const payload = req.body;
  try {
    const category = await faqCategoryService.updateFAQCategory(payload);
    return res
      .status(201)
      .json({ message: "FAQ Category created successfully", data: category });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const createFAQ = async (req: ExtendedRequest, res: Response) => {
  const payload = req.body;
  try {
    const faq = await faqService.createFAQ(payload);
    return res
      .status(201)
      .json({ message: "FAQ created successfully", data: faq });
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
    const faq = await faqService.getFAQs(filter);
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

export const updateFAQ = async (req: ExtendedRequest, res: Response) => {
  const payload = req.body;
  try {
    const faq = await faqService.updateFAQ(payload);
    return res
      .status(201)
      .json({ message: "FAQ updated successfully", data: faq });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteFAQ = async (req: ExtendedRequest, res: Response) => {
  const { faqID } = req.query as { faqID: string };
  try {
    const faq = await faqService.deleteFAQ(faqID);
    return res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
