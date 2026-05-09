import { Router } from "express";
import {
  getBusinessZones,
  getAvailableRideTypes,
  calculateShippingFee,
} from "../../controllers/client/shipping.controller";
import { validate } from "../../middlewares/validation.middleware";
import { calculateShippingFeeSchema } from "../../validators/shippingFee.validator";

const router = Router();

router.get("/zones", getBusinessZones);
router.get("/ride-types", getAvailableRideTypes);
router.post("/calculate", validate(calculateShippingFeeSchema, "body"), calculateShippingFee);

export default router;
