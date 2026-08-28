import { Resend } from "resend";
import logger from "../../logger";
import {
  verificationEmailTemplate,
  passwordResetOTPTemplate,
  welcomeEmailTemplate,
  loginOTPTemplate,
  adminWelcomeEmailTemplate,
  businessEmailVerificationTemplate,
  businessWelcomeEmailTemplate,
  businessLoginOTPTemplate,
  businessPasswordResetOTPTemplate,
  staffWelcomeEmailTemplate,
  staffPasswordResetOTPTemplate,
  orderConfirmationTemplate,
  orderConfirmationToBusinessTemplate,
  waitlistConfirmationEmailTemplate,
  orderStatusUpdateTemplate,
  paymentReviewNotificationTemplate,
  withdrawalSuccessEmailTemplate,
  newBusinessRegisteredAdminTemplate
} from "../utilities/EmailTemplates";

const resend = new Resend(process.env.RESEND_API_KEY);
const from = process.env.RESEND_SENDER as string;

interface BulkEmailPayload {
  email: string;
  subject: string;
  html: string;
}

interface BulkEmailResult {
  success: number;
  failed: number;
  errors: { email: string; error: string }[];
}



export class EmailService {
  async sendVerificationEmail(payload: any): Promise<void> {
    const { email, otp } = payload;
    try {
      await resend.emails.send({
        from: `LogisticsPadi <${from}>`,
        to: email,
        subject: "Your LogisticsPadi Account Verification Code",
        html: verificationEmailTemplate(otp),
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
        from: `LogisticsPadi <${from}>`,
        to: email,
        subject: "Update Your LogisticsPadi Password",
        html: passwordResetOTPTemplate(otp),
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
        from: `LogisticsPadi <${from}>`,
        to: email,
        subject: "Welcome to LogisticsPadi",
        html: welcomeEmailTemplate(),
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
        from: `LogisticsPadi <${from}>`,
        to: email,
        subject: "Important: Login 2FA",
        html: loginOTPTemplate(otp),
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
        from: `LogisticsPadi <${from}>`,
        to: email,
        subject: "Welcome to LogisticsPadi",
        html: adminWelcomeEmailTemplate(email, password),
      });
      logger.info(`Welcome email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Welcome email error: ${error.message}`);
    }
  }

  // ---- Business account emails (business's own logo/name, since it's their login/account) ----

  async sendBusinessEmailVerification(payload: any): Promise<void> {
    const { email, otp, name, businessName, businessLogo } = payload;
    const brand = businessName || "LogisticsPadi";
    try {
      await resend.emails.send({
        from: `LogisticsPadi <${from}>`,
        to: email,
        subject: "Verify Your LogisticsPadi Business Account",
        html: businessEmailVerificationTemplate(name, otp, brand, businessLogo),
      });
      logger.info(`Business verification email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Business verification email error: ${error.message}`);
    }
  }

  async sendNewBusinessAdminNotification(business: {
    name: string;
    username?: string;
    slug?: string;
    email: string;
    phone?: string;
    status: string;
    kycStatus?: string;
    authProvider?: string;
    createdAt: Date;
  }): Promise<void> {
    const adminEmail = process.env.SUPER_ADMIN_EMAIL;

    if (!adminEmail) {
      logger.error("SUPER_ADMIN_EMAIL is not set; skipping admin notification email");
      return;
    }

    try {
      await resend.emails.send({
        from: `LogisticsPadi <${from}>`,
        to: adminEmail,
        subject: `New Business Registered: ${business.name}`,
        html: newBusinessRegisteredAdminTemplate(business),
      });
      logger.info(`Admin notified of new business registration: ${business.name}`);
    } catch (error: any) {
      logger.error(`Admin business notification email error: ${error.message}`);
    }
  }

