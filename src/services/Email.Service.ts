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
