import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { FAQService } from "../../services/business/FAQ.Service";

const faqService = new FAQService();

export const createFAQ = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const faq = await faqService.createFAQ(businessId, req.body);
    return res
      .status(201)
      .json({ message: "FAQ created successfully", data: faq });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const getFAQs = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const faq = await faqService.getFAQs(businessId, req.query);
    return res
      .status(200)
      .json({ message: "FAQ fetched successfully", data: faq });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const updateFAQ = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const faq = await faqService.updateFAQ(businessId, req.body);
    return res
      .status(200)
      .json({ message: "FAQ updated successfully", data: faq });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const deleteFAQ = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  const { faqID } = req.query as { faqID: string };
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    await faqService.deleteFAQ(businessId, faqID);
    return res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
