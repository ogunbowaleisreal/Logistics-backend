import { Response } from "express";
import logger from "../../../logger";
import AppError from "../../utilities/ErrorHandler";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { ConfigurtionService } from "../../services/admin/Configuration.Service";

const configurationService = new ConfigurtionService();

export const getConfiguration = async (req: ExtendedRequest, res: Response) => {
  try {
    const configuration = await configurationService.getConfiguration();
    return res
      .status(200)
      .json({ message: "Colors fetched successfully", data: configuration });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateConfiguration = async (
  req: ExtendedRequest,
  res: Response
) => {
  const payload = req.body;
  try {
    const configuration = await configurationService.updateConfiguration(
      payload
    );
    return res
      .status(200)
      .json({
        message: "Configuration updated successfully",
        data: configuration,
      });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
