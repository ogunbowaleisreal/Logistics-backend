import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
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
  .get(adminVerification, getGlobalZones)
  .post(adminVerification, validate(createGlobalZoneSchema, "body"), createGlobalZone);

router
  .route("/:id")
  .get(adminVerification, getGlobalZone)
  .patch(adminVerification, validate(updateGlobalZoneSchema, "body"), updateGlobalZone)
  .delete(adminVerification, deleteGlobalZone);

router
  .route("/:id/weight-brackets")
  .get(adminVerification, getGlobalWeightBrackets)
  .post(
    adminVerification,
    validate(bulkUpsertGlobalWeightBracketsSchema, "body"),
    bulkUpsertGlobalWeightBrackets,
  );

router
  .route("/:id/weight-brackets/:bracketId")
  .patch(
    adminVerification,
    validate(updateGlobalWeightBracketSchema, "body"),
    updateGlobalWeightBracket,
  )
  .delete(adminVerification, deleteGlobalWeightBracket);

export default router;
// import { Router } from "express";
// import { adminVerification } from "../../middlewares/authorization.middleware";
// import { validate } from "../../middlewares/validation.middleware";
// import {
//   createGlobalZoneSchema,
//   updateGlobalZoneSchema,
// } from "../../validators/globalShippingZone.validator";
// import {
//   createGlobalZone,
//   getGlobalZones,
//   getGlobalZone,
//   updateGlobalZone,
//   deleteGlobalZone,
// } from "../../controllers/admin/globalShippingZone.controller";

// const router = Router();

// router
//   .route("/")
//   .get(adminVerification, getGlobalZones)
//   .post(adminVerification, validate(createGlobalZoneSchema, "body"), createGlobalZone);

// router
//   .route("/:id")
//   .get(adminVerification, getGlobalZone)
//   .patch(adminVerification, validate(updateGlobalZoneSchema, "body"), updateGlobalZone)
//   .delete(adminVerification, deleteGlobalZone);

// export default router;
