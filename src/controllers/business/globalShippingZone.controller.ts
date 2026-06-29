import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { GlobalShippingZoneService } from "../../services/admin/GlobalShippingZone.Service";
import { ShippingService } from "../../services/business/Shipping.Services";

const globalShippingZoneService = new GlobalShippingZoneService();
const shippingService = new ShippingService();

const getBusinessId = (req: any): string =>
  req.business?.businessId ?? req.staff?.businessId;

export const getGlobalZones = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { shippingType } = req.query as { shippingType?: string };
    const zones = await globalShippingZoneService.getZones({ shippingType });
    return res.status(200).json({
      message: "Global shipping zones fetched successfully",
      data: zones,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getGlobalZone = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { templateId } = req.params;
    const zone = await globalShippingZoneService.getZone(templateId);
    return res.status(200).json({
      message: "Global shipping zone fetched successfully",
      data: zone,
    });
  } catch (error: any) {
    next(error);
  }
};

export const cloneFromGlobalTemplate = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { templateId } = req.params;
    const zone = await shippingService.cloneFromTemplate(getBusinessId(req), templateId);
    return res.status(201).json({
      message: "Global zone cloned into your shipping zones successfully",
      data: zone,
    });
  } catch (error: any) {
    next(error);
  }
};
