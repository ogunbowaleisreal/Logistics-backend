import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import {
  getConfiguration,
  updateConfiguration,
  getPaymentMethods,
  updatePaymentMethod,
  updateServiceFee,
} from "../../controllers/admin/configuration.controller";
import { validate } from "../../middlewares/validation.middleware";
import {
  updateConfigurationSchema,
  updatePaymentMethodSchema,
  updateServiceFeeSchema,
} from "../../validators/configuration.validator";

const router = Router();

router
  .route("")
  .get(adminVerification, getConfiguration)
  .patch(
    adminVerification,
    validate(updateConfigurationSchema, "body"),
    updateConfiguration,
  );

router
  .route("/service-fee")
  .patch(
    adminVerification,
    validate(updateServiceFeeSchema, "body"),
    updateServiceFee,
  );

router
  .route("/payment-methods")
  .get(adminVerification, getPaymentMethods);

router
  .route("/payment-methods/:gateway")
  .patch(
    adminVerification,
    validate(updatePaymentMethodSchema, "body"),
    updatePaymentMethod,
  );

export default router;
