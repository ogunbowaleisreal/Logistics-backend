import Mailgun from "mailgun.js";
import formData from "form-data";
import ejs from "ejs";
import logger from "../../logger";

const mailgun = new Mailgun(formData);
const apiKey = process.env.MAILGUN_API_KEY as string;
const domain = process.env.MAILGUN_DOMAIN as string;
const sender = process.env.MAILGUN_SENDER as string;

const mg = mailgun.client({ username: "api", key: apiKey });

export class EmailService {
  async sendVerificationEmail(payload: any): Promise<void> {
    const { email, otp } = payload;
    try {
      // const template = await ejs.renderFile("email_templates/otp.ejs", {
      //   email,
      //   otp,
      // });

      const response = await mg.messages.create(domain, {
        from: `SME Logistics ${sender}`,
        to: email,
        subject: "Your SME Logistics Account Verification Code",
        html: `Your verification code is: ${otp}`,
      });
      logger.info("Account verification email sent");
    } catch (error: any) {
      console.log(error);
      logger.error(`Verification email error: ${error.message}`);
    }
  }

  async sendPasswordResetOTP(payload: any): Promise<void> {
    const { email, otp } = payload;
    try {
      // const template = await ejs.renderFile("email_templates/otp.ejs", {
      //   email,
      //   otp,
      // });
      const response = await mg.messages.create(domain, {
        from: `SME Logistics ${sender}`,
        to: email,
        subject: "Update Your SME Logistics Password",
        html: `Your password update code is: ${otp}`,
      });
      logger.info(`Password update email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Password update email error: ${error.message}`);
    }
  }

  async sendWelcomeEmail(payload: any): Promise<void> {
    const { email } = payload;
    // console.log(email);
    try {
      // const template = await ejs.renderFile("email_templates/Welcome.ejs", {
      //   email,
      // });
      const response = await mg.messages.create(domain, {
        from: `SME Logistics ${sender}`,
        to: email,
        subject: "Welcome to SME Logistics",
        html: `Welcome to SME Logistics`,
      });
      logger.info(`Welcome email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Welcome email error: ${error.message}`);
    }
  }

  async sendLoginOTP(payload: any): Promise<void> {
    const { email, otp } = payload;
    // console.log(email, otp);
    try {
      // const template = await ejs.renderFile("email_templates/otp.ejs", {
      //   email,
      //   otp,
      // });
      const response = await mg.messages.create(domain, {
        from: `SME Logistics ${sender}`,
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
      // const template = await ejs.renderFile("email_templates/Welcome.ejs", {
      //   email,
      // });
      const response = await mg.messages.create(domain, {
        from: `SME Logistics ${sender}`,
        to: email,
        subject: "Welcome to SME Logistics",
        html: `Welcome to SME Logistics
        Email: ${email}
        Here's your temporary password: ${password}
        `,
      });
      logger.info(`Welcome email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Welcome email error: ${error.message}`);
    }
  }

  async sendBusinessEmailVerification(payload: any): Promise<void> {
    const { email, otp, name } = payload;
    try {
      await mg.messages.create(domain, {
        from: `SME Logistics ${sender}`,
        to: email,
        subject: "Verify Your SME Logistics Business Account",
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
      await mg.messages.create(domain, {
        from: `SME Logistics ${sender}`,
        to: email,
        subject: "Welcome to SME Logistics",
        html: `Hi ${name},<br><br>Welcome to SME Logistics! Your business account has been successfully verified and is now active.`,
      });
      logger.info(`Business welcome email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Business welcome email error: ${error.message}`);
    }
  }

  async sendBusinessLoginOTP(payload: any): Promise<void> {
    const { email, otp } = payload;
    try {
      await mg.messages.create(domain, {
        from: `SME Logistics ${sender}`,
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
      await mg.messages.create(domain, {
        from: `SME Logistics ${sender}`,
        to: email,
        subject: "Reset Your SME Logistics Business Password",
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
      await mg.messages.create(domain, {
        from: `SME Logistics ${sender}`,
        to: email,
        subject: "Welcome to the Team — SME Logistics",
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
      await mg.messages.create(domain, {
        from: `SME Logistics ${sender}`,
        to: email,
        subject: "Reset Your SME Logistics Staff Password",
        html: `Hi ${firstname},<br><br>Your password reset code is: <strong>${otp}</strong><br><br>This code expires in 15 minutes.`,
      });
      logger.info(`Staff password reset email sent to: ${email}`);
    } catch (error: any) {
      logger.error(`Staff password reset email error: ${error.message}`);
    }
  }

  // async sendBatchEmail(payload: {
  //   message: string;
  //   subject: string;
  //   recipients: string[];
  // }) {
  //   const { message, subject, recipients } = payload;
  //   // console.log(message, subject, recipients);
  //   try {
  //     const response = await mg.messages.create(domain, {
  //       from: `SME Logistics ${sender}`,
  //       to: recipients,
  //       subject: subject,
  //       html: message,
  //     });
  //     logger.info(`Batch Email Successfully Sent`);
  //   } catch (error: any) {
  //     logger.error(`Batch Email Failed: ${error.message}`);
  //   }
  // }
}
