import express from "express";
import {
  createSuperAdmin,
  createAdmin,
  login,
  sendLogin2FAVerification,
  verifyLoginVerificationOTP,
  forgotPassword,
  resetPassword,
  generateNewAccessToken,
  logout,
} from "../../controllers/admin/authentication.controller";
import { roleVerification } from "../../middlewares/authorization.middleware";

const router = express.Router();

router.post("/super-admin", createSuperAdmin);

router.route("/").post(roleVerification("CRTADMIN"), createAdmin);

router
  .post("/login", login)
  .get("/send-login-otp", sendLogin2FAVerification)
  .patch("/verify-login-otp", verifyLoginVerificationOTP)
  .post("/forgot-password", forgotPassword)
  .put("/reset-password", resetPassword)
  .get("/access-token", generateNewAccessToken)
  .delete("/logout", logout);

export default router;
