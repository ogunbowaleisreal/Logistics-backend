import { NextFunction, Request, Response } from "express";
import { AnnouncementService } from "../../services/public/announcements.services"; // adjust path to your actual file location

const announcementService = new AnnouncementService();

export const createAnnouncement = async (
    req: Request | any,
    res: Response,
    next: NextFunction,
) => {
    const { adminID } = req.admin;

    try {
        const announcement = await announcementService.createAdminAnnouncement({
            ...req.body,
            createdBy: adminID,
        });
        return res
            .status(201)
            .json({ message: "Announcement created successfully", data: announcement });
    } catch (error: any) {
        next(error);
    }
};

export const getAnnouncements = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const announcements = await announcementService.getAllAnnouncements(
            req.query as any,
        );
        return res
            .status(200)
            .json({ message: "Announcements fetched successfully", data: announcements });
    } catch (error: any) {
        next(error);
    }
};

export const sendAnnouncement = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { announcementId } = req.params;

    try {
        const announcement = await announcementService.sendAnnouncement(
            announcementId,
        );
        return res
            .status(200)
            .json({ message: "Announcement sent successfully", data: announcement });
    } catch (error: any) {
        next(error);
    }
};

export const resendAnnouncement = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { announcementId } = req.params;

    try {
        const announcement = await announcementService.resendAnnouncement(
            announcementId,
        );
        return res
            .status(200)
            .json({ message: "Announcement resent successfully", data: announcement });
    } catch (error: any) {
        next(error);
    }
};

export const deleteAnnouncement = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { announcementId } = req.params;

    try {
        await announcementService.deleteAnnouncement(announcementId);
        return res
            .status(200)
            .json({ message: "Announcement deleted successfully" });
    } catch (error: any) {
        next(error);
    }
};