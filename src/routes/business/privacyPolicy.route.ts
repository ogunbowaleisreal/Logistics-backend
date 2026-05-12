import { Router } from "express";
import {
  createOrUpdatePrivacyPolicy,
  getPrivacyPolicy,
} from "../../controllers/business/privacyPolicy.controller";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router
  .route("/")
  .put(staffRoleVerification("CRTPRV"), createOrUpdatePrivacyPolicy)
  .get(staffRoleVerification("GETPRV"), getPrivacyPolicy);

export default router;
