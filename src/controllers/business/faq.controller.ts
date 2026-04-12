import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import {
  FAQCategoryService,
  FAQService,
} from "../../services/admin/FAQ.Service";

const faqCategoryService = new FAQCategoryService();
const faqService = new FAQService();

export const createFAQCategory = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const category = await faqCategoryService.createFAQCategory(
      businessId,
      req.body,
    );
    return res
      .status(201)
      .json({ message: "Category created successfully", data: category });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const getFAQCategories = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const categories = await faqCategoryService.getFAQCategories(
      businessId,
      req.query,
    );
    return res
      .status(200)
      .json({ message: "Categories fetched successfully", data: categories });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const updateFAQCategory = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const category = await faqCategoryService.updateFAQCategory(
      businessId,
      req.body,
    );
    return res
      .status(200)
      .json({ message: "FAQ Category updated successfully", data: category });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

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
