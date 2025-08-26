import { Router } from "express";
import {
  createBanner,
  deleteBanner,
  getBanners,
  setDefaultBanner,
  updateBanner,
} from "../../controllers/admin/banner.controller";
import { adminVerification } from "../../middlewares/authorization.middleware";

const router = Router();

router
  .route("")
  .post(adminVerification, createBanner)
  .get(adminVerification, getBanners)
  .patch(adminVerification, updateBanner)
  .delete(adminVerification, deleteBanner);

router.patch("/default", adminVerification, setDefaultBanner);

export default router;
