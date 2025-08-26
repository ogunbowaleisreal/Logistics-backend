import { Router } from "express";
import {
  registerAccountController,
  loginController,
  verifyAccountController,
  forgotPasswordController,
  resetPasswordController,
  accessTokenController,
  sendVerificationEmailController,
  logoutController,
  verifyPasswordResetOTPController,
  socialLoginController,
  // completeRegistrationController,
} from "../../controllers/client/authentication.controller";
// import { loginWithGoogle } from "../../middlewares/socialLogin.middleware";

const router = Router();

router.post("", registerAccountController);


// router.post("/complete-registration", completeRegistrationController);

router.post("/login", loginController);

router.get("/request-verification", sendVerificationEmailController);

// router.post("/login-with-google", loginWithGoogle, socialLoginController);

router.patch("/verify-account", verifyAccountController);

router.post("/forgot-password", forgotPasswordController);

router.post("/verify-reset-otp", verifyPasswordResetOTPController);

router.put("/reset-password", resetPasswordController);

router.get("/access-token", accessTokenController);

router.delete("/logout", logoutController);

export default router;
