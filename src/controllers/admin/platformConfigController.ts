import { NextFunction, Request, Response } from "express";
import { PlatformConfigService } from "../../services/admin/AdminPlatformConfig.service";

const platformConfigService = new PlatformConfigService();

export const getPlatformConfig = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const config = await platformConfigService.getConfig();
        return res
            .status(200)
            .json({ message: "Platform configuration fetched successfully", data: config });
    } catch (error: any) {
        next(error);
    }
};

export const updatePlatformConfig = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const config = await platformConfigService.updateConfig(req.body);
        return res
            .status(200)
            .json({ message: "Platform configuration updated successfully", data: config });
    } catch (error: any) {
        next(error);
    }
};