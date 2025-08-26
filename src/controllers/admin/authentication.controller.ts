import { Request, Response } from "express";
import { AdminAuthenticationService } from "../../services/admin/Authentication.Service";
import { RoleServices } from "../../services/admin/Role.Service";
import { CacheService } from "../../services/Cache.Service";
import { EmailService } from "../../services/Email.Service";
import { AuthenticationTokenGenerator } from "../../services/Unique.Service";
import AppError from "../../utilities/ErrorHandler";
import { Hasher } from "../../utilities/Hasher";
import { PasswordGeneratorService } from "./../../services/Unique.Service";

const roleService = new RoleServices();
const hasher = new Hasher();
const cacheService = new CacheService();
const authenticationTokenGenerator = new AuthenticationTokenGenerator();
const emailService = new EmailService();
const passwordGenerator = new PasswordGeneratorService();

const adminAuthService = new AdminAuthenticationService(
  roleService,
  authenticationTokenGenerator,
  passwordGenerator,
  cacheService,
  emailService,
  hasher
);

export const createSuperAdmin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const admin = await adminAuthService.createSuperAdmin();
    return res
      .status(201)
      .json({ message: "Super admin created", data: admin });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const createAdmin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = req.body;
    const admin = await adminAuthService.createAdmin(payload);
    return res.status(201).json({ message: "Login successfully", data: admin });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const payload = req.body;
    const { admin, accessToken, refreshToken, twoFactorAuthentication } =
      await adminAuthService.login(payload);

    if (twoFactorAuthentication) {
      return res.status(200).json({
        message: "OTP sent successfully",
        data: { twoFactorAuthentication },
      });
    } else {
      return res.status(200).json({
        message: "Login successfully",
        data: { admin, accessToken, refreshToken },
      });
    }
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const verifyLoginVerificationOTP = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const payload = req.body;
  try {
    const response = await adminAuthService.verifyLoginVerificationOTP(payload);
    return res
      .status(200)
      .json({ message: "Login successful", data: response });
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
): Promise<Response | void> => {
  const { email } = req.query as { email: string };
  try {
    await adminAuthService.sendLogin2FAVerification(email!);
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const response = await adminAuthService.forgotPassword(payload);
    return res
      .status(200)
      .json({ message: "Forgot password email sent", data: response });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const response = await adminAuthService.resetPassword(payload);
    return res
      .status(200)
      .json({ message: "Password reset successfully", data: response });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const generateNewAccessToken = async (req: Request, res: Response) => {
  const filter = req.query;
  try {
    const token = await adminAuthService.getAccessToken(filter);
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

export const logout = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { refreshToken } = req.query as { refreshToken: string };
  try {
    const response = await adminAuthService.logoutAccount(refreshToken);
    return res.status(200).json({ message: "Logout successful" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};
