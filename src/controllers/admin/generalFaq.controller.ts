import { Request, Response } from "express";
import { GeneralFAQService } from "../../services/admin/GeneralFAQ.Service";
import AppError from "../../utilities/ErrorHandler";
import logger from "../../../logger";

const generalFaqService = new GeneralFAQService();

export const createGeneralFAQ = async (req: Request, res: Response) => {
  try {
    const faq = await generalFaqService.createFAQ(req.body);
    return res.status(201).json({ message: "FAQ created successfully", data: faq });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getGeneralFAQs = async (req: Request, res: Response) => {
  try {
    const faqs = await generalFaqService.getFAQs();
    return res.status(200).json({ message: "FAQs fetched successfully", data: faqs });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateGeneralFAQ = async (req: Request, res: Response) => {
  try {
    const faq = await generalFaqService.updateFAQ(req.body);
    return res.status(200).json({ message: "FAQ updated successfully", data: faq });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteGeneralFAQ = async (req: Request, res: Response) => {
  const { faqID } = req.query as { faqID: string };
  try {
    await generalFaqService.deleteFAQ(faqID);
    return res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
