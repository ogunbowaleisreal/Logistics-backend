import { Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { TermsAndConditionsService } from "../../services/client/TermsAndConditions.Service";
import { ExtendedRequest } from "../../utilities/Interfaces";
import logger from "../../../logger";

const termsAndConditionsService = new TermsAndConditionsService();

export const getTermsAndConditions = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    const termsAndConditions =
      await termsAndConditionsService.getTermsAndConditions(req.businessId!);
    return res
      .status(200)
      .json({
        message: "Terms and conditions fetched successfully",
        data: termsAndConditions,
      });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
