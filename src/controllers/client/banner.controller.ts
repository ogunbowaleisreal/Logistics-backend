import { Request, Response } from "express";
import { BannerService } from "../../services/client/Banner.Service";
import logger from "../../../logger";
import AppError from "../../utilities/ErrorHandler";

const bannerService = new BannerService();
export const getDefaultBanners = async (req: Request, res: Response) => {
  const { limit } = req.query as { limit: string };
  try {
    const banner = await bannerService.getDefaultBanners({ limit });
    return res
      .status(200)
      .json({ message: "Banner fetched successfully", data: banner });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
