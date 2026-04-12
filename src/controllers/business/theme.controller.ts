import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { ThemeService } from "../../services/admin/Theme.Service";

const themeService = new ThemeService();

export const createTheme = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const theme = await themeService.createTheme(businessId, req.body);
    return res
      .status(201)
      .json({ message: "Theme created successfully", data: theme });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const getThemes = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const themes = await themeService.getThemes(businessId, req.query);
    return res
      .status(200)
      .json({ message: "Theme fetched successfully", data: themes });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const updateTheme = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const theme = await themeService.updateTheme(businessId, req.body);
    return res
      .status(200)
      .json({ message: "Theme updated successfully", data: theme });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const deleteTheme = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  const { themeID } = req.query as { themeID: string };
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    await themeService.deleteTheme(businessId, themeID);
    return res.status(200).json({ message: "Theme deleted successfully" });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
