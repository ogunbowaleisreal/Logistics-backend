import { Request, Response } from "express";
import { AdminService } from "../../services/admin/Admin.Service";
import AppError from "../../utilities/ErrorHandler";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { CacheService } from "../../services/Cache.Service";
import { EmailService } from "../../services/Email.Service";
import { AuthenticationTokenGenerator } from "../../services/Unique.Service";
import { Hasher } from "../../utilities/Hasher";
import { RoleServices } from "../../services/admin/Role.Service";
import logger from "../../../logger";

const hasher = new Hasher();
const cacheService = new CacheService();
const authenticationTokenGenerator = new AuthenticationTokenGenerator();
const emailService = new EmailService();
const roleService = new RoleServices();

const adminService = new AdminService(
  authenticationTokenGenerator,
  cacheService,
  emailService,
  hasher,
  roleService
);
// Personal
export const getProfile = async (req: ExtendedRequest, res: Response) => {
  const { adminID } = req.admin!;
  try {
    const admin = await adminService.getProfile(adminID);
    return res
      .status(200)
      .json({ message: "Profile fetched successfully", data: admin });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.message);
    }
    return res.status(500).json(error.message);
  }
};

export const updateProfile = async (req: ExtendedRequest, res: Response) => {
  const { adminID } = req.admin!;
  const payload = req.body;
  try {
    const admin = await adminService.updateProfile(adminID, payload);
    return res
      .status(200)
      .json({ message: "Profile updated successfully", data: admin });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.message);
    }
    return res.status(500).json(error.message);
  }
};

// export const requestPasswordUpdate = async (
//   req: ExtendedRequest,
//   res: Response
// ) => {
//   const { adminID } = req.admin!;
//   try {
//     const admin = await adminService.requestPasswordUpdate(adminID);
//     return res.status(200).json({
//       message: "Password update request sent successfully",
//       data: admin,
//     });
//   } catch (error: any) {
//     if (error instanceof AppError) {
//       return res.status(error.statusCode).json({ message: error.message });
//     }
//     return res.status(500).json({ message: error.message });
//   }
// };
// export const verifyPasswordUpdateOTP = async (
//   req: ExtendedRequest,
//   res: Response
// ) => {
//   const { adminID } = req.admin!;
//   const payload = req.body;
//   try {
//     const admin = await adminService.verifyPasswordUpdateOTP(adminID, payload);
//     return res.status(200).json({
//       message: "Password update verification successful",
//       data: admin,
//     });
//   } catch (error: any) {
//     if (error instanceof AppError) {
//       return res
//         .status(error.statusCode)
//         .json({ status: false, message: error.message });
//     }
//     return res.status(500).json({ status: false, message: error.message });
//   }
// };

export const updatePassword = async (req: ExtendedRequest, res: Response) => {
  const { adminID } = req.admin!;
  const payload = req.body;
  try {
    const admin = await adminService.updatePassword(adminID, payload);
    return res
      .status(200)
      .json({ message: "Password updated successfully", data: admin });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.message);
    }
    return res.status(500).json(error.message);
  }
};

export const updateAdmin2FA = async (req: ExtendedRequest, res: Response) => {
  const { adminID } = req.admin!;
  const { twoFactorAuthentication } = req.body;
  try {
    const admin = await adminService.updateAdmin2FA(
      adminID,
      twoFactorAuthentication
    );
    return res
      .status(200)
      .json({ message: "Admin 2FA updated successfully", data: admin });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.message);
    }
    return res.status(500).json(error.message);
  }
};

export const updateAdmin = async (req: ExtendedRequest, res: Response) => {
  const payload = req.body;
  try {
    const admin = await adminService.updateAdmin(payload);
    return res
      .status(200)
      .json({ message: "Admin updated successfully", data: admin });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.message);
    }
    return res.status(500).json(error.message);
  }
};

export const getAdmins = async (req: ExtendedRequest, res: Response) => {
  const filter = req.query;
  try {
    const admin = await adminService.getAdmins(filter);
    return res
      .status(200)
      .json({ message: "Admins fetched successfully", data: admin });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.message);
    }
    return res.status(500).json(error.message);
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  const { adminID } = req.query as { adminID: string };
  try {
    await adminService.deleteAdmin(adminID);
    return res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(error.message);
    }
    return res.status(500).json(error.message);
  }
};

//////////////////////// Image upload signature /////////////////////
export const generateImageUploadSignature = async (
  req: Request,
  res: Response
) => {
  try {
    const signature = await adminService.generateImageUploadSignature();
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

export const adminDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = await adminService.adminDashboard();
    return res.status(200).json({
      message: "Admin dashboard fetched successfully",
      data: dashboard,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
