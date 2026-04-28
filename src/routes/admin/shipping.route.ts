import { Router } from "express";
import { adminVerification } from "../../middlewares/authorization.middleware";
import {
  createZone,
  getZones,
  updateZone,
  deleteZone,
} from "../../controllers/admin/shipping.controller";

const router = Router();

router.route("/zones").post(adminVerification, createZone).get(adminVerification, getZones);

router
  .route("/zones/:zoneId")
  .put(adminVerification, updateZone)
  .delete(adminVerification, deleteZone);

export default router;
