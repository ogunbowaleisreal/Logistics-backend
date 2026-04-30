import { Router } from "express";
import {
  createOrder,
  cancelOrder,
  getOrderSummary,
  getMyOrders,
  generateImageUploadSignature,
  trackOrder,
} from "../../controllers/client/order.controller";
import {
  bodyBusinessContext,
  queryBusinessContext,
} from "../../middlewares/authorization.middleware";
import { validate } from "../../middlewares/validation.middleware";
import {
  cancelOrderSchema,
  createOrderSchema,
  getMyOrdersSchema,
  getOrderSummarySchema,
  trackOrderSchema,
} from "../../validators/order.validator";

const router = Router();

router.get(
  "/track",
  queryBusinessContext,
  validate(trackOrderSchema, "query"),
  trackOrder,
);

router.get(
  "/my-orders",
  queryBusinessContext,
  validate(getMyOrdersSchema, "query"),
  getMyOrders,
);

router.patch(
  "/cancel",
  bodyBusinessContext,
  validate(cancelOrderSchema, "body"),
  cancelOrder,
);

router.get("/image-signature", generateImageUploadSignature);

router
  .route("")
  .post(bodyBusinessContext, validate(createOrderSchema, "body"), createOrder)
  .get(
    queryBusinessContext,
    validate(getOrderSummarySchema, "query"),
    getOrderSummary,
  );

export default router;
