import { Router } from "express";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";
import {
  createZone,
  getZones,
  updateZone,
  deleteZone,
  bulkUpsertWeightBrackets,
  getWeightBrackets,
  updateWeightBracket,
  deleteWeightBracket,
} from "../../controllers/business/shipping.controller";
import { validate } from "../../middlewares/validation.middleware";
import {
  createZoneSchema,
  updateZoneSchema,
  bulkUpsertWeightBracketsSchema,
  updateWeightBracketSchema,
} from "../../validators/shipping.validator";

const router = Router();

router
  .route("/zones")
  .post(
    staffRoleVerification("CRTSHIPPING"),
    validate(createZoneSchema, "body"),
    createZone,
  )
  .get(staffRoleVerification("GETSHIPPINGS"), getZones);

router
  .route("/zones/:zoneId")
  .put(
    staffRoleVerification("UPTSHIPPING"),
    validate(updateZoneSchema, "body"),
    updateZone,
  )
  .delete(staffRoleVerification("DELSHIPPING"), deleteZone);

router
  .route("/zones/:zoneId/weight-brackets")
  .put(
    staffRoleVerification("UPTSHIPPING"),
    validate(bulkUpsertWeightBracketsSchema, "body"),
    bulkUpsertWeightBrackets,
  )
  .get(staffRoleVerification("GETSHIPPINGS"), getWeightBrackets);

router
  .route("/zones/:zoneId/weight-brackets/:bracketId")
  .put(
    staffRoleVerification("UPTSHIPPING"),
    validate(updateWeightBracketSchema, "body"),
    updateWeightBracket,
  )
  .delete(staffRoleVerification("DELSHIPPING"), deleteWeightBracket);

// router
//   .route("/rates")
//   .post(staffRoleVerification("CRTSHIPPING"), upsertRates)
//   .get(staffRoleVerification("GETSHIPPINGS"), getRates);

// router
//   .route("/rates/:rateId")
//   .put(staffRoleVerification("UPTSHIPPING"), updateRate)
//   .delete(staffRoleVerification("DELSHIPPING"), deleteRate);

export default router;
