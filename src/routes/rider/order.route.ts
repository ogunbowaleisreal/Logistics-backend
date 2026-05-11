import { Router } from "express";
import { riderVerification } from "../../middlewares/authorization.middleware";
import {
  getMyOrders,
  updateOrderStatus,
} from "../../controllers/rider/order.controller";

const router = Router();

router.get("/", riderVerification, getMyOrders);
router.patch("/:orderId/status", riderVerification, updateOrderStatus);

export default router;
