import { Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { ExtendedRequest } from "../../utilities/Interfaces";
import {
  DashboardFilter,
  DashboardService,
} from "../../services/business/Dashboard.Service";

const dashboardService = new DashboardService();

const VALID_FILTERS: DashboardFilter[] = ["today", "week", "month"];

export const getDashboardStats = async (
  req: ExtendedRequest,
  res: Response,
): Promise<Response> => {
  try {
    const businessId =
      (req as any).staff?.businessId ?? (req as any).business?.businessId;

    const rawFilter = (req.query.filter as string) ?? "today";
    if (!VALID_FILTERS.includes(rawFilter as DashboardFilter)) {
      return res.status(400).json({
        message: `Invalid filter. Must be one of: ${VALID_FILTERS.join(", ")}`,
      });
    }

    const stats = await dashboardService.getStats(
      businessId,
      rawFilter as DashboardFilter,
    );

    return res
      .status(200)
      .json({ message: "Dashboard stats fetched successfully", data: stats });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};
