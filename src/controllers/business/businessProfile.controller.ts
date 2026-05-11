import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { BusinessProfileService } from "../../services/business/BusinessProfile.Service";

const businessProfileService = new BusinessProfileService();

export const getProfile = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const data = await businessProfileService.getProfile(businessId);
    return res
      .status(200)
      .json({ message: "Business profile retrieved successfully", data });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const updateSocialLinks = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const data = await businessProfileService.updateSocialLinks(
      businessId,
      req.body,
    );
    return res
      .status(200)
      .json({ message: "Social links updated successfully", data });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const updateSupport = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const data = await businessProfileService.updateSupport(
      businessId,
      req.body,
    );
    return res
      .status(200)
      .json({ message: "Support settings updated successfully", data });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
