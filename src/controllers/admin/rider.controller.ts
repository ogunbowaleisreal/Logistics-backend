import { NextFunction, Request, Response } from "express";
import { RiderService } from "../../services/admin/Rider.Service";
import AppError from "../../utilities/ErrorHandler";
import { ExtendedRequest } from "../../utilities/Interfaces";
import logger from "../../../logger";

const riderService = new RiderService();

export const createRider = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;
  try {
    const rider = await riderService.createRider(payload);
    return res
      .status(201)
      .json({ message: "Rider created successfully", data: rider });
  } catch (error: any) {
    next(error);
  }
};

export const getRiders = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const filter = req.query;
  try {
    const rider = await riderService.getRiders(filter);
    return res
      .status(200)
      .json({ message: "Rider fetched successfully", data: rider });
  } catch (error: any) {
    next(error);
  }
};

export const updateRider = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;
  try {
    const rider = await riderService.updateRider(payload);
    return res
      .status(200)
      .json({ message: "Rider updated successfully", data: rider });
  } catch (error: any) {
    next(error);
  }
};

export const deleteRider = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  const { riderID } = req.query as { riderID: string };
  try {
    const rider = await riderService.deleteRider(riderID);
    return res
      .status(200)
      .json({ message: "Rider deleted successfully", data: rider });
  } catch (error: any) {
    next(error);
  }
};