  async sendBusinessWelcomeEmail(payload: any): Promise<void> {
    const { email, name, businessName, businessLogo } = payload;
    const brand = businessName || "LogisticsPadi";
    try {
      await resend.emails.send({
        from: `LogisticsPadi <${from}>`,
        to: email,
        subject: "Welcome to LogisticsPadi",
        html: businessWelcomeEmailTemplate(name, brand, businessLogo),
      });
      logger.info(`Business welcome email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Business welcome email error: ${error.message}`);
    }
  }

  async sendBusinessLoginOTP(payload: any): Promise<void> {
    const { email, otp, businessName, businessLogo } = payload;
    const brand = businessName || "LogisticsPadi";
    try {
      await resend.emails.send({
        from: `LogisticsPadi <${from}>`,
        to: email,
        subject: "Important: Business Login 2FA",
        html: businessLoginOTPTemplate(otp, brand, businessLogo),
      });
      logger.info(`Business login OTP email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Business login OTP email error: ${error.message}`);
    }
  }

  async sendBusinessPasswordResetOTP(payload: any): Promise<void> {
    const { email, otp, businessName, businessLogo } = payload;
    const brand = businessName || "LogisticsPadi";
    try {
      await resend.emails.send({
        from: `LogisticsPadi <${from}>`,
        to: email,
        subject: "Reset Your LogisticsPadi Business Password",
        html: businessPasswordResetOTPTemplate(otp, brand, businessLogo),
      });
      logger.info(`Business password reset email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Business password reset email error: ${error.message}`);
    }
  }

  // ---- Staff emails (branded per-business, since staff belong to a business) ----

  async sendStaffWelcomeEmail(payload: any): Promise<void> {
    const { email, firstname, password, businessName, businessLogo } = payload;
    const brand = businessName || "LogisticsPadi";
    try {
      await resend.emails.send({
        from: `${brand} <${from}>`,
        to: email,
        subject: `Welcome to the Team — ${brand}`,
        html: staffWelcomeEmailTemplate(firstname, email, password, brand, businessLogo),
      });
      logger.info(`Staff welcome email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Staff welcome email error: ${error.message}`);
    }
  }

  async sendStaffPasswordResetOTP(payload: any): Promise<void> {
    const { email, otp, firstname, businessName, businessLogo } = payload;
    const brand = businessName || "LogisticsPadi";
    try {
      await resend.emails.send({
        from: `${brand} <${from}>`,
        to: email,
        subject: `Reset Your ${brand} Staff Password`,
        html: staffPasswordResetOTPTemplate(firstname, otp, brand, businessLogo),
      });
      logger.info(`Staff password reset email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Staff password reset email error: ${error.message}`);
    }
  }

  // ---- Order emails ----

  async sendOrderConfirmation(payload: any): Promise<void> {
    const {
      email,
      name,
      trackingID,
      amount,
      status,
      businessName,
      businessSlug,
      businessLogo,
    } = payload;
    const brand = businessName || "LogisticsPadi";
    try {
      await resend.emails.send({
        from: `${brand} <${from}>`,
        to: email,
        subject: "Your Order Has Been Placed",
        html: orderConfirmationTemplate(
          name,
          trackingID,
          amount,
          status,
          businessSlug,
          brand,
          businessLogo
        ),
      });
      logger.info(`Order confirmation email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Order confirmation email error: ${error.message}`);
    }
  }

  async sendOrderConfirmationToBusiness(payload: any): Promise<void> {
    const {
      email,
      trackingID,
      amount,
      businessName,
      businessSlug,
      shippingType,
      pickupLocation,
      dropoffLocation,
      zone,
      senderName,
      receiverName,
      businessLogo,
    } = payload;
    const brand = businessName || "LogisticsPadi";
    try {
      await resend.emails.send({
        from: `${brand} <${from}>`,
        to: email,
        subject: "An Order Has Been Placed",
        html: orderConfirmationToBusinessTemplate(
          {
            trackingID,
            amount,
            shippingType,
            pickupLocation,
            dropoffLocation,
            zone,
            senderName,
            receiverName,
            businessSlug,
          },
          brand,
          businessLogo
        ),
      });
      logger.info(`Order confirmation email sent to business: ${email}`);
    } catch (error: any) {
      logger.error(`Order confirmation (business) email error: ${error.message}`);
    }
  }

