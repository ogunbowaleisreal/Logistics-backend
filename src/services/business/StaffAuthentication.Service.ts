import { Business } from "../../models/Business.Model";
import { Staff } from "../../models/Staff.Model";
import AppError from "../../utilities/ErrorHandler";
import { Hasher } from "../../utilities/Hasher";
import { CacheService } from "../Cache.Service";
import { EmailService } from "../Email.Service";
import { AuthenticationTokenGenerator } from "../Unique.Service";

export class StaffAuthenticationService {
  private authenticationTokenGenerator: AuthenticationTokenGenerator;
  private cacheService: CacheService;
  private emailService: EmailService;
  private hasher: Hasher;

  constructor(
    authenticationTokenGenerator: AuthenticationTokenGenerator,
    cacheService: CacheService,
    emailService: EmailService,
    hasher: Hasher,
  ) {
    this.authenticationTokenGenerator = authenticationTokenGenerator;
    this.cacheService = cacheService;
    this.emailService = emailService;
    this.hasher = hasher;
  }

  public async login(payload: any) {
    const { businessSlug, email, password } = payload;

    const business = await Business.findOne({
      slug: businessSlug,
      status: "active",
      isDeleted: false,
    });
    if (!business) throw new AppError(404, "Business not found");

    const staff = await Staff.findOne({
      businessId: business._id as any,
      email: email.toLowerCase(),
      isDeleted: false,
    }).populate("role");
    if (!staff) throw new AppError(400, "Invalid login credentials!");

    const passwordValid = await this.hasher.verifyPassword(
      password,
      staff.password!,
    );
    if (!passwordValid) throw new AppError(400, "Invalid login credentials!");

    if (staff.status === "suspended") {
      throw new AppError(
        403,
        "Your account has been suspended, please contact your administrator",
      );
    }

    if (staff.twoFactorAuthentication) {
      await this.sendLogin2FA((business._id as any).toString(), email);
      return { twoFactorAuthentication: true };
    }

    const { accessToken, refreshToken } = await this.getAuthorizationToken(
      staff.id,
      (business._id as any).toString(),
    );
    return { staff, accessToken, refreshToken, twoFactorAuthentication: false };
  }

  public async sendLogin2FA(businessId: string, email: string) {
    const otp = this.authenticationTokenGenerator.generateOTP(6);
    await this.cacheService.cacheStaffLoginOTP(businessId, email, otp);
    // reuse staff welcome email pattern — or a dedicated method could be added
    return;
  }

  public async verifyLoginOTP(payload: any) {
    const { businessSlug, email, otp } = payload;

    const business = await Business.findOne({
      slug: businessSlug,
      status: "active",
      isDeleted: false,
    });
    if (!business) throw new AppError(404, "Business not found");

    const cached = await this.cacheService.getCachedStaffLoginOTP(
      (business._id as any).toString(),
      email,
    );
    if (JSON.parse(cached).otp !== otp)
      throw new AppError(401, "Invalid verification code");

    const staff = await Staff.findOne({
      businessId: business._id as any,
      email: email.toLowerCase(),
      isDeleted: false,
    }).populate("role");
    if (!staff) throw new AppError(400, "Invalid login credentials!");

    const { accessToken, refreshToken } = await this.getAuthorizationToken(
      staff.id,
      (business._id as any).toString(),
    );
    return { staff, accessToken, refreshToken };
  }

  public async forgotPassword(payload: any) {
    const { businessSlug, email } = payload;

    const business = await Business.findOne({
      slug: businessSlug,
      isDeleted: false,
    });
    if (!business) throw new AppError(404, "Business not found");

    const staff = await Staff.findOne({
      businessId: business._id as any,
      email: email.toLowerCase(),
      isDeleted: false,
    });
    if (!staff) throw new AppError(404, "Staff not found");

    const otp = this.authenticationTokenGenerator.generateOTP(6);
    await this.cacheService.cacheStaffPasswordResetOTP(
      (business._id as any).toString(),
      email,
      otp,
    );
    await this.emailService.sendStaffPasswordResetOTP({
      email: email.toLowerCase(),
      otp,
      firstname: staff.firstname,
    });
    return;
  }

  public async resetPassword(payload: any) {
    const { businessSlug, email, otp, password } = payload;

    const business = await Business.findOne({
      slug: businessSlug,
      isDeleted: false,
    });
    if (!business) throw new AppError(404, "Business not found");

    const staff = await Staff.findOne({
      businessId: business._id as any,
      email: email.toLowerCase(),
      isDeleted: false,
    });
    if (!staff) throw new AppError(404, "Staff not found");

    const cached = await this.cacheService.getCachedStaffPasswordResetOTP(
      (business._id as any).toString(),
      email,
    );
    if (JSON.parse(cached).otp !== otp) throw new AppError(401, "Invalid OTP");

    staff.password = await this.hasher.hashPassword(password);
    await staff.save();
    return;
  }

  public async getAccessToken(filter: any) {
    const { refreshToken } = filter;
    const cachedStaffId =
      await this.cacheService.getAuthorizationToken(refreshToken);
    if (!cachedStaffId) throw new AppError(401, "Invalid refresh token");

    const staff = await Staff.findOne({ _id: cachedStaffId, isDeleted: false });
    if (!staff) throw new AppError(404, "Staff not found");

    const accessToken = this.authenticationTokenGenerator.generateToken({
      staffId: staff._id,
      businessId: staff.businessId,
      type: "staff",
    });
    return { accessToken };
  }

  public async logout(refreshToken: string) {
    await this.cacheService.deleteCachedData(refreshToken);
    return;
  }

  private async getAuthorizationToken(staffId: string, businessId: string) {
    const accessToken = this.authenticationTokenGenerator.generateToken({
      staffId,
      businessId,
      type: "staff",
    });
    const refreshToken = this.authenticationTokenGenerator.generateRefreshToken(
      {
        staffId,
        businessId,
        type: "staff",
      },
    );
    await this.cacheService.cacheAuthorizationToken(staffId, refreshToken);
    return { accessToken, refreshToken };
  }
}
