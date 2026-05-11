import { Router } from "express";
import {
  createBanner,
  deleteBanner,
  getBanners,
  setDefaultBanner,
  updateBanner,
} from "../../controllers/business/banner.controller";
import { staffRoleVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router
  .route("/")
  .post(staffRoleVerification("CRTBANNER"), createBanner)
  .get(staffRoleVerification("GETBANNERS"), getBanners)
  .patch(staffRoleVerification("UPTBANNER"), updateBanner)
  .delete(staffRoleVerification("DELBANNER"), deleteBanner);

router.patch("/default", staffRoleVerification("UPTBANNER"), setDefaultBanner);

export default router;
