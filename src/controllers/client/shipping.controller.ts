import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { ShippingService } from "../../services/client/Shipping.Service";
import AppError from "../../utilities/ErrorHandler";

const shippingService = new ShippingService();

export const getBusinessZones = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  const { state, shippingType, businessId: queryBusinessId } = req.query as {
    state?: string;
    shippingType?: string;
    businessId?: string;
  };
  const businessId = req.businessId || queryBusinessId;
  try {
    if (!businessId) {
      throw new AppError(400, "Business ID is required");
    }
    const result = await shippingService.getBusinessZones(businessId!, { state, shippingType });
    return res
      .status(200)
      .json({ message: "Shipping zones fetched successfully", data: result });
  } catch (error: any) {
    next(error);
  }
};

export const getAvailableRideTypes = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.businessId) {
      throw new AppError(400, "Business ID is required");
    }
    const result = await shippingService.getAvailableRideTypes(req.businessId!);
    return res
      .status(200)
      .json({ success: true, data: result });
  } catch (error: any) {
    next(error);
  }
};

export const calculateShippingFee = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.businessId) {
      throw new AppError(400, "Business ID is required");
    }
    const fee = await shippingService.calculateFee(req.businessId!, req.body);
    return res
      .status(200)
      .json({ success: true, data: { fee } });
  } catch (error: any) {
    next(error);
  }
};
