import express from "express";
import {
  changeRider,
  getOrders,
  updateOrderStatus,
} from "../../controllers/business/order.controller";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";

const router = express.Router();

router
  .route("/")
  .get(staffRoleVerification("GETORDERS"), getOrders)
  .patch(staffRoleVerification("UPTORDER"), updateOrderStatus);

router.patch("/:orderId/rider", staffRoleVerification("UPTORDER"), changeRider);

export default router;
