import { ExtendedRequest } from "../../utilities/Interfaces";
import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import logger from "../../../logger";
import { NotificationService } from "../../services/client/Notification.Service";

const notificationService = new NotificationService();
export const getNotifications = async (req: ExtendedRequest, res: Response) => {
  const { accountID } = req.account!;
  const filter = req.query;
  try {
    const notifications = await notificationService.getNotifications(
      accountID,
      filter
    );
    return res.status(200).json({
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateNotification = async (
  req: ExtendedRequest,
  res: Response
) => {
  const { accountID } = req.account!;
  const payload = req.body;
  try {
    const notification = await notificationService.updateNotification(
      accountID,
      payload
    );
    return res.status(200).json({
      message: "Notifications updated successfully",
      data: notification,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (
  req: ExtendedRequest,
  res: Response
) => {
  const { accountID } = req.account!;
  const { notificationID } = req.query as { notificationID: string };
  try {
    await notificationService.deleteNotification(accountID, notificationID);
    return res.status(200).json({
      message: "Notifications deleted successfully",
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
