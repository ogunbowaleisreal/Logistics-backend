import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { RoleServices } from "../../services/admin/Role.Service";

const roleService = new RoleServices();

export const getRoles = async (req: Request, res: Response) => {
  const filter = req.query;
  try {
    const roles = await roleService.getRoles(filter);
    return res
      .status(200)
      .json({ message: "Roles fetched successfully", data: roles });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const createRole = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const roles = await roleService.createRole(payload);
    return res
      .status(201)
      .json({ message: "Role created successfully", data: roles });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const roles = await roleService.updateRole(payload);
    return res
      .status(200)
      .json({ message: "Role updated successfully", data: roles });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};

export const getPermissions = (req: Request, res: Response) => {
  const filter = req.query;
  try {
    const roles = roleService.getPermissions(filter);
    return res
      .status(200)
      .json({ message: "Permissions fetched successfully", data: roles });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
  }
};
