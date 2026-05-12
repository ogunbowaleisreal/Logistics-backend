import { Router } from "express";
import { getTermsAndConditions } from "../../controllers/client/termsAndConditions.controller";

const router = Router();

router.route("/").get(getTermsAndConditions);

export default router;
