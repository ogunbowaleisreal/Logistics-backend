import { Request, Response } from "express";
import { FAQService } from "../../services/admin/FAQ.Service";
import AppError from "../../utilities/ErrorHandler";
import { ExtendedRequest } from "../../utilities/Interfaces";
import logger from "../../../logger";

const faqService = new FAQService();

export const createFAQ = async (req: ExtendedRequest | any, res: Response) => {
  const payload = req.body;
  const businessId = req.body?.businessId ?? req.query.businessId;
  try {
    const faq = await faqService.createFAQ(businessId, payload);
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

export const getFAQs = async (req: ExtendedRequest | any, res: Response) => {
  const filter = req.query;
  const businessId = req.query.businessId;
  try {
    const faq = await faqService.getFAQs(businessId, filter);
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

export const updateFAQ = async (req: ExtendedRequest | any, res: Response) => {
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

export const deleteFAQ = async (req: ExtendedRequest | any, res: Response) => {
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
