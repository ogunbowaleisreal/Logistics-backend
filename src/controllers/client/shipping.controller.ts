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
  const { state, businessId: queryBusinessId } = req.query as {
    state?: string;
    businessId?: string;
  };
  const businessId = req.businessId || queryBusinessId;
  try {
    if (!businessId) {
      throw new AppError(400, "Business ID is required");
    }
    const zones = await shippingService.getBusinessZones(businessId!, state);
    return res
      .status(200)
      .json({ message: "Shipping zones fetched successfully", data: zones });
  } catch (error: any) {
    next(error);
  }
};
