import express from "express";
import { riderVerification } from "../../middlewares/authorization.middleware";
import {
  getMyOrders,
  updateOrderStatus,
} from "../../controllers/rider/order.controller";

const router = express.Router();

router.get("/", riderVerification, getMyOrders);
router.patch("/:orderId/status", riderVerification, updateOrderStatus);

export default router;
