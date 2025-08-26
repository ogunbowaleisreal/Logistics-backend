import { ExtendedRequest } from "../../utilities/Interfaces";
import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import logger from "../../../logger";
import { ColorService } from "../../services/admin/Color.Service";

const colorService = new ColorService();
export const createColor = async (req: ExtendedRequest, res: Response) => {
  const payload = req.body;
  try {
    const color = await colorService.createColor(payload);
    return res
      .status(201)
      .json({ message: "Color created successfully", data: color });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getColors = async (req: ExtendedRequest, res: Response) => {
  const filter = req.query as {
    search?: string;
    status?: string;
    page: string;
    limit: string;
  };
  try {
    const colors = await colorService.getColors(filter);
    return res
      .status(200)
      .json({ message: "Colors fetched successfully", data: colors });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateColor = async (req: ExtendedRequest, res: Response) => {
  const payload = req.body;
  try {
    const color = await colorService.updateColor(payload);
    return res
      .status(200)
      .json({ message: "Color updated successfully", data: color });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteColor = async (req: ExtendedRequest, res: Response) => {
  const { colorID } = req.query as { colorID: string };
  try {
    await colorService.deleteColor(colorID);
    return res.status(200).json({ message: "Color deleted successfully" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
