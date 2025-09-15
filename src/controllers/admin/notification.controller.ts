// import { ExtendedRequest } from "../../utilities/Interfaces";
// import { Request, Response } from "express";
// import AppError from "../../utilities/ErrorHandler";
// import logger from "../../../logger";
// import {
//   NotificationGroupService,
//   NotificationService,
// } from "../../services/admin/Notification.Service";

// const notificationGroupService = new NotificationGroupService();
// const notificationService = new NotificationService();
// export const createNotificationGroup = async (
//   req: ExtendedRequest,
//   res: Response
// ) => {
//   const payload = req.body;
//   try {
//     const notification = await notificationGroupService.createNotificationGroup(
//       payload
//     );
//     return res.status(201).json({
//       message: "Notification group created successfully",
//       data: notification,
//     });
//   } catch (error: any) {
//     if (error instanceof AppError) {
//       return res.status(error.statusCode).json({ message: error.message });
//     }
//     logger.error(error.message);
//     return res.status(500).json({ message: error.message });
//   }
// };

// export const getNotificationGroups = async (
//   req: ExtendedRequest,
//   res: Response
// ) => {
//   const filter = req.query;
//   try {
//     const notifications = await notificationGroupService.getNotificationGroups(
//       filter
//     );
//     return res.status(200).json({
//       message: "Notification group fetched successfully",
//       data: notifications,
//     });
//   } catch (error: any) {
//     if (error instanceof AppError) {
//       return res.status(error.statusCode).json({ message: error.message });
//     }
//     logger.error(error.message);
//     return res.status(500).json({ message: error.message });
//   }
// };

// export const updateNotificationGroup = async (
//   req: ExtendedRequest,
//   res: Response
// ) => {
//   const payload = req.body;
//   try {
//     const notification = await notificationGroupService.updateNotificationGroup(
//       payload
//     );
//     return res.status(200).json({
//       message: "Notification group updated successfully",
//       data: notification,
//     });
//   } catch (error: any) {
//     if (error instanceof AppError) {
//       return res.status(error.statusCode).json({ message: error.message });
//     }
//     logger.error(error.message);
//     return res.status(500).json({ message: error.message });
//   }
// };

// export const deleteNotificationGroup = async (
//   req: ExtendedRequest,
//   res: Response
// ) => {
//   const { groupID } = req.query as { groupID: string };
//   try {
//     await notificationGroupService.deleteNotificationGroup(groupID);
//     return res.status(200).json({
//       message: "Notification group deleted successfully",
//     });
//   } catch (error: any) {
//     if (error instanceof AppError) {
//       return res.status(error.statusCode).json({ message: error.message });
//     }
//     logger.error(error.message);
//     return res.status(500).json({ message: error.message });
//   }
// };

// export const createNotification = async (
//   req: ExtendedRequest,
//   res: Response
// ) => {
//   const payload = req.body;
//   try {
//     const notification = await notificationService.createNotification(payload);
//     return res.status(201).json({
//       message: "Notification created successfully",
//       data: notification,
//     });
//   } catch (error: any) {
//     if (error instanceof AppError) {
//       return res.status(error.statusCode).json({ message: error.message });
//     }
//     logger.error(error.message);
//     return res.status(500).json({ message: error.message });
//   }
// };

// export const getNotifications = async (req: ExtendedRequest, res: Response) => {
//   const filter = req.query;
//   try {
//     const notifications = await notificationService.getNotifications(filter);
//     return res.status(200).json({
//       message: "Notification fetched successfully",
//       data: notifications,
//     });
//   } catch (error: any) {
//     if (error instanceof AppError) {
//       return res.status(error.statusCode).json({ message: error.message });
//     }
//     logger.error(error.message);
//     return res.status(500).json({ message: error.message });
//   }
// };

// export const updateNotification = async (
//   req: ExtendedRequest,
//   res: Response
// ) => {
//   const payload = req.body;
//   try {
//     const notification = await notificationService.updateNotification(payload);
//     return res.status(200).json({
//       message: "Notification updated successfully",
//       data: notification,
//     });
//   } catch (error: any) {
//     if (error instanceof AppError) {
//       return res.status(error.statusCode).json({ message: error.message });
//     }
//     logger.error(error.message);
//     return res.status(500).json({ message: error.message });
//   }
// };

// export const deleteNotification = async (
//   req: ExtendedRequest,
//   res: Response
// ) => {
//   const { notificationID } = req.query as { notificationID: string };
//   try {
//     await notificationService.deleteNotification(notificationID);
//     return res.status(200).json({
//       message: "Notification deleted successfully",
//     });
//   } catch (error: any) {
//     if (error instanceof AppError) {
//       return res.status(error.statusCode).json({ message: error.message });
//     }
//     logger.error(error.message);
//     return res.status(500).json({ message: error.message });
//   }
// };

// export const sendNotification = async (req: ExtendedRequest, res: Response) => {
//   const { notificationID } = req.body as { notificationID: string };
//   try {
//     const notification = await notificationService.sendNotification(
//       notificationID
//     );
//     return res.status(200).json({
//       message: "Notification sent successfully",
//     });
//   } catch (error: any) {
//     if (error instanceof AppError) {
//       return res.status(error.statusCode).json({ message: error.message });
//     }
//     logger.error(error.message);
//     return res.status(500).json({ message: error.message });
//   }
// };
