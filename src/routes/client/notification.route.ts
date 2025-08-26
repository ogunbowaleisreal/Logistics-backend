import { Router } from "express";
import { accountVerification } from "../../middlewares/authorization.middleware";
import {
  deleteNotification,
  getNotifications,
  updateNotification,
} from "../../controllers/client/notification.controller";

const router = Router();

router
  .route("")
  .get(accountVerification, getNotifications)
  .patch(accountVerification, updateNotification)
  .delete(accountVerification, deleteNotification);

export default router;
