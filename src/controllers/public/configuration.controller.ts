import { NextFunction, Request, Response } from "express";
import { ConfigurationService } from "../../services/admin/Configuration.Service";

const configurationService = new ConfigurationService();

export const getContactInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const configuration = await configurationService.getConfiguration();
    return res.status(200).json({
      message: "Contact information fetched successfully",
      data: configuration.contactInfo,
    });
  } catch (error: any) {
    next(error);
  }
};
