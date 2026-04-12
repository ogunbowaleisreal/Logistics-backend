import { Request, Response } from "express";
import { BannerService } from "../../services/admin/Banner.Service";
import AppError from "../../utilities/ErrorHandler";
import logger from "../../../logger";

const bannerService = new BannerService();

export const createBanner = async (req: Request, res: Response) => {
  const payload = req.body;
  const businessId =
    (req as any).business?.businessId ??
    (req as any).staff?.businessId ??
    (req as any).query.businessId ??
    (req as any).body?.businessId;
  try {
    const banner = await bannerService.createBanner(businessId, payload);
    return res
      .status(201)
      .json({ message: "Banner created successfully", data: banner });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getBanners = async (req: Request, res: Response) => {
  const filter = req.query;
  const businessId =
    (req as any).business?.businessId ??
    (req as any).staff?.businessId ??
    (req as any).query.businessId ??
    (req as any).body?.businessId;
  try {
    const banner = await bannerService.getBanners(businessId, filter);
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

export const updateBanner = async (req: Request, res: Response) => {
  const payload = req.body;
  const businessId =
    (req as any).business?.businessId ??
    (req as any).staff?.businessId ??
    (req as any).query.businessId ??
    (req as any).body?.businessId;
  try {
    const banner = await bannerService.updateBanner(businessId, payload);
    return res
      .status(200)
      .json({ message: "Banner updated successfully", data: banner });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const setDefaultBanner = async (req: Request, res: Response) => {
  const { bannerID } = req.body as { bannerID: string };
  const businessId =
    (req as any).business?.businessId ??
    (req as any).staff?.businessId ??
    (req as any).query.businessId ??
    (req as any).body?.businessId;
  try {
    const banner = await bannerService.setDefaultBanner(businessId, bannerID);
    return res
      .status(200)
      .json({ message: "Banner set as default successfully" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (req: Request, res: Response) => {
  const { bannerID } = req.query as { bannerID: string };
  const businessId =
    (req as any).business?.businessId ??
    (req as any).staff?.businessId ??
    (req as any).query.businessId ??
    (req as any).body?.businessId;
  try {
    const banner = await bannerService.deleteBanner(businessId, bannerID);
    return res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
