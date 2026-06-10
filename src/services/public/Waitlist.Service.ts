import { Waitlist } from "../../models/Waitlist.Model";
import { EmailService } from "../Email.Service";
import AppError from "../../utilities/ErrorHandler";

const emailService = new EmailService();

export class WaitlistService {
  public async joinWaitlist(payload: any) {
    const { fullName, businessName, phone, email } = payload;

    const phoneExists = await Waitlist.findOne({ phone });
    if (phoneExists) {
      throw new AppError(409, "This phone number is already on the waitlist");
    }

    if (email) {
      const emailExists = await Waitlist.findOne({ email });
      if (emailExists) {
        throw new AppError(409, "This email address is already on the waitlist");
      }
    }

    const entry = await Waitlist.create({ fullName, businessName, phone, email });

    if (email) {
      emailService.sendWaitlistConfirmationEmail({ email, fullName });
    }

    return entry;
  }
}
