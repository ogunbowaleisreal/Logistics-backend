import { Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { BusinessProfileService } from "../../services/client/BusinessProfile.Service";

const businessProfileService = new BusinessProfileService();

export const getBusinessProfile = async (
  req: ExtendedRequest,
  res: Response,
): Promise<Response> => {
  const { businessId: queryBusinessId } = req.query as { businessId?: string };
  const businessId = req.businessId || queryBusinessId;
  if (!businessId) {
    return res.status(400).json({ message: "Business ID is required" });
  }
  try {
    const data = await businessProfileService.getBusinessProfile(businessId);
    return res.status(200).json({ message: "Business profile fetched successfully", data });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
