import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { ShippingService } from "../../services/admin/Shipping.Service";

const shippingService = new ShippingService();

export const getZones = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const zones = await shippingService.getZones(req.query);
    return res
      .status(200)
      .json({ message: "Zones fetched successfully", data: zones });
  } catch (error: any) {
    next(error);
  }
};
