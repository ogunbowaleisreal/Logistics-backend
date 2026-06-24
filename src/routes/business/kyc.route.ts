import { Router } from "express";
import {
  getKyc,
  submitBvn,
  submitCac,
  submitIdentification,
  submitRegistration,
  verifyBVN,
} from "../../controllers/business/kyc.controller";
import { businessVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router.use(businessVerification);

router.route("/").get(getKyc);
router.put("/registration", submitRegistration);
router.put("/identification", submitIdentification);
router.put("/cac", submitCac);
router.route("/bvn").post(submitBvn).patch(verifyBVN);

export default router;
