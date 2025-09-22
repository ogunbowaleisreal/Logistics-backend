import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import {
  getOrders,
  updateOrderStatus,
} from "../../controllers/admin/order.controller";

const router = Router();

router
  .route("")
  .get(adminVerification, getOrders)
  .patch(adminVerification, updateOrderStatus);

export default router;
