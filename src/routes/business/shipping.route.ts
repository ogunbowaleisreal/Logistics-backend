import { Router } from "express";
import {
  businessVerification,
  staffRoleVerification,
} from "../../middlewares/authorization.middleware";
import {
  getZones,
  upsertRates,
  getRates,
  updateRate,
  deleteRate,
} from "../../controllers/business/shipping.controller";

const router = Router();

router.route("/zones").get(businessVerification, getZones);

router
  .route("/rates")
  .post(staffRoleVerification("shipping"), upsertRates)
  .get(staffRoleVerification("shipping"), getRates);

router
  .route("/rates/:rateId")
  .put(staffRoleVerification("shipping"), updateRate)
  .delete(staffRoleVerification("shipping"), deleteRate);

export default router;
