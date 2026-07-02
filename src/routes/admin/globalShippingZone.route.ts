import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import { validate } from "../../middlewares/validation.middleware";
import {
  createGlobalZoneSchema,
  updateGlobalZoneSchema,
} from "../../validators/globalShippingZone.validator";
import {
  createGlobalZone,
  getGlobalZones,
  getGlobalZone,
  updateGlobalZone,
  deleteGlobalZone,
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

export default router;
