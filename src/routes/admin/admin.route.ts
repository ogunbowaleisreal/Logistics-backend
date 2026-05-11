import {Router} from "express";
import {
  adminDashboard,
  deleteAdmin,
  generateImageUploadSignature,
  getAdmins,
  getProfile,
  // requestPasswordUpdate,
  updateAdmin,
  updateAdmin2FA,
  updatePassword,
  updateProfile,
  // verifyPasswordUpdateOTP,
} from "../../controllers/admin/admin.controller";

import {
  adminVerification,
  roleVerification,
} from "../../middlewares/authorization.middleware";
import { createAdmin } from "../../controllers/admin/authentication.controller";

const router = Router();

////////////////////////////////// PROFILE ///////////////////////////////////////////////
router
  .route("/profile")
  .get(adminVerification, getProfile)
  .patch(adminVerification, updateProfile);

// router.patch(
//   "/request-password-update",
//   adminVerification,
//   requestPasswordUpdate
// );
// router.post(
//   "/verify-password-update-otp",
//   adminVerification,
//   verifyPasswordUpdateOTP
// );
// router.patch("/update-password", adminVerification, updatePassword);

router.patch("/change-password", adminVerification, updatePassword);

router.patch("/2FA", adminVerification, updateAdmin2FA);

/////////////////////////////// PUBLIC /////////////////////////////////////////////////
router
  .route("")
  .get(roleVerification("GETADMINS"), getAdmins)
  .post(roleVerification("CRTADMIN"), createAdmin)
  .patch(roleVerification("UPTADMIN"), updateAdmin)
  .delete(roleVerification("DELADMIN"), deleteAdmin);

///////////////////////////////// IMAGE UPLOAD /////////////////////////////////////
router.get(
  "/image-upload-signature",
  adminVerification,
  generateImageUploadSignature,
);

router.get("/dashboard", adminVerification, adminDashboard);

export default router;
