import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { RiderService } from "../../services/admin/Rider.Service";

const riderService = new RiderService();

export const createRider = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const rider = await riderService.createRider(businessId, req.body);
    return res
      .status(201)
      .json({ message: "Rider created successfully", data: rider });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const getRiders = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const riders = await riderService.getRiders(businessId, req.query);
    return res
      .status(200)
      .json({ message: "Rider fetched successfully", data: riders });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const updateRider = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const rider = await riderService.updateRider(businessId, req.body);
    return res
      .status(200)
      .json({ message: "Rider updated successfully", data: rider });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const deleteRider = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  const { riderID } = req.query as { riderID: string };
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    await riderService.deleteRider(businessId, riderID);
    return res.status(200).json({ message: "Rider deleted successfully" });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
