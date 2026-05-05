import { Request, Response } from "express";
import { RiderAuthenticationService } from "../../services/rider/Authentication.Service";
import AppError from "../../utilities/ErrorHandler";

const riderAuthenticationService = new RiderAuthenticationService();

export const requestOTP = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { phone, businessSlug } = req.body;

  try {
    await riderAuthenticationService.requestOTP(phone, businessSlug);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

export const verifyOTP = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { phone, businessSlug, otp } = req.body;

  try {
    const data = await riderAuthenticationService.verifyOTP(
      phone,
      businessSlug,
      otp,
    );

    return res.status(200).json({
      message: "Login successful",
      data,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};
