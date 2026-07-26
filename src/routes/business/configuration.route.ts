import { Router } from "express";
import {
  getConfiguration,
  updateConfiguration,
} from "../../controllers/business/businessConfiguration.controller";
import {
  updateSocialLinks,
  updateSupport,
  updateProfile
} from "../../controllers/business/businessProfile.controller";
import {
  businessVerification,
  staffRoleVerification,
} from "../../middlewares/authorization.middleware";
import { validate } from "../../middlewares/validation.middleware";
import { updateConfigurationSchema } from "../../validators/businessConfiguration.validator";

const router = Router();

router
  .route("/")
  .get(staffRoleVerification("GETCFG"), getConfiguration)
  .put(
    staffRoleVerification("UPTCFG"),
    validate(updateConfigurationSchema, "body"),
    updateConfiguration,
  );
router.patch("/", businessVerification, updateProfile);
router.patch("/social-links", businessVerification, updateSocialLinks);
router.patch("/support", businessVerification, updateSupport);

export default router;
