import { Request, Response } from "express";
import { KYCService } from "../../services/business/KYC.Service";
import AppError from "../../utilities/ErrorHandler";

const kycService = new KYCService();

export const getKyc = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const kyc = await kycService.getKyc(req.business.businessId);
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

export const submitRegistration = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const kyc = await kycService.submitRegistration(
      req.business.businessId,
      req.body,
    );
    return res.status(200).json({
      message: "Registration details submitted successfully",
      data: kyc,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

export const submitIdentification = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const kyc = await kycService.submitIdentification(
      req.business.businessId,
      req.body,
    );
    return res
      .status(200)
      .json({ message: "Identification submitted successfully", data: kyc });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

export const submitCac = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const kyc = await kycService.submitCac(req.business.businessId, req.body);
    return res
      .status(200)
      .json({ message: "CAC submitted successfully", data: kyc });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

export const submitBvn = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const kyc = await kycService.submitBvn(req.business.businessId, req.body);
    return res
      .status(200)
      .json({ message: "BVN submitted successfully", data: kyc });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

// export const verifyBVN = async (
//   req: Request | any,
//   res: Response,
// ): Promise<Response> => {
//   try {
//     const kyc = await kycService.verifyBVN(req.business.businessId, req.body);
//     const status = kyc.status == "verified" ? "is successful" : "rejected";
//     return res
//       .status(200)
//       .json({ message: `BVN verification ${status}`, data: kyc });
//   } catch (error: any) {
//     if (error instanceof AppError) {
//       return res.status(error.statusCode).json({ message: error.message });
//     }
//     return res.status(500).json({ message: error.message });
//   }
// };
