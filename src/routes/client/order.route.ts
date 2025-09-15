import { Router } from "express";
import {
  createOrder,
  getOrderSummary,
  trackOrder,
} from "../../controllers/client/order.controller";

const router = Router();

router.get("/track", trackOrder);

router.route("").post(createOrder).get(getOrderSummary);

export default router;
