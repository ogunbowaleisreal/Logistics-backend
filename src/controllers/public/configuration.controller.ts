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

export const getPaymentMethods = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const configuration = await configurationService.getConfiguration();
    const enabled = configuration.paymentMethods.filter((m) => m.isEnabled);
    return res.status(200).json({
      message: "Payment methods fetched successfully",
      data: enabled,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getServiceFeeTiers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const configuration = await configurationService.getConfiguration();
    return res.status(200).json({
      message: "Service fee tiers fetched successfully",
      data: configuration.serviceFee.tiers,
    });
  } catch (error: any) {
    next(error);
  }
};
