import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { TermsAndConditionsService } from "../../services/business/TermsAndConditions.Service";

const termsAndConditionsService = new TermsAndConditionsService();

export const createOrUpdateTermsAndConditions = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const termsAndConditions =
      await termsAndConditionsService.createOrUpdateTermsAndConditions(
        businessId,
        req.body.body,
      );
    return res.status(201).json({
      message: "Terms and conditions updated successfully",
      data: termsAndConditions,
    });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const getTermsAndConditions = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const termsAndConditions =
      await termsAndConditionsService.getTermsAndConditions(businessId);
    return res.status(200).json({
      message: "Terms and conditions fetched successfully",
      data: termsAndConditions,
    });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
