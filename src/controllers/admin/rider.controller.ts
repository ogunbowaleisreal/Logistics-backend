import { NextFunction, Response } from "express";
import { RiderService } from "../../services/admin/Rider.Service";
import { ExtendedRequest } from "../../utilities/Interfaces";

const riderService = new RiderService();

export const getRiders = async (
  req: ExtendedRequest | any,
  res: Response,
  next: NextFunction,
) => {
  const { businessId, ...rest } = req.query;
  const filter = { ...rest, businessId: businessId as string | undefined };
  try {
    const riders = await riderService.getRiders(filter);
    return res
      .status(200)
      .json({ message: "Riders fetched successfully", data: riders });
  } catch (error: any) {
    next(error);
  }
};
