import { Request, Response } from "express";
import { ThemeService } from "../../services/admin/Theme.Service";
import AppError from "../../utilities/ErrorHandler";
import logger from "../../../logger";

const themeService = new ThemeService();

export const createTheme = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const theme = await themeService.createTheme(payload);
    return res
      .status(201)
      .json({ message: "Theme created successfully", data: theme });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getThemes = async (req: Request, res: Response) => {
  const filter = req.query;
  try {
    const themes = await themeService.getThemes(filter);
    return res
      .status(200)
      .json({ message: "Theme fetched successfully", data: themes });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateTheme = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const theme = await themeService.updateTheme(payload);
    return res
      .status(200)
      .json({ message: "Theme updated successfully", data: theme });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteTheme = async (req: Request, res: Response) => {
  const { themeID } = req.query as { themeID: string };
  try {
    await themeService.deleteTheme(themeID);
    return res.status(200).json({ message: "Theme deleted successfully" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
