import { Router } from "express";
import {
  createOrder,
  cancelOrder,
  getMyOrders,
  generateImageUploadSignature,
  trackOrder,
  verifySafehavenPaymentViaWebhook,
  checkoutOrder,
} from "../../controllers/client/order.controller";
import {
  bodyBusinessContext,
  queryBusinessContext,
} from "../../middlewares/authorization.middleware";
import { validate } from "../../middlewares/validation.middleware";
import {
  cancelOrderSchema,
  checkoutOrderSchema,
  createOrderSchema,
  getMyOrdersSchema,
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

router
  .route("")
  .post(bodyBusinessContext, validate(createOrderSchema, "body"), createOrder);

router
  .route("/checkout")
  .post(
    bodyBusinessContext,
    validate(checkoutOrderSchema, "body"),
    checkoutOrder,
  );

router
  .route("/safehaven/webhook/:orderID")
  .post(verifySafehavenPaymentViaWebhook);

router.get("/image-signature", generateImageUploadSignature);

export default router;
