import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { ShippingService } from "../../services/business/Shipping.Services";

const shippingService = new ShippingService();

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

export const upsertRates = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  const businessId = req.business?.businessId ?? req.staff?.businessId;
  try {
    const rates = await shippingService.upsertRates(businessId, req.body);
    return res
      .status(200)
      .json({ message: "Shipping rates saved successfully", data: rates });
  } catch (error: any) {
    next(error);
  }
};

export const getRates = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  const businessId = req.business?.businessId ?? req.staff?.businessId;
  try {
    const rates = await shippingService.getRates(businessId, req.query);
    return res
      .status(200)
      .json({ message: "Shipping rates fetched successfully", data: rates });
  } catch (error: any) {
    next(error);
  }
};

export const updateRate = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  const businessId = req.business?.businessId ?? req.staff?.businessId;
  try {
    const rate = await shippingService.updateRate(
      businessId,
      req.params.rateId,
      req.body,
    );
    return res
      .status(200)
      .json({ message: "Shipping rate updated successfully", data: rate });
  } catch (error: any) {
    next(error);
  }
};

export const deleteRate = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  const businessId = req.business?.businessId ?? req.staff?.businessId;
  try {
    const rate = await shippingService.deleteRate(businessId, req.params.rateId);
    return res
      .status(200)
      .json({ message: "Shipping rate deleted successfully", data: rate });
  } catch (error: any) {
    next(error);
  }
};
