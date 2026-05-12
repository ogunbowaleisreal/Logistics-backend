import { Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { PrivacyPolicyService } from "../../services/client/PrivacyPolicy.Service";
import { ExtendedRequest } from "../../utilities/Interfaces";
import logger from "../../../logger";

const privacyPolicyService = new PrivacyPolicyService();

export const getPrivacyPolicy = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    const policy = await privacyPolicyService.getPrivacyPolicy(req.businessId!);
    return res
      .status(200)
      .json({ message: "Privacy policy fetched successfully", data: policy });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
