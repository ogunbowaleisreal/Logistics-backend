import { Router } from "express";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";
import {
  createZone,
  getZones,
  updateZone,
  deleteZone,
  // upsertRates,  // Removed: weight-based rates replaced by flat zone amount
  // getRates,
  // updateRate,
  // deleteRate,
} from "../../controllers/business/shipping.controller";

const router = Router();

router
  .route("/zones")
  .post(staffRoleVerification("shipping"), createZone)
  .get(staffRoleVerification("shipping"), getZones);

router
  .route("/zones/:zoneId")
  .put(staffRoleVerification("shipping"), updateZone)
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
