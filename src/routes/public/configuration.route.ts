import { Router } from "express";
import {
  getContactInfo,
  getPaymentMethods,
} from "../../controllers/public/configuration.controller";

const router = Router();

router.get("/contact", getContactInfo);
router.get("/payment-methods", getPaymentMethods);

export default router;
