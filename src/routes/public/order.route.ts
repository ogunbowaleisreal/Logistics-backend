import { Router } from "express";
import {
  verifySafehavenPaymentViaWebhook,
  verifyMonnifyPaymentViaWebhook,
  verifyFlutterwavePaymentViaWebhook,
} from "../../controllers/client/order.controller";
import { verifyFlutterwaveWebookHash } from "../../middlewares/checkout.middleware";

const router = Router();

router.route("/safehaven/webhook/:orderID").post(verifySafehavenPaymentViaWebhook);

router.route("/monnify/webhook").post(verifyMonnifyPaymentViaWebhook);

router.post("/flutter/webhook", verifyFlutterwaveWebookHash, verifyFlutterwavePaymentViaWebhook);

export default router;
