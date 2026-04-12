import express from "express";
import {
  getOrders,
  updateOrderStatus,
} from "../../controllers/business/order.controller";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";

const router = express.Router();

router
  .route("/")
  .get(staffRoleVerification("GETORDERS"), getOrders)
  .patch(staffRoleVerification("UPTORDER"), updateOrderStatus);

export default router;
