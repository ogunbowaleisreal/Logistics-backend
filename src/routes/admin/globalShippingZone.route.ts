import { Router } from "express";
import { roleVerification } from "../../middlewares/authorization.middleware";
import { validate } from "../../middlewares/validation.middleware";
import {
  createGlobalZoneSchema,
  updateGlobalZoneSchema,
  bulkUpsertGlobalWeightBracketsSchema,
  updateGlobalWeightBracketSchema,
} from "../../validators/globalShippingZone.validator";
import {
  createGlobalZone,
  getGlobalZones,
  getGlobalZone,
  updateGlobalZone,
  deleteGlobalZone,
  bulkUpsertGlobalWeightBrackets,
  getGlobalWeightBrackets,
  updateGlobalWeightBracket,
  deleteGlobalWeightBracket,
} from "../../controllers/admin/globalShippingZone.controller";

const router = Router();

router
  .route("/")
  .get(roleVerification("GETGBLZONE"), getGlobalZones)
  .post(
    roleVerification("CRTGBLZONE"),
    validate(createGlobalZoneSchema, "body"),
    createGlobalZone,
  );

router
  .route("/:id")
  .get(roleVerification("GETGBLZONE"), getGlobalZone)
  .patch(
    roleVerification("UPTGBLZONE"),
    validate(updateGlobalZoneSchema, "body"),
    updateGlobalZone,
  )
  .delete(roleVerification("DELGBLZONE"), deleteGlobalZone);

router
  .route("/:id/weight-brackets")
  .get(roleVerification("GETGBLBRACKET"), getGlobalWeightBrackets)
  .post(
    roleVerification("UPTGBLBRACKET"),
    validate(bulkUpsertGlobalWeightBracketsSchema, "body"),
    bulkUpsertGlobalWeightBrackets,
  );

router
  .route("/:id/weight-brackets/:bracketId")
  .patch(
    roleVerification("UPTGBLBRACKET"),
    validate(updateGlobalWeightBracketSchema, "body"),
    updateGlobalWeightBracket,
  )
  .delete(roleVerification("DELGBLBRACKET"), deleteGlobalWeightBracket);

export default router;