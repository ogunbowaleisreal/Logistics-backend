import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { StaffRoleService } from "../../services/business/StaffRole.Service";

const staffRoleService = new StaffRoleService();

export const getRoles = async (req: Request | any, res: Response): Promise<Response> => {
  try {
    const businessId = req.business?.businessId ?? req.staff?.businessId;
    const roles = await staffRoleService.getRoles(businessId, req.query);
    return res.status(200).json({ message: "Roles fetched successfully", data: roles });
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const updateRole = async (req: Request | any, res: Response): Promise<Response> => {
  try {
    const businessId = req.business?.businessId ?? req.staff?.businessId;
    const role = await staffRoleService.updateRole(businessId, req.body);
    return res.status(200).json({ message: "Role updated successfully", data: role });
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const getPermissions = (req: Request, res: Response): Response => {
  try {
    const permissions = staffRoleService.getPermissions(req.query);
    return res.status(200).json({ message: "Permissions fetched successfully", data: permissions });
  } catch (error: any) {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
