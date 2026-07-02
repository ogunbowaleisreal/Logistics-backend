import { Router } from "express";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";
import {
  getGlobalZones,
  // getGlobalZone,
  cloneFromGlobalTemplate,
} from "../../controllers/business/globalShippingZone.controller";

const router = Router();

router.route("/").get(staffRoleVerification("GETSHIPPINGS"), getGlobalZones);

// router
//   .route("/:templateId")
//   .get(staffRoleVerification("GETSHIPPINGS"), getGlobalZone);

router
  .route("/clone")
  .post(staffRoleVerification("UPTSHIPPING"), cloneFromGlobalTemplate);

export default router;
