import { Request, Response } from "express";
import { BusinessAuthenticationService } from "../../services/business/Authentication.Service";
import { CacheService } from "../../services/Cache.Service";
import { EmailService } from "../../services/Email.Service";
import { AuthenticationTokenGenerator } from "../../services/Unique.Service";
import AppError from "../../utilities/ErrorHandler";
import { Hasher } from "../../utilities/Hasher";

const hasher = new Hasher();
const cacheService = new CacheService();
const authenticationTokenGenerator = new AuthenticationTokenGenerator();
const emailService = new EmailService();

const businessAuthService = new BusinessAuthenticationService(
  authenticationTokenGenerator,
  cacheService,
  emailService,
  hasher
);

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const business = await businessAuthService.register(req.body);
    return res.status(201).json({
      message: "Business registered successfully. Please verify your email.",
      data: business,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const response = await businessAuthService.verifyEmail(req.body);
    return res.status(200).json({
      message: "Email verified successfully",
      data: response,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await businessAuthService.login(req.body);
    if (result.twoFactorAuthentication) {
      return res.status(200).json({
        message: "OTP sent successfully",
        data: { twoFactorAuthentication: true },
      });
    }
    return res.status(200).json({
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const sendLogin2FAVerification = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email } = req.query as { email: string };
  try {
    await businessAuthService.sendLogin2FAVerification(email);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const verifyLoginOTP = async (req: Request, res: Response): Promise<Response> => {
  try {
    const response = await businessAuthService.verifyLoginOTP(req.body);
    return res.status(200).json({ message: "Login successful", data: response });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    await businessAuthService.forgotPassword(req.body);
    return res.status(200).json({ message: "Password reset OTP sent" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    await businessAuthService.resetPassword(req.body);
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const generateNewAccessToken = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const token = await businessAuthService.getAccessToken(req.query);
    return res.status(200).json({
      message: "New access token generated successfully",
      data: token,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<Response> => {
  const { refreshToken } = req.query as { refreshToken: string };
  try {
    await businessAuthService.logout(refreshToken);
    return res.status(200).json({ message: "Logout successful" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const checkUsernameAvailability = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await businessAuthService.checkUsernameAvailability(req.query.username as string);
    return res.status(200).json({ message: "Username availability checked", data: result });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};
