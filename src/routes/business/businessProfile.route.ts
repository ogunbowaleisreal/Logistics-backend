import { Router } from "express";
import { getProfile } from "../../controllers/business/businessProfile.controller";
import { businessVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router.route("").get(businessVerification, getProfile);

export default router;
