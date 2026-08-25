import { Business } from "../../models/Business.Model";
import AppError from "../../utilities/ErrorHandler";
import { loginWithGoogleHelper } from "../../utilities/FirebaseAuhenticationHelper";
import { Hasher } from "../../utilities/Hasher";
import { CacheService } from "../Cache.Service";
import { EmailService } from "../Email.Service";
import { AuthenticationTokenGenerator } from "../Unique.Service";
import { StaffRoleService } from "./StaffRole.Service";

export class BusinessAuthenticationService {
  private authenticationTokenGenerator: AuthenticationTokenGenerator;
  private cacheService: CacheService;
  private emailService: EmailService;
  private hasher: Hasher;
  private staffRoleService: StaffRoleService;

  constructor(
    authenticationTokenGenerator: AuthenticationTokenGenerator,
    cacheService: CacheService,
    emailService: EmailService,
    hasher: Hasher,
    staffRoleService: StaffRoleService,
  ) {
    this.authenticationTokenGenerator = authenticationTokenGenerator;
    this.cacheService = cacheService;
    this.emailService = emailService;
    this.hasher = hasher;
    this.staffRoleService = staffRoleService;
  }

  public async register(payload: any) {
    const { name, username, email, phone, password } = payload;
    const normalizedEmail = email.toLowerCase();

    const existing = await Business.findOne({
      $or: [{ email: normalizedEmail }, { phone }, { username }],
    });

    if (existing) {
      if (existing.email === normalizedEmail) {
        throw new AppError(409, "Email is already in use");
      }
      if (existing.phone === phone) {
        throw new AppError(409, "Phone number is already in use");
      }
      if (existing.username === username) {
        throw new AppError(409, "Username is already taken");
      }
    }

    const slug = await this.generateUniqueSlug(username);
    const hashedPassword = await this.hasher.hashPassword(password);

    const business = await Business.create({
      name,
      username,
      slug,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      status: "pending",
      isEmailVerified: false,
    });

    await this.staffRoleService.seedDefaultRoles(business.id);

    const otp = this.authenticationTokenGenerator.generateOTP(6);
    await this.cacheService.cacheBizEmailVerificationOTP(email, otp);
    await this.emailService.sendBusinessEmailVerification({ email, otp, name });
    await this.emailService.sendNewBusinessAdminNotification({
      name: business.name,
      username: business.username,
      slug: business.slug,
      email: business.email,
      phone: business.phone,
      status: business.status,
      kycStatus: business.kycStatus,
      authProvider: business.authProvider,
      createdAt: business.createdAt,
    });

    return business;
  }

  public async verifyEmail(payload: any) {
    const { email, otp } = payload;

    const cached =
      await this.cacheService.getCachedBizEmailVerificationOTP(email);
    if (JSON.parse(cached).otp !== otp) {
      throw new AppError(401, "Invalid OTP");
    }

    const business = await Business.findOne({ email: email.toLowerCase() });
    if (!business) throw new AppError(404, "Business not found");

    business.isEmailVerified = true;
    business.status = "active";
    await business.save();

    await this.emailService.sendBusinessWelcomeEmail({
      email,
      name: business.name,
    });

    const { accessToken, refreshToken } = await this.getAuthorizationToken(
      business.id,
    );

    return { business, accessToken, refreshToken };
  }

  public async sendBusinessEmailVerification(email: string) {
    const business = await Business.findOne({
      email: email.toLowerCase().trim(),
    });
    if (!business) {
      throw new AppError(404, "Business not found");
    }

    if (business.isEmailVerified === true) {
      throw new AppError(400, "Email has already been verified");
    }

    // Generate OTP
    const otp = this.authenticationTokenGenerator.generateOTP(6);
    await this.cacheService.cacheBizEmailVerificationOTP(email, otp);
    await this.emailService.sendBusinessEmailVerification({
      email,
      otp,
      name: business.name,
    });

    return;
  }

