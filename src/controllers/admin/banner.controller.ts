import { Request, Response } from "express";
import { BannerService } from "../../services/admin/Banner.Service";
import AppError from "../../utilities/ErrorHandler";
import logger from "../../../logger";

const bannerService = new BannerService();

export const createBanner = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const banner = await bannerService.createBanner(payload);
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
  try {
    const banner = await bannerService.getBanners(filter);
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
  try {
    const banner = await bannerService.updateBanner(payload);
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
  try {
    const banner = await bannerService.setDefaultBanner(bannerID);
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
  try {
    const banner = await bannerService.deleteBanner(bannerID);
    return res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
