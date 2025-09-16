import { Router } from "express";
import {
  createOrder,
  getOrderSummary,
  generateImageUploadSignature,
  provideProofOfPayment,
  trackOrder,
} from "../../controllers/client/order.controller";

const router = Router();

router.get("/track", trackOrder);

router.get("/image-signature", generateImageUploadSignature);

router
  .route("")
  .post(createOrder)
  .get(getOrderSummary)
  .patch(provideProofOfPayment);

export default router;
