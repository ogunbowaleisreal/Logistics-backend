import { NextFunction, Request, Response } from "express";
import { FAQService } from "../../services/public/FAQ.Service";

const faqService = new FAQService();

export const getFAQs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const faqs = await faqService.getFAQs();
    return res.status(200).json({ message: "FAQs fetched successfully", data: faqs });
  } catch (error: any) {
    next(error);
  }
};
