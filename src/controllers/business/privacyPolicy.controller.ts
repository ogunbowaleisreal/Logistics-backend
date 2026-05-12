import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { PrivacyPolicyService } from "../../services/business/PrivacyPolicy.Service";

const privacyPolicyService = new PrivacyPolicyService();

export const createOrUpdatePrivacyPolicy = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const policy = await privacyPolicyService.createOrUpdatePrivacyPolicy(
      businessId,
      req.body.body,
    );
    return res
      .status(201)
      .json({ message: "Privacy policy updated successfully", data: policy });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const getPrivacyPolicy = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const policy = await privacyPolicyService.getPrivacyPolicy(businessId);
    return res
      .status(200)
      .json({ message: "Privacy policy fetched successfully", data: policy });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