  public async login(payload: any) {
    const { email, password } = payload;

    const business = await Business.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });
    if (!business) throw new AppError(400, "Invalid login credentials!");

    const passwordVerification = await this.hasher.verifyPassword(
      password,
      business.password!,
    );
    if (!passwordVerification)
      throw new AppError(400, "Invalid login credentials!");

    if (!business.isEmailVerified) {
      throw new AppError(403, "Please verify your email before logging in");
    }

    if (business.status === "suspended") {
      throw new AppError(
        403,
        "Your account has been suspended, please contact support",
      );
    }

    if (business.twoFactorAuthentication) {
      await this.sendLogin2FAVerification(email);
      return { twoFactorAuthentication: true };
    }

    const { accessToken, refreshToken } = await this.getAuthorizationToken(
      business.id,
    );
    return {
      business,
      accessToken,
      refreshToken,
      twoFactorAuthentication: false,
    };
  }

  public async sendLogin2FAVerification(email: string) {
    const otp = this.authenticationTokenGenerator.generateOTP(6);
    await this.cacheService.cacheBizLoginOTP(email, otp);
    await this.emailService.sendBusinessLoginOTP({ email, otp });
    return;
  }

  public async verifyLoginOTP(payload: any) {
    const { email, otp } = payload;

    const cached = await this.cacheService.getCachedBizLoginOTP(email);
    if (JSON.parse(cached).otp !== otp) {
      throw new AppError(401, "Invalid verification code");
    }

    const business = await Business.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });
    if (!business) throw new AppError(400, "Invalid login credentials!");

    const { accessToken, refreshToken } = await this.getAuthorizationToken(
      business.id,
    );
    return { business, accessToken, refreshToken };
  }

  public async forgotPassword(payload: any) {
    const { email } = payload;

    const business = await Business.findOne({ email: email.toLowerCase() });
    if (!business) throw new AppError(404, "Business not found");

    const otp = this.authenticationTokenGenerator.generateOTP(6);
    await this.cacheService.cacheBizPasswordResetOTP(email, otp);
    this.emailService.sendBusinessPasswordResetOTP({ email, otp });
    return;
  }

  public async resetPassword(payload: any) {
    const { email, otp, password } = payload;

    const business = await Business.findOne({ email: email.toLowerCase() });
    if (!business) throw new AppError(404, "Business not found");

    const cached = await this.cacheService.getCachedBizPasswordResetOTP(email);
    if (JSON.parse(cached).otp !== otp) {
      throw new AppError(401, "Invalid OTP");
    }

    business.password = await this.hasher.hashPassword(password);
    await business.save();
    return;
  }

  public async getAccessToken(filter: any) {
    const { refreshToken } = filter;
    const cachedBusinessId =
      await this.cacheService.getAuthorizationToken(refreshToken);
    if (!cachedBusinessId) throw new AppError(401, "Invalid refresh token");

    const business = await Business.findOne({
      _id: cachedBusinessId,
      isDeleted: false,
    });
    if (!business) throw new AppError(404, "Business not found");

    const accessToken = this.authenticationTokenGenerator.generateToken({
      businessId: business._id,
      type: "business",
    });
    return { accessToken };
  }

  public async logout(refreshToken: string) {
    await this.cacheService.deleteCachedData(refreshToken);
    return;
  }

  public async loginWithGoogle(payload: { idToken: string }) {
    const { idToken } = payload;

    const { uid, email, firstname, lastname, emailVerified } =
      await loginWithGoogleHelper(idToken);

    let business = await Business.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });

    if (business) {
      if (!business.googleUid) {
        business.googleUid = uid;
        await business.save();
      }
    } else {
      const displayName =
        firstname || lastname
          ? `${firstname} ${lastname}`.trim()
          : email.split("@")[0];

      business = await Business.create({
        name: displayName,
        email: email.toLowerCase(),
        googleUid: uid,
        authProvider: "google",
        isEmailVerified: emailVerified,
        status: "active",
        isProfileComplete: false,
      });

      await this.staffRoleService.seedDefaultRoles(business.id);
    }

    const { accessToken, refreshToken } = await this.getAuthorizationToken(
      business.id,
    );

    return {
      business,
      accessToken,
      refreshToken,
      isProfileComplete: business.isProfileComplete ?? false,
    };
  }

  public async checkUsernameAvailability(username: string) {
    const existing = await Business.findOne({
      username: username.toLowerCase(),
    });
    return { available: !existing };
  }

  private async getAuthorizationToken(businessId: string) {
    const accessToken = this.authenticationTokenGenerator.generateToken({
      businessId,
      type: "business",
    });
    const refreshToken = this.authenticationTokenGenerator.generateRefreshToken(
      {
        businessId,
        type: "business",
      },
    );
    await this.cacheService.cacheAuthorizationToken(businessId, refreshToken);
    return { accessToken, refreshToken };
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    let slug = base;
    let counter = 1;
    while (await Business.findOne({ slug })) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }
}
