import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { StaffAuthenticationService } from "../../services/business/StaffAuthentication.Service";
import { AuthenticationTokenGenerator } from "../../services/Unique.Service";
import { CacheService } from "../../services/Cache.Service";
import { EmailService } from "../../services/Email.Service";
import { Hasher } from "../../utilities/Hasher";

const staffAuthService = new StaffAuthenticationService(
  new AuthenticationTokenGenerator(),
  new CacheService(),
  new EmailService(),
  new Hasher()
);

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await staffAuthService.login(req.body);
    if (result.twoFactorAuthentication) {
      return res.status(200).json({ message: "OTP sent successfully", data: { twoFactorAuthentication: true } });
    }
    return res.status(200).json({ message: "Login successful", data: result });
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const verifyLoginOTP = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await staffAuthService.verifyLoginOTP(req.body);
    return res.status(200).json({ message: "Login successful", data: result });
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    await staffAuthService.forgotPassword(req.body);
    return res.status(200).json({ message: "Password reset OTP sent" });
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    await staffAuthService.resetPassword(req.body);
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const generateNewAccessToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = await staffAuthService.getAccessToken(req.query);
    return res.status(200).json({ message: "New access token generated successfully", data: token });
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<Response> => {
  const { refreshToken } = req.query as { refreshToken: string };
  try {
    await staffAuthService.logout(refreshToken);
    return res.status(200).json({ message: "Logout successful" });
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
