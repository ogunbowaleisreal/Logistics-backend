import { Request, Response } from "express";
import { KYCService } from "../../services/admin/KYC.Service";
import AppError from "../../utilities/ErrorHandler";

const kycService = new KYCService();

export const listKyc = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const result = await kycService.listKyc(req.query);
    return res
      .status(200)
      .json({ message: "KYC records fetched successfully", data: result });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

export const getKyc = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const kyc = await kycService.getKyc(req.params.businessId);
    return res
      .status(200)
      .json({ message: "KYC fetched successfully", data: kyc });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

export const updateIdentificationStatus = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const kyc = await kycService.updateIdentificationStatus(
      req.params.businessId,
      req.body,
    );
    return res.status(200).json({
      message: "Identification status updated successfully",
      data: kyc,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

export const updateCacStatus = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const kyc = await kycService.updateCacStatus(
      req.params.businessId,
      req.body,
    );
    return res.status(200).json({
      message: "CAC status updated successfully",
      data: kyc,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};
