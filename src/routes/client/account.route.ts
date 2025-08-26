import { Router } from "express";
import { accountVerification } from "../../middlewares/authorization.middleware";
import {
  getProfile,
  updateProfile,
  updatePassword,
  deleteProfile,
  verifyPasswordUpdateOTP,
  generateImageUploadSignature,
  getUsers,
} from "../../controllers/client/account.controller";

const router = Router();

router
  .route("/profile")
  .get(accountVerification, getProfile)
  .patch(accountVerification, updateProfile)
  .delete(accountVerification, deleteProfile);

router.patch("/password", accountVerification, updatePassword);
router.post(
  "/verify-password-update",
  accountVerification,
  verifyPasswordUpdateOTP
);

router.get(
  "/image-upload-signature",
  accountVerification,
  generateImageUploadSignature
);

router.get("", accountVerification, getUsers);

export default router;
