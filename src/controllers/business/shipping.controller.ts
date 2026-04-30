import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { ShippingService } from "../../services/business/Shipping.Services";

const shippingService = new ShippingService();

const getBusinessId = (req: any): string =>
  req.business?.businessId ?? req.staff?.businessId;

export const createZone = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const zone = await shippingService.createZone(getBusinessId(req), req.body);
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
    const zones = await shippingService.getZones(getBusinessId(req));
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
    const zone = await shippingService.updateZone(
      getBusinessId(req),
      req.params.zoneId,
      req.body,
    );
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
    const zone = await shippingService.deleteZone(
      getBusinessId(req),
      req.params.zoneId,
    );
    return res
      .status(200)
      .json({ message: "Zone deleted successfully", data: zone });
  } catch (error: any) {
    next(error);
  }
};

// Weight-based rate controllers removed — shipping fee is now a flat amount per zone.
// export const upsertRates = async (
//   req: ExtendedRequest | any,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const rates = await shippingService.upsertRates(getBusinessId(req), req.body);
//     return res
//       .status(200)
//       .json({ message: "Shipping rates saved successfully", data: rates });
//   } catch (error: any) {
//     next(error);
//   }
// };

// export const getRates = async (
//   req: ExtendedRequest | any,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const rates = await shippingService.getRates(getBusinessId(req), req.query);
//     return res
//       .status(200)
//       .json({ message: "Shipping rates fetched successfully", data: rates });
//   } catch (error: any) {
//     next(error);
//   }
// };

// export const updateRate = async (
//   req: ExtendedRequest | any,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const rate = await shippingService.updateRate(
//       getBusinessId(req),
//       req.params.rateId,
//       req.body,
//     );
//     return res
//       .status(200)
//       .json({ message: "Shipping rate updated successfully", data: rate });
//   } catch (error: any) {
//     next(error);
//   }
// };

// export const deleteRate = async (
//   req: ExtendedRequest | any,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const rate = await shippingService.deleteRate(
//       getBusinessId(req),
//       req.params.rateId,
//     );
//     return res
//       .status(200)
//       .json({ message: "Shipping rate deleted successfully", data: rate });
//   } catch (error: any) {
//     next(error);
//   }
// };
