import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import {
  getConfiguration,
  updateConfiguration,
} from "../../controllers/admin/configuration.controller";
import { validate } from "../../middlewares/validation.middleware";
import { updateConfigurationSchema } from "../../validators/configuration.validator";

const router = Router();

router
  .route("")
  .get(adminVerification, getConfiguration)
  .put(adminVerification, validate(updateConfigurationSchema, "body"), updateConfiguration);

export default router;
