// import { Router } from "express";
// import { adminVerification } from "../../middlewares/authorization.middleware";
// import {
//   createNotification,
//   createNotificationGroup,
//   deleteNotification,
//   deleteNotificationGroup,
//   getNotificationGroups,
//   getNotifications,
//   sendNotification,
//   updateNotification,
//   updateNotificationGroup,
// } from "../../controllers/admin/notification.controller";

// const router = Router();

// router
//   .route("/group")
//   .post(adminVerification, createNotificationGroup)
//   .get(adminVerification, getNotificationGroups)
//   .patch(adminVerification, updateNotificationGroup)
//   .delete(adminVerification, deleteNotificationGroup);

// router.post("/send", adminVerification, sendNotification);

// router
//   .route("")
//   .post(adminVerification, createNotification)
//   .get(adminVerification, getNotifications)
//   .patch(adminVerification, updateNotification)
//   .delete(adminVerification, deleteNotification);

// export default router;
