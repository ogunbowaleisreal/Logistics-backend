import { Resend } from "resend";
import logger from "../../logger";

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.RESEND_SENDER as string;

export class EmailService {
  async sendVerificationEmail(payload: any): Promise<void> {
    const { email, otp } = payload;
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Your LogisticsPadi Account Verification Code",
        html: `Your verification code is: ${otp}`,
      });
      logger.info("Account verification email sent");
    } catch (error: any) {
      logger.error(`Verification email error: ${error.message}`);
    }
  }

  async sendPasswordResetOTP(payload: any): Promise<void> {
    const { email, otp } = payload;
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Update Your LogisticsPadi Password",
        html: `Your password update code is: ${otp}`,
      });
      logger.info(`Password update email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Password update email error: ${error.message}`);
    }
  }

  async sendWelcomeEmail(payload: any): Promise<void> {
    const { email } = payload;
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Welcome to LogisticsPadi",
        html: `Welcome to LogisticsPadi`,
      });
      logger.info(`Welcome email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Welcome email error: ${error.message}`);
    }
  }

  async sendLoginOTP(payload: any): Promise<void> {
    const { email, otp } = payload;
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Important: Login 2FA",
        html: `Your login 2FA code is: ${otp}`,
      });
      logger.info(`Login OTP email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Login OTP email error: ${error.message}`);
    }
  }

  async sendAdminWelcomeEmail(payload: any): Promise<void> {
    const { password, email } = payload;
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Welcome to LogisticsPadi",
        html: `Welcome to LogisticsPadi<br>Email: ${email}<br>Here's your temporary password: ${password}`,
      });
      logger.info(`Welcome email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Welcome email error: ${error.message}`);
    }
  }

  async sendBusinessEmailVerification(payload: any): Promise<void> {
    const { email, otp, name } = payload;
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Verify Your LogisticsPadi Business Account",
        html: `Hi ${name},<br><br>Your email verification code is: <strong>${otp}</strong><br><br>This code expires in 5 minutes.`,
      });
      logger.info(`Business verification email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Business verification email error: ${error.message}`);
    }
  }

  async sendBusinessWelcomeEmail(payload: any): Promise<void> {
    const { email, name } = payload;
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Welcome to LogisticsPadi",
        html: `Hi ${name},<br><br>Welcome to LogisticsPadi! Your business account has been successfully verified and is now active.`,
      });
      logger.info(`Business welcome email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Business welcome email error: ${error.message}`);
    }
  }

  async sendBusinessLoginOTP(payload: any): Promise<void> {
    const { email, otp } = payload;
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Important: Business Login 2FA",
        html: `Your login 2FA code is: <strong>${otp}</strong>`,
      });
      logger.info(`Business login OTP email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Business login OTP email error: ${error.message}`);
    }
  }

  async sendBusinessPasswordResetOTP(payload: any): Promise<void> {
    const { email, otp } = payload;
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Reset Your LogisticsPadi Business Password",
        html: `Your password reset code is: <strong>${otp}</strong><br><br>This code expires in 15 minutes.`,
      });
      logger.info(`Business password reset email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Business password reset email error: ${error.message}`);
    }
  }

  async sendStaffWelcomeEmail(payload: any): Promise<void> {
    const { email, firstname, password } = payload;
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Welcome to the Team — LogisticsPadi",
        html: `Hi ${firstname},<br><br>Your staff account has been created.<br><br>Email: ${email}<br>Temporary Password: <strong>${password}</strong><br><br>Please log in and change your password.`,
      });
      logger.info(`Staff welcome email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Staff welcome email error: ${error.message}`);
    }
  }

  async sendStaffPasswordResetOTP(payload: any): Promise<void> {
    const { email, otp, firstname } = payload;
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Reset Your LogisticsPadi Staff Password",
        html: `Hi ${firstname},<br><br>Your password reset code is: <strong>${otp}</strong><br><br>This code expires in 15 minutes.`,
      });
      logger.info(`Staff password reset email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Staff password reset email error: ${error.message}`);
    }
  }

  async sendOrderConfirmation(payload: any): Promise<void> {
    const { email, name, trackingID, amount } = payload;
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Your Order Has Been Placed",
        html: `Hi ${name},<br><br>Your order has been placed successfully.<br><br>Tracking ID: <strong>${trackingID}</strong><br>Amount: <strong>${amount}</strong>`,
      });
      logger.info(`Order confirmation email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Order confirmation email error: ${error.message}`);
    }
  }

  async sendWaitlistConfirmationEmail(payload: any): Promise<void> {
    const { email, fullName } = payload;
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "You're on the Waitlist — LogisticsPadi",
        html: `Hi ${fullName},<br><br>Thank you for requesting early access to LogisticsPadi! You're officially on the waitlist.<br><br>We'll notify you as soon as your spot is ready.`,
      });
      logger.info(`Waitlist confirmation email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Waitlist confirmation email error: ${error.message}`);
    }
  }

  async sendOrderStatusUpdate(payload: any): Promise<void> {
    const { email, name, trackingID, status } = payload;
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Your Order Status Has Been Updated",
        html: `Hi ${name},<br><br>Your order status has been updated.<br><br>Tracking ID: <strong>${trackingID}</strong><br>Status: <strong>${status}</strong>`,
      });
      logger.info(`Order status update email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Order status update email error: ${error.message}`);
    }
  }

  async sendPaymentReviewNotification(payload: any): Promise<void> {
    const { email, name, trackingID } = payload;
    try {
      await resend.emails.send({
        from,
        to: email,
        subject: "Proof of Payment Received — Under Review",
        html: `Hi ${name},<br><br>We have received your proof of payment and it is now under review.<br><br>Tracking ID: <strong>${trackingID}</strong>`,
      });
      logger.info(`Payment review email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Payment review email error: ${error.message}`);
    }
  }
}
