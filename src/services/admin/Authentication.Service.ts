import logger from "../../../logger";
import { Admin } from "../../models/Admin.Model";
import AppError from "../../utilities/ErrorHandler";
import { Hasher } from "../../utilities/Hasher";
import { CacheService } from "../Cache.Service";
import { EmailService } from "../Email.Service";
import {
  AuthenticationTokenGenerator,
  PasswordGeneratorService,
} from "../Unique.Service";
import { RoleServices } from "./Role.Service";

export class AdminAuthenticationService {
  private roleService: RoleServices;
  private authenticationTokenGenerator: AuthenticationTokenGenerator;
  private passwordGenerator: PasswordGeneratorService;
  private cacheService: CacheService;
  private emailService: EmailService;
  private hasher: Hasher;

  constructor(
    roleService: RoleServices,
    authenticationTokenGenerator: AuthenticationTokenGenerator,
    passwordGenerator: PasswordGeneratorService,
    cacheService: CacheService,
    emailService: EmailService,
    hasher: Hasher
  ) {
    this.roleService = roleService;
    this.authenticationTokenGenerator = authenticationTokenGenerator;
    this.passwordGenerator = passwordGenerator;
    this.cacheService = cacheService;
    this.emailService = emailService;
    this.hasher = hasher;
  }

  public async createSuperAdmin() {
    const email = process.env.SUPER_ADMIN_EMAIL!;
    const password = process.env.SUPER_ADMIN_PASSWORD!;
    const phone = process.env.SUPER_ADMIN_PHONE!;

    await this.checkAdminExistence(email, phone);

    const role = await this.roleService.createSuperAdminRole();
    const { id: roleID } = role;

    const hashedPassword = await this.hasher.hashPassword(password);

    const admin = await Admin.create({
      firstname: process.env.SUPER_ADMIN_FIRSTNAME!,
      lastname: process.env.SUPER_ADMIN_LASTNAME!,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: roleID,
    });

    role.admins += 1;
    await role.save();

    const { accessToken, refreshToken } = await this.getAuthorizationToken(
      admin.id
    );

    return { admin, accessToken, refreshToken };
  }

  public async createAdmin(payload: any) {
    const { firstname, lastname, email, phone, role } = payload;

    // Check if admin exist
    await this.checkAdminExistence(email, phone);

    const { role: adminRole } = await this.roleService.verifyRoleByID(role);

    const adminPassword =
      this.passwordGenerator.generateTemporaryPasswordForNewAdmin(8);

    const password = await this.hasher.hashPassword(adminPassword);

    const admin = await Admin.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      phone,
      password,
      role,
    });

    adminRole.admins += 1;
    await adminRole.save();

    await this.emailService.sendAdminWelcomeEmail({
      email,
      password: adminPassword,
    });

    return admin;
  }

  public async login(payload: any) {
    const { email, password } = payload;

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      throw new AppError(400, "Invalid login credentials!");
    }

    const passwordVerification = await this.hasher.verifyPassword(
      password,
      admin.password!
    );

    if (!passwordVerification) {
      throw new AppError(400, "Invalid login credentials!");
    }

    if (admin.twoFactorAuthentication == true) {
      await this.sendLogin2FAVerification(email);
      return { twoFactorAuthentication: true };
    } else {
      const { accessToken, refreshToken } = await this.getAuthorizationToken(
        admin.id
      );
      return {
        admin,
        accessToken,
        refreshToken,
        twoFactorAuthentication: false,
      };
    }
  }

  public async sendLogin2FAVerification(email: string) {
    const otp = await this.getLoginVerificationOTP(email);
    await this.emailService.sendLoginOTP({ email, otp });
    return;
  }

  public async verifyLoginVerificationOTP(payload: any) {
    const { email, otp } = payload;

    await this.verifyLoginOTP(email, otp);

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      throw new AppError(400, "Invalid login credentials!");
    }

    const { accessToken, refreshToken } = await this.getAuthorizationToken(
      admin.id
    );
    return { admin, accessToken, refreshToken };
  }

  public async forgotPassword(payload: any) {
    const { email } = payload;
    const otp = await this.getPasswordResetOTP(email);

    this.emailService.sendPasswordResetOTP({ email, otp });
    return;
  }

  public async resetPassword(payload: any) {
    const { email, password, otp } = payload;
    let admin = await this.checkAccountExistence(email.toLowerCase());
    if (!admin) {
      throw new AppError(404, "Admin not found");
    }
    const cachedOtp = await this.cacheService.getCachedPasswordResetOTP(email);
    if (JSON.parse(cachedOtp).otp !== otp) {
      throw new AppError(401, "Invalid OTP");
    }
    admin.password = await this.hasher.hashPassword(password);
    admin = await admin.save();
    return admin;
  }

  public async getAccessToken(filter: any) {
    const { refreshToken } = filter;
    const cachedAdminID = await this.cacheService.getAuthorizationToken(
      refreshToken
    );
    if (!cachedAdminID) {
      throw new AppError(401, "Invalid refresh token");
    }
    const admin = await Admin.findOne({
      _id: cachedAdminID,
    });
    if (!admin) throw new AppError(404, "Admin not found");
    const accessToken = this.authenticationTokenGenerator.generateToken({
      adminID: admin._id,
    });

    return { accessToken };
  }

  public async logoutAccount(refreshToken: string) {
    await this.cacheService.deleteCachedData(refreshToken);
    return;
  }

  private async checkAccountExistence(email: string) {
    const admin = await Admin.findOne({
      email,
    });
    return admin;
  }

  private async getAuthorizationToken(adminID: string) {
    const accessToken = this.authenticationTokenGenerator.generateToken({
      adminID,
    });
    const refreshToken = this.authenticationTokenGenerator.generateRefreshToken(
      {
        adminID,
      }
    );

    await this.cacheService.cacheAuthorizationToken(adminID, refreshToken);
    return {
      accessToken,
      refreshToken,
    };
  }

  private async getPasswordResetOTP(email: string) {
    const otp = this.authenticationTokenGenerator.generateOTP(6);
    await this.cacheService.cachePasswordResetOTP(email, otp);
    return otp;
  }

  private async getLoginVerificationOTP(email: string) {
    const otp = this.authenticationTokenGenerator.generateOTP(6);
    await this.cacheService.cacheLoginOTP(email, otp);
    return otp;
  }

  private async verifyLoginOTP(email: string, otp: string) {
    const cachedOtp = await this.cacheService.getCachedLoginOTP(email);
    if (JSON.parse(cachedOtp).otp !== otp) {
      throw new AppError(401, "Invalid verification code");
    }
    return;
  }

  private async verifyPasswordResetOTP(email: string, otp: string) {
    const cachedOtp = await this.cacheService.getCachedPasswordResetOTP(email);
    if (JSON.parse(cachedOtp).otp !== otp) {
      throw new AppError(401, "Invalid verification code");
    }
    return;
  }

  private async checkAdminExistence(
    email: string,
    phone: string,
    error = "Admin already exists"
  ) {
    const admin = await Admin.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: phone }],
    });
    if (admin) throw new AppError(409, error);
    return admin;
  }
}
