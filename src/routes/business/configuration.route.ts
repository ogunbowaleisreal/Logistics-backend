import express from "express";
import {
  getConfiguration,
  updateConfiguration,
} from "../../controllers/business/businessConfiguration.controller";
import {
  updateSocialLinks,
  updateSupport,
} from "../../controllers/business/businessProfile.controller";
import {
  businessVerification,
  staffRoleVerification,
} from "../../middlewares/authorization.middleware";

const router = express.Router();

router
  .route("/")
  .get(staffRoleVerification("GETCFG"), getConfiguration)
  .put(staffRoleVerification("UPTCFG"), updateConfiguration);

router.patch("/social-links", businessVerification, updateSocialLinks);
router.patch("/support", businessVerification, updateSupport);

export default router;
