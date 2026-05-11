import { Router } from "express";
import { getProfile } from "../../controllers/business/businessProfile.controller";

const router = Router();


router.route("/profile").get(getProfile);

export default router;
