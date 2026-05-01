import { Router } from "express";
import {
  getKyc,
  listKyc,
  updateCacStatus,
  updateIdentificationStatus,
} from "../../controllers/admin/kyc.controller";
import { roleVerification } from "../../middlewares/authorization.middleware";

const router = Router();

// router.use(roleVerification("manage-kyc"));

router.route("/").get(listKyc);
router.route("/:businessId").get(getKyc);
router.patch("/:businessId/identification", updateIdentificationStatus);
router.patch("/:businessId/cac", updateCacStatus);

export default router;
