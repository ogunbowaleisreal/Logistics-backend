import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { AuthenticationService } from "../../services/client/Authentication.Service";
import { Hasher } from "../../utilities/Hasher";
import { CacheService } from "../../services/Cache.Service";
import { AuthenticationTokenGenerator } from "../../services/Unique.Service";
import { EmailService } from "../../services/Email.Service";

const authenticationTokenGenerator = new AuthenticationTokenGenerator();
const cacheService = new CacheService();
const emailService = new EmailService();
const hasher = new Hasher();

const authenticationService = new AuthenticationService(
  authenticationTokenGenerator,
  cacheService,
  emailService,
  hasher
);
export const registerAccountController = async (
  req: Request,
  res: Response
) => {
  const payload = req.body;
  try {
    const response = await authenticationService.registerAccount(payload);
    return res.status(201).json({
      message: "Account registration successful",
      data: response,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

// export const completeRegistrationController = async (
//   req: Request,
//   res: Response
// ) => {
//   const payload = req.body;
//   try {
//     const response = await authenticationService.completeRegistration(payload);
//     return res.status(200).json({message: "", data: response});
//   } catch (error: any) {
//     if (error instanceof AppError) {
//       return res.status(error.statusCode).json({message: error.message});
//     }
//     return res.status(500).json({message: error.message});
//   }
// };

export const loginController = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const response = await authenticationService.loginAccount(payload);
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

export const socialLoginController = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const { account, accessToken, refreshToken } =
      await authenticationService.socialLogin(payload);
    return res.status(200).json({
      message: "Login successful",
      data: { account, accessToken, refreshToken },
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const sendVerificationEmailController = async (
  req: Request,
  res: Response
) => {
  const filter = req.query;
  try {
    const response = await authenticationService.sendVerificationEmail(filter);
    return res.status(200).json({ message: "Verification email sent" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const verifyAccountController = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const response = await authenticationService.verifyAccount(payload);
    return res
      .status(200)
      .json({ message: "Account verified successfully", data: response });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const response = await authenticationService.forgotPassword(payload);
    return res.status(200).json({ message: "Password reset email sent" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const verifyPasswordResetOTPController = async (
  req: Request,
  res: Response
) => {
  const payload = req.body;
  try {
    const response = await authenticationService.verifyPasswordResetOTP(
      payload
    );
    return res.status(200).json({
      message: "Password Reset OTP Verified",
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res
        .status(error.statusCode)
        .json({ status: false, message: error.message });
    }
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const response = await authenticationService.resetPassword(payload);
    return res
      .status(200)
      .json({ message: "Password reset successful", data: response });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const accessTokenController = async (req: Request, res: Response) => {
  const filter = req.query;
  try {
    const response = await authenticationService.getAccessToken(filter);
    return res
      .status(200)
      .json({ message: "Access token fetched successfully", data: response });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  const { refreshToken } = req.query as { refreshToken: string };
  try {
    await authenticationService.logoutAccount(refreshToken);
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};
