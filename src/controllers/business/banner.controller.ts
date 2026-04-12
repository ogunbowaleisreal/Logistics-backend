import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { BannerService } from "../../services/admin/Banner.Service";

const bannerService = new BannerService();

export const createBanner = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const banner = await bannerService.createBanner(businessId, req.body);
    return res
      .status(201)
      .json({ message: "Banner created successfully", data: banner });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const getBanners = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const banners = await bannerService.getBanners(businessId, req.query);
    return res
      .status(200)
      .json({ message: "Banner fetched successfully", data: banners });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const updateBanner = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const banner = await bannerService.updateBanner(businessId, req.body);
    return res
      .status(200)
      .json({ message: "Banner updated successfully", data: banner });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const setDefaultBanner = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  const { bannerID } = req.body as { bannerID: string };
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const banner = await bannerService.setDefaultBanner(businessId, bannerID);
    return res
      .status(200)
      .json({ message: "Banner set as default successfully", data: banner });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  const { bannerID } = req.query as { bannerID: string };
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    await bannerService.deleteBanner(businessId, bannerID);
    return res.status(200).json({ message: "Banner deleted successfully" });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
