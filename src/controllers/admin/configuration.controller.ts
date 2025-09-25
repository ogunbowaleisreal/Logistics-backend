import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { ConfigurationService } from "../../services/admin/Configuration.Service";

const configurationService = new ConfigurationService();

export const getConfiguration = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const configuration = await configurationService.getConfiguration();
    return res.status(200).json({
      message: "Configuration fetched successfully",
      data: configuration,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateConfiguration = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;
  try {
    const configuration = await configurationService.updateConfiguration(
      payload
    );
    return res.status(200).json({
      message: "Configuration updated successfully",
      data: configuration,
    });
  } catch (error: any) {
    next(error);
  }
};
