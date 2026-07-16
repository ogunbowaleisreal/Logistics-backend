import { NextFunction, Request, Response } from "express";
import { RiderService } from "../../services/business/Rider.Service";
import AppError from "../../utilities/ErrorHandler";
import { ExtendedRequest } from "../../utilities/Interfaces";
import logger from "../../../logger";
import { RiderAssignmentService } from "../../services/RiderAssignment.Service";

const riderService = new RiderService();
const riderAssignmentService = new RiderAssignmentService()

export const createRider = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  const payload = req.body;
  const businessId =
    req.business?.businessId ??
    req.staff?.businessId ??
    req.query.businessId ??
    req.body?.businessId;
  try {
    const rider = await riderService.createRider(businessId, payload);
    return res
      .status(201)
      .json({ message: "Rider created successfully", data: rider });
  } catch (error: any) {
    next(error);
  }
};

export const getRiders = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  const filter = req.query;
  const businessId =
    req.business?.businessId ??
    req.staff?.businessId ??
    req.query.businessId ??
    req.body?.businessId;
  try {
    const rider = await riderService.getRiders(businessId, filter);
    return res
      .status(200)
      .json({ message: "Rider fetched successfully", data: rider });
  } catch (error: any) {
    next(error);
  }
};

export const updateRider = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  const payload = req.body;
  const businessId =
    req.business?.businessId ??
    req.staff?.businessId ??
    req.query.businessId ??
    req.body?.businessId;
  try {
    const rider = await riderService.updateRider(businessId, payload);
    return res
      .status(200)
      .json({ message: "Rider updated successfully", data: rider });
  } catch (error: any) {
    next(error);
  }
};

export const setAutoAssignRider = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  const { riderID } = req.body;
  const businessId =
    req.business?.businessId ??
    req.staff?.businessId ??
    req.query.businessId ??
    req.body?.businessId;
  try {
    if (!riderID) {
      throw new AppError(400, "riderID is required");
    }
    await riderAssignmentService.setAutoAssignRider(businessId, riderID);
    return res
      .status(200)
      .json({ message: "Auto-assign rider set successfully" });
  } catch (error: any) {
    next(error);
  }
};

export const deleteRider = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  const { riderID } = req.query as { riderID: string };
  const businessId =
    req.business?.businessId ??
    req.staff?.businessId ??
    req.query.businessId ??
    req.body?.businessId;
  try {
    const rider = await riderService.deleteRider(businessId, riderID);
    return res
      .status(200)
      .json({ message: "Rider deleted successfully", data: rider });
  } catch (error: any) {
    next(error);
  }
};
