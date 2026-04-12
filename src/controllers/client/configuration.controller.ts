import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { ConfigurationService } from "../../services/client/Configuration.Service";

const configurationService = new ConfigurationService();

export const getConfiguration = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const configuration = await configurationService.getConfiguration(
      req.businessId!,
    );
    return res.status(200).json({
      message: "Configuration fetched successfully",
      data: configuration,
    });
  } catch (error: any) {
    next(error);
  }
};
