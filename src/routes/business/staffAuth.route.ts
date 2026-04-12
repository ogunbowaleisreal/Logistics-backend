import express from "express";
import {
  login,
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
  generateNewAccessToken,
  logout,
} from "../../controllers/business/staffAuth.controller";

const router = express.Router();

router.post("/login", login);
router.patch("/verify-login-otp", verifyLoginOTP);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.get("/access-token", generateNewAccessToken);
router.delete("/logout", logout);

export default router;