  async sendOrderStatusUpdate(payload: any): Promise<void> {
    const { email, name, trackingID, status, businessName, slug, amount, businessLogo } = payload;
    const brand = businessName || "LogisticsPadi";
    try {
      await resend.emails.send({
        from: `${brand} <${from}>`,
        to: email,
        subject: "Your Order Status Has Been Updated",
        html: orderStatusUpdateTemplate(name, trackingID, status, amount, slug, brand, businessLogo),
      });
      logger.info(`Order status update email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Order status update email error: ${error.message}`);
    }
  }

  async sendPaymentReviewNotification(payload: any): Promise<void> {
    const { email, name, trackingID, businessName, businessLogo } = payload;
    const brand = businessName || "LogisticsPadi";
    try {
      await resend.emails.send({
        from: `LogisticsPadi <${from}>`,
        to: email,
        subject: "Proof of Payment Received — Under Review",
        html: paymentReviewNotificationTemplate(name, trackingID, brand, businessLogo),
      });
      logger.info(`Payment review email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Payment review email error: ${error.message}`);
    }
  }

  async sendWaitlistConfirmationEmail(payload: any): Promise<void> {
    const { email, fullName } = payload;
    try {
      await resend.emails.send({
        from: `LogisticsPadi <${from}>`,
        to: email,
        subject: "You're on the Waitlist — LogisticsPadi",
        html: waitlistConfirmationEmailTemplate(fullName),
      });
      logger.info(`Waitlist confirmation email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Waitlist confirmation email error: ${error.message}`);
    }
  }

  async sendWithdrawalSuccessEmail(payload: {
    email: string;
    name: string;
    amount: number;
    reference: string;
    bankSnapshot: {
      accountName: string;
      accountNumber: string;
      bankName: string;
    };
  }): Promise<void> {
    const { email, name, amount, reference, bankSnapshot } = payload;
    try {
      await resend.emails.send({
        from: `LogisticsPadi <${from}>`,
        to: email,
        subject: "Withdrawal Successful",
        html: withdrawalSuccessEmailTemplate(
          name,
          amount,
          reference,
          bankSnapshot,
        ),
      });
      logger.info(`Withdrawal success email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Withdrawal success email error: ${error.message}`);
    }
  }

  async sendBulkEmails(
    payloads: BulkEmailPayload[],
    options?: { fromName?: string; batchSize?: number }
  ): Promise<BulkEmailResult> {
    const batchSize = options?.batchSize ?? 100; // Resend's batch limit
    const senderName = options?.fromName || "LogisticsPadi";
    const errors: { email: string; error: string }[] = [];
    let success = 0;

    for (let i = 0; i < payloads.length; i += batchSize) {
      const chunk = payloads.slice(i, i + batchSize);
      try {
        const { data, error } = await resend.batch.send(
          chunk.map((p) => ({
            from: `${senderName} <${from}>`,
            to: p.email,
            subject: p.subject,
            html: p.html,
          }))
        );

        if (error) {
          logger.error(`Bulk email batch error: ${error.message}`);
          chunk.forEach((p) => errors.push({ email: p.email, error: error.message }));
        } else {
          success += chunk.length;
          logger.info(`Bulk email batch sent successfully: ${chunk.length} emails`);
        }
      } catch (err: any) {
        logger.error(`Bulk email batch exception: ${err.message}`);
        chunk.forEach((p) => errors.push({ email: p.email, error: err.message }));
      }
    }

    logger.info(`Bulk email job complete: ${success} sent, ${errors.length} failed`);
    return { success, failed: errors.length, errors };
  }
}
