import { NextFunction, Request, Response } from "express";
import { AnnouncementService } from "../../services/public/announcements.services";

const announcementService = new AnnouncementService();

export const createAnnouncement = async (
    req: Request | any,
    res: Response,
    next: NextFunction,
) => {
    try {
        const businessId = req.staff?.businessId ?? req.business?.businessId;
        const createdByModel = req.staff ? "Staff" : "Business";
        const createdBy = req.staff ? req.staff.staffId : businessId;

        const announcement = await announcementService.createBusinessAnnouncement({
            ...req.body,
            businessId,
            createdBy,
            createdByModel,
        });

        return res
            .status(201)
            .json({ message: "Announcement created successfully", data: announcement });
    } catch (error: any) {
        next(error);
    }
};

export const getAnnouncements = async (
    req: Request | any,
    res: Response,
    next: NextFunction,
) => {
    try {
        const businessId = req.staff?.businessId ?? req.business?.businessId;
        const announcements = await announcementService.getAllAnnouncements({
            ...req.query,
            businessId,
        } as any);

        return res
            .status(200)
            .json({ message: "Announcements fetched successfully", data: announcements });
    } catch (error: any) {
        next(error);
    }
};

export const sendAnnouncement = async (
    req: Request | any,
    res: Response,
    next: NextFunction,
) => {
    try {
        const businessId = req.staff?.businessId ?? req.business?.businessId;
        const { announcementId } = req.params;

        const announcement = await announcementService.sendAnnouncement(
            announcementId,
            businessId,
        );

        return res
            .status(200)
            .json({ message: "Announcement sent successfully", data: announcement });
    } catch (error: any) {
        next(error);
    }
};

export const updateAnnouncement = async (
    req: Request | any,
    res: Response,
    next: NextFunction,
) => {
    try {
        const businessId = req.staff?.businessId ?? req.business?.businessId;
        const { announcementId } = req.params;

        const announcement = await announcementService.updateAnnouncement(
            announcementId,
            req.body,
            businessId,
        );

        return res
            .status(200)
            .json({ message: "Announcement updated successfully", data: announcement });
    } catch (error: any) {
        next(error);
    }
};

export const resendAnnouncement = async (
    req: Request | any,
    res: Response,
    next: NextFunction,
) => {
    try {
        const businessId = req.staff?.businessId ?? req.business?.businessId;
        const { announcementId } = req.params;

        const announcement = await announcementService.resendAnnouncement(
            announcementId,
            businessId,
        );

        return res
            .status(200)
            .json({ message: "Announcement resent successfully", data: announcement });
    } catch (error: any) {
        next(error);
    }
};

export const deleteAnnouncement = async (
    req: Request | any,
    res: Response,
    next: NextFunction,
) => {
    try {
        const businessId = req.staff?.businessId ?? req.business?.businessId;
        const { announcementId } = req.params;

        await announcementService.deleteAnnouncement(announcementId, businessId);

        return res.status(200).json({ message: "Announcement deleted successfully" });
    } catch (error: any) {
        next(error);
    }
};