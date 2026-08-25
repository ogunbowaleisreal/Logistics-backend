import { NextFunction, Response } from "express";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { GlobalShippingZoneService } from "../../services/admin/GlobalShippingZone.Service";

const globalShippingZoneService = new GlobalShippingZoneService();

export const createGlobalZone = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const zone = await globalShippingZoneService.createZone(req.body);
    return res.status(201).json({
      message: "Global shipping zone created successfully",
      data: zone,
    });
  } catch (error: any) {
    next(error);
  }
};

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
    const { id } = req.params;
    const zone = await globalShippingZoneService.getZone(id);
    return res.status(200).json({
      message: "Global shipping zone fetched successfully",
      data: zone,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateGlobalZone = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const zone = await globalShippingZoneService.updateZone(id, req.body);
    return res.status(200).json({
      message: "Global shipping zone updated successfully",
      data: zone,
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteGlobalZone = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    await globalShippingZoneService.deleteZone(id);
    return res.status(200).json({
      message: "Global shipping zone deleted successfully",
    });
  } catch (error: any) {
    next(error);
  }
};

export const bulkUpsertGlobalWeightBrackets = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const brackets = await globalShippingZoneService.bulkUpsertWeightBrackets(
      id,
      req.body.brackets,
    );
    return res.status(200).json({
      message: "Global weight brackets updated successfully",
      data: brackets,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getGlobalWeightBrackets = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const brackets = await globalShippingZoneService.getWeightBrackets(id);
    return res.status(200).json({
      message: "Global weight brackets fetched successfully",
      data: brackets,
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateGlobalWeightBracket = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, bracketId } = req.params;
    const brackets = await globalShippingZoneService.updateWeightBracket(
      id,
      bracketId,
      req.body,
    );
    return res.status(200).json({
      message: "Global weight bracket updated successfully",
      data: brackets,
    });
  } catch (error: any) {
    next(error);
  }
};

export const deleteGlobalWeightBracket = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id, bracketId } = req.params;
    const brackets = await globalShippingZoneService.deleteWeightBracket(
      id,
      bracketId,
    );
    return res.status(200).json({
      message: "Global weight bracket deleted successfully",
      data: brackets,
    });
  } catch (error: any) {
    next(error);
  }
};
