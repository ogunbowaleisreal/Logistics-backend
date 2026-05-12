import { Router } from "express";
import {
  createOrUpdateTermsAndConditions,
  getTermsAndConditions,
} from "../../controllers/business/termsAndConditions.controller";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router
  .route("/")
  .put(staffRoleVerification("CRTTC"), createOrUpdateTermsAndConditions)
  .get(staffRoleVerification("GETTC"), getTermsAndConditions);

export default router;
