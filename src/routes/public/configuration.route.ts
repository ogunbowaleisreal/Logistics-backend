import { Router } from "express";
import {
  getContactInfo,
  getPaymentMethods,
  getServiceFeeTiers,
} from "../../controllers/public/configuration.controller";

const router = Router();

router.get("/contact", getContactInfo);
router.get("/payment-methods", getPaymentMethods);
router.get("/service-fee-tiers", getServiceFeeTiers);

export default router;
