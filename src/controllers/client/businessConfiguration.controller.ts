import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { BusinessConfigurationService } from "../../services/client/BusinessConfiguration.Service";
import AppError from "../../utilities/ErrorHandler";

const businessConfigurationService = new BusinessConfigurationService();

export const getConfiguration = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  const { businessId: queryBusinessId } = req.query as { businessId?: string };
  const businessId = req.businessId || queryBusinessId;
  if (!businessId) {
    return res.status(400).json({ message: "Business ID is required" });
  }
  try {
    const configuration =
      await businessConfigurationService.getConfiguration(businessId);
    return res.status(200).json({
      message: "Configuration fetched successfully",
      data: configuration,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getBusinessTheme = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  const { businessId: queryBusinessId } = req.query as { businessId?: string };
  const businessId = req.businessId || queryBusinessId;
  if (!businessId) {
    return res.status(400).json({ message: "Business ID is required" });
  }
  try {
    const theme =
      await businessConfigurationService.getBusinessTheme(businessId);
    return res
      .status(200)
      .json({ message: "Theme fetched successfully", data: theme });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
