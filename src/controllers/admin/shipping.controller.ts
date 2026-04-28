import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { ShippingService } from "../../services/admin/Shipping.Service";

const shippingService = new ShippingService();

export const createZone = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const zone = await shippingService.createZone(req.body);
    return res
      .status(201)
      .json({ message: "Zone created successfully", data: zone });
  } catch (error: any) {
    next(error);
  }
};

export const getZones = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const zones = await shippingService.getZones();
    return res
      .status(200)
      .json({ message: "Zones fetched successfully", data: zones });
  } catch (error: any) {
    next(error);
  }
};

export const updateZone = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const zone = await shippingService.updateZone(req.params.zoneId, req.body);
    return res
      .status(200)
      .json({ message: "Zone updated successfully", data: zone });
  } catch (error: any) {
    next(error);
  }
};

export const deleteZone = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const zone = await shippingService.deleteZone(req.params.zoneId);
    return res
      .status(200)
      .json({ message: "Zone deleted successfully", data: zone });
  } catch (error: any) {
    next(error);
  }
};
