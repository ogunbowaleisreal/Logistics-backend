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
  checkUsernameAvailability,
} from "../../controllers/business/authentication.controller";
import { validate } from "../../middlewares/validation.middleware";
import {
  registerBusinessSchema,
  checkUsernameSchema,
} from "../../validators/business.validator";

const router = Router();

router.post("/register", validate(registerBusinessSchema, "body"), register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.get("/send-login-otp", sendLogin2FAVerification);
router.patch("/verify-login-otp", verifyLoginOTP);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.get("/access-token", generateNewAccessToken);
router.delete("/logout", logout);
router.get("/check-username", validate(checkUsernameSchema, "query"), checkUsernameAvailability);

export default router;
