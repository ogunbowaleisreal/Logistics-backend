import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { ConfigurationService } from "../../services/admin/Configuration.Service";

const configurationService = new ConfigurationService();

export const getConfiguration = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const configuration =
      await configurationService.getConfiguration(businessId);
    return res
      .status(200)
      .json({
        message: "Configuration fetched successfully",
        data: configuration,
      });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const updateConfiguration = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const configuration = await configurationService.updateConfiguration(
      businessId,
      req.body,
    );
    return res
      .status(200)
      .json({
        message: "Configuration updated successfully",
        data: configuration,
      });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
