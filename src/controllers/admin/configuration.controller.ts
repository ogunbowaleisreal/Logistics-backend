import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { ConfigurationService } from "../../services/admin/Configuration.Service";

const configurationService = new ConfigurationService();

export const getConfiguration = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  const businessId =
    req.business?.businessId ??
    req.staff?.businessId ??
    req.query.businessId ??
    req.body?.businessId;
  try {
    const configuration =
      await configurationService.getConfiguration(businessId);
    return res.status(200).json({
      message: "Configuration fetched successfully",
      data: configuration,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateConfiguration = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  const payload = req.body;
  const businessId =
    req.business?.businessId ??
    req.staff?.businessId ??
    req.query.businessId ??
    req.body?.businessId;
  try {
    const configuration = await configurationService.updateConfiguration(
      businessId,
      payload,
    );
    return res.status(200).json({
      message: "Configuration updated successfully",
      data: configuration,
    });
  } catch (error: any) {
    next(error);
  }
};
