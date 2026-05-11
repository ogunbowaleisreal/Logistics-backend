import { Router } from "express";
import {
  register,
  verifyEmail,
  login,
  sendLogin2FAVerification,
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
  generateNewAccessToken,
  logout,
} from "../../controllers/business/authentication.controller";

const router = Router();

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.get("/send-login-otp", sendLogin2FAVerification);
router.patch("/verify-login-otp", verifyLoginOTP);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.get("/access-token", generateNewAccessToken);
router.delete("/logout", logout);

export default router;
