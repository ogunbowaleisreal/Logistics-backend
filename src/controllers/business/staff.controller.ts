import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { StaffService } from "../../services/business/Staff.Service";
import { StaffRoleService } from "../../services/business/StaffRole.Service";
import { Hasher } from "../../utilities/Hasher";
import { EmailService } from "../../services/Email.Service";
import { PasswordGeneratorService } from "../../services/Unique.Service";

const staffRoleService = new StaffRoleService();
const staffService = new StaffService(
  new Hasher(),
  new EmailService(),
  new PasswordGeneratorService(),
  staffRoleService
);

export const createStaff = async (req: Request | any, res: Response): Promise<Response> => {
  try {
    const businessId = req.business?.businessId ?? req.staff?.businessId;
    const staff = await staffService.createStaff(businessId, req.body);
    return res.status(201).json({ message: "Staff created successfully", data: staff });
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const getStaff = async (req: Request | any, res: Response): Promise<Response> => {
  try {
    const businessId = req.business?.businessId ?? req.staff?.businessId;
    const staff = await staffService.getStaff(businessId, req.query);
    return res.status(200).json({ message: "Staff fetched successfully", data: staff });
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const updateStaff = async (req: Request | any, res: Response): Promise<Response> => {
  try {
    const businessId = req.business?.businessId ?? req.staff?.businessId;
    const staff = await staffService.updateStaff(businessId, req.body);
    return res.status(200).json({ message: "Staff updated successfully", data: staff });
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const deleteStaff = async (req: Request | any, res: Response): Promise<Response> => {
  const { staffId } = req.query as { staffId: string };
  try {
    const businessId = req.business?.businessId ?? req.staff?.businessId;
    await staffService.deleteStaff(businessId, staffId);
    return res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
