import { Router } from "express";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";
import {
  createZone,
  getZones,
  updateZone,
  deleteZone,
} from "../../controllers/business/shipping.controller";
import { validate } from "../../middlewares/validation.middleware";
import { createZoneSchema, updateZoneSchema } from "../../validators/shipping.validator";

const router = Router();

router
  .route("/zones")
  .post(staffRoleVerification("shipping"), validate(createZoneSchema, "body"), createZone)
  .get(staffRoleVerification("shipping"), getZones);

router
  .route("/zones/:zoneId")
  .put(staffRoleVerification("shipping"), validate(updateZoneSchema, "body"), updateZone)
  .delete(staffRoleVerification("shipping"), deleteZone);

// router
//   .route("/rates")
//   .post(staffRoleVerification("shipping"), upsertRates)
//   .get(staffRoleVerification("shipping"), getRates);

// router
//   .route("/rates/:rateId")
//   .put(staffRoleVerification("shipping"), updateRate)
//   .delete(staffRoleVerification("shipping"), deleteRate);

export default router;
