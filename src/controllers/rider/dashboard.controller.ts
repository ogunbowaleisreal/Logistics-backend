import { Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { DashboardService } from "../../services/rider/Dashboard.Service";

const dashboardService = new DashboardService();

export const getStats = async (
  req: ExtendedRequest,
  res: Response,
): Promise<Response> => {
  try {
    const stats = await dashboardService.getStats(req.rider!.riderId);
    return res
      .status(200)
      .json({ message: "Stats fetched successfully", data: stats });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};
