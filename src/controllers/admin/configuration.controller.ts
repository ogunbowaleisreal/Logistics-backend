import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { ConfigurationService } from "../../services/admin/Configuration.Service";
import { PaymentGateway } from "../../models/Configuration.Model";

const configurationService = new ConfigurationService();

export const getConfiguration = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
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
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  const payload = req.body;
  try {
    const configuration =
      await configurationService.updateConfiguration(payload);
    return res.status(200).json({
      message: "Configuration updated successfully",
      data: configuration,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getPaymentMethods = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const configuration = await configurationService.getConfiguration();
    return res.status(200).json({
      message: "Payment methods fetched successfully",
      data: configuration.paymentMethods,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updatePaymentMethod = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  const { gateway } = req.params as { gateway: PaymentGateway };
  const { isEnabled } = req.body as { isEnabled: boolean };
  try {
    const paymentMethods = await configurationService.updatePaymentMethod(gateway, isEnabled);
    return res.status(200).json({
      message: "Payment method updated successfully",
      data: paymentMethods,
    });
  } catch (error: any) {
    next(error);
  }
};
