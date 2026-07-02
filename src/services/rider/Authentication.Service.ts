import { redisClient } from "../../config/cache";
import { Rider } from "../../models/Rider.Model";
import { AuthenticationTokenGenerator } from "../Unique.Service";
import { resolveBusinessIdFromSlug } from "../../middlewares/authorization.middleware";
import AppError from "../../utilities/ErrorHandler";
import { termiiService } from "../../utilities/Termii";

export class RiderAuthenticationService {
  constructor(
    private readonly authenticationTokenGenerator = new AuthenticationTokenGenerator(),
  ) {}

  public async requestOTP(phone: string, businessSlug: string): Promise<void> {
    const businessId = await resolveBusinessIdFromSlug(businessSlug);

    const rider = await Rider.findOne({ phone, businessId, isDeleted: false });

    if (!rider) {
      throw new AppError(404, "Rider not found");
    }

    if (rider.status === "suspended") {
      throw new AppError(403, "Your account has been suspended");
    }

    const otp = this.authenticationTokenGenerator.generateOTP(6);
    await redisClient.setEx(`rider-otp:${rider.id}`, 300, otp);
    void termiiService.sendRiderOTP(rider.phone, otp);
  }

  public async verifyOTP(
    phone: string,
    businessSlug: string,
    otp: string,
  ): Promise<{ accessToken: string }> {
    const businessId = await resolveBusinessIdFromSlug(businessSlug);
    const rider = await Rider.findOne({ phone, businessId, isDeleted: false });

    if (!rider) {
      throw new AppError(404, "Rider not found");
    }

    // if (otp != "123456") {
    //   throw new AppError(400, "Invalid OTP");
    // }

    const cacheKey = `rider-otp:${rider.id}`;
    const cachedOTP = await redisClient.get(cacheKey);

    if (!cachedOTP) {
      throw new AppError(400, "OTP expired or not requested");
    }

    if (cachedOTP !== otp) {
      throw new AppError(400, "Invalid OTP");
    }

    await redisClient.del(cacheKey);

    const accessToken = this.authenticationTokenGenerator.generateToken({
      riderId: rider._id,
      businessId,
      type: "rider",
    });

    return { accessToken };
  }
}
