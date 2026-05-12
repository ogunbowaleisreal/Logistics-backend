import { Router } from "express";
import { getPrivacyPolicy } from "../../controllers/client/privacyPolicy.controller";

const router = Router();

router.route("/").get(getPrivacyPolicy);

export default router;
