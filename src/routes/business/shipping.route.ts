import { Router } from "express";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";
import {
  createZone,
  getZones,
  updateZone,
  deleteZone,
  addWeightBracket,
  getWeightBrackets,
  updateWeightBracket,
  deleteWeightBracket,
} from "../../controllers/business/shipping.controller";
import { validate } from "../../middlewares/validation.middleware";
import {
  createZoneSchema,
  updateZoneSchema,
  addWeightBracketSchema,
  updateWeightBracketSchema,
} from "../../validators/shipping.validator";

const router = Router();

router
  .route("/zones")
  .post(staffRoleVerification("shipping"), validate(createZoneSchema, "body"), createZone)
  .get(staffRoleVerification("shipping"), getZones);

router
  .route("/zones/:zoneId")
  .put(staffRoleVerification("shipping"), validate(updateZoneSchema, "body"), updateZone)
  .delete(staffRoleVerification("shipping"), deleteZone);

router
  .route("/zones/:zoneId/weight-brackets")
  .post(staffRoleVerification("shipping"), validate(addWeightBracketSchema, "body"), addWeightBracket)
  .get(staffRoleVerification("shipping"), getWeightBrackets);

router
  .route("/zones/:zoneId/weight-brackets/:bracketId")
  .put(staffRoleVerification("shipping"), validate(updateWeightBracketSchema, "body"), updateWeightBracket)
  .delete(staffRoleVerification("shipping"), deleteWeightBracket);

// router
//   .route("/rates")
//   .post(staffRoleVerification("shipping"), upsertRates)
//   .get(staffRoleVerification("shipping"), getRates);

// router
//   .route("/rates/:rateId")
//   .put(staffRoleVerification("shipping"), updateRate)
//   .delete(staffRoleVerification("shipping"), deleteRate);

export default router;
