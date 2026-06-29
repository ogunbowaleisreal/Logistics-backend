import { Router } from "express";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";
import {
  getGlobalZones,
  getGlobalZone,
  cloneFromGlobalTemplate,
} from "../../controllers/business/globalShippingZone.controller";

const router = Router();

router.route("/").get(staffRoleVerification("shipping"), getGlobalZones);

router
  .route("/:templateId")
  .get(staffRoleVerification("shipping"), getGlobalZone);

router
  .route("/:templateId/clone")
  .post(staffRoleVerification("shipping"), cloneFromGlobalTemplate);

export default router;
