import { ExtendedRequest } from "../../utilities/Interfaces";
import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { AccountService } from "../../services/client/Account.Service";
import { Hasher } from "../../utilities/Hasher";
import logger from "../../../logger";
import { CacheService } from "../../services/Cache.Service";
import { EmailService } from "../../services/Email.Service";
import { AuthenticationTokenGenerator } from "../../services/Unique.Service";

const authenticationTokenGenerator = new AuthenticationTokenGenerator();
const cacheService = new CacheService();
const emailService = new EmailService();
const hasher = new Hasher();

const accountService = new AccountService(
  authenticationTokenGenerator,
  cacheService,
  emailService,
  hasher
);

export const getProfile = async (req: ExtendedRequest, res: Response) => {
  const { accountID } = req.account!;
  try {
    const account = await accountService.getProfile(accountID);
    return res
      .status(200)
      .json({ message: "Profile fetched successfully", data: account });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req: ExtendedRequest, res: Response) => {
  const filter = req.query;
  try {
    const account = await accountService.getUsers(filter);
    return res
      .status(200)
      .json({ message: "Acccounts fetched successfully", data: account });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: ExtendedRequest, res: Response) => {
  const payload = req.body;
  const { accountID, type } = req.account!;
  try {
    const account = await accountService.updateProfile(
      accountID,
      type!,
      payload
    );
    return res
      .status(200)
      .json({ message: "Profile updated successfully", data: account });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteProfile = async (req: ExtendedRequest, res: Response) => {
  const { accountID } = req.account!;
  try {
    const account = await accountService.deleteProfile(accountID);
    return res
      .status(200)
      .json({ message: "Profile deleted successfully", data: account });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updatePassword = async (req: ExtendedRequest, res: Response) => {
  const { accountID } = req.account!;
  const payload = req.body;
  try {
    const account = await accountService.updatePassword(accountID, payload);
    return res.status(200).json({
      message: "Password update verification email sent successfully",
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const verifyPasswordUpdateOTP = async (
  req: ExtendedRequest,
  res: Response
) => {
  const { accountID } = req.account!;
  const payload = req.body;
  try {
    const account = await accountService.verifyPasswordUpdateOTP(
      accountID,
      payload
    );
    return res
      .status(200)
      .json({ message: "Password updated successfully", data: account });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const generateImageUploadSignature = async (
  req: Request,
  res: Response
) => {
  try {
    const signature = await accountService.generateImageUploadSignature();
    return res.status(200).json({
      message: "Image upload signature generated successfully",
      data: signature,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
