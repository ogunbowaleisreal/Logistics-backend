import ImageKit from "imagekit";
import { Account } from "../../models/Account.Model";
import AppError from "../../utilities/ErrorHandler";
import { Hasher } from "../../utilities/Hasher";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { CacheService } from "../Cache.Service";
import { EmailService } from "../Email.Service";
import { AuthenticationTokenGenerator } from "../Unique.Service";

export class AccountService {
  private authenticationTokenGenerator: AuthenticationTokenGenerator;
  private cacheService: CacheService;
  private emailService: EmailService;
  private hasher: Hasher;

  constructor(
    authenticationTokenGenerator: AuthenticationTokenGenerator,
    cacheService: CacheService,
    emailService: EmailService,
    hasher: Hasher
  ) {
    this.authenticationTokenGenerator = authenticationTokenGenerator;
    this.cacheService = cacheService;
    this.emailService = emailService;
    this.hasher = hasher;
  }
  public async getProfile(accountID: string) {
    const account = await Account.findOne({
      _id: accountID,
      isDeleted: false,
    });
    if (!account) {
      throw new AppError(404, "Account not found!");
    }
    return account;
  }

  public async getUsers(filter: any) {
    const { accountID, search, page, limit, sort } = filter;
    if (accountID) {
      const account = await Account.findOne({
        _id: accountID,
        isDeleted: false,
      }).select("firstname lastname email phone address avatar gender");
      if (!account) throw new AppError(404, "Account not found!");
      return account;
    }
    const sortQuery: any = sort ? { [sort]: -1 } : { createdAt: -1 };
    const query: any = { isDeleted: false };
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: "i" } },
        { lastname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const users = await paginateModel(
      Account,
      query,
      page,
      limit,
      sortQuery,
      "firstname lastname email phone address avatar gender"
    );
    return users;
  }

  public async updateProfile(accountID: string, type: string, payload: any) {
    if (payload.phone) {
      await this.checkPhoneExistence(payload.phone);
    }
    let updatedAccount = await Account.findOneAndUpdate(
      { _id: accountID, isDeleted: false },
      payload,
      { new: true }
    );
    if (!updatedAccount) {
      throw new AppError(404, "Account not found!");
    }
    return updatedAccount;
  }

  public async deleteProfile(accountID: string) {
    const account = await Account.findOneAndUpdate(
      {
        _id: accountID,
        isDeleted: false,
      },
      { isDeleted: true },
      { new: true }
    );
    if (!account) {
      throw new AppError(404, "Account not found!");
    }
    return;
  }

  public async updatePassword(accountID: string, payload: any) {
    const { oldPassword, newPassword } = payload;

    const account = await Account.findOne({ _id: accountID, isDeleted: false });
    if (!account) {
      throw new AppError(404, "Account not found");
    }
    const passwordVerification = await this.hasher.verifyPassword(
      oldPassword,
      account.password!
    );
    if (!passwordVerification) {
      throw new AppError(400, "Incorrect old password");
    }

    const hashedPassword = await this.hasher.hashPassword(newPassword);
    const otp = this.authenticationTokenGenerator.generateOTP(6);
    const passwordUpdateData = JSON.stringify({
      otp,
      password: hashedPassword,
    });
    await this.cacheService.cachePasswordUpdateData(
      accountID,
      passwordUpdateData
    );
    await this.emailService.sendPasswordResetOTP({
      email: account.email,
      otp,
    });
    return;
  }

  public async verifyPasswordUpdateOTP(
    accountID: string,
    payload: { otp: string }
  ) {
    const { otp } = payload;
    const cachedPasswordData =
      await this.cacheService.getCachedPasswordUpdateData(accountID);
    const cachedPasswordDataJSON = JSON.parse(cachedPasswordData);
    if (cachedPasswordDataJSON.otp != otp) {
      throw new AppError(400, "Invalid OTP");
    }

    const account = await Account.findOne({ _id: accountID, isDeleted: false });
    if (!account) {
      throw new AppError(404, "Account not found");
    }
    account.password = cachedPasswordDataJSON.password;

    return await account.save();
  }

  private async verifyUsernameUniqueness(username: string) {
    const existingUser = await Account.findOne({
      username: { $regex: username, $options: "i" },
      isDeleted: false,
    });
    if (existingUser) {
      throw new AppError(400, "Username already exists");
    }
    return true;
  }

  public async checkPhoneExistence(phone: string) {
    const existingPhone = await Account.findOne({ phone, isDeleted: false });
    if (existingPhone) {
      throw new AppError(400, "Phone number already exists");
    } else {
      return true;
    }
  }

  public async generateImageUploadSignature() {
    let imagekit = new ImageKit({
      publicKey: process.env["IMAGE_KIT_PUBLIC_KEY"]!,
      privateKey: process.env["IMAGE_KIT_PRIVATE_KEY"]!,
      urlEndpoint: process.env["IMAGE_KIT_URL_ENDPOINT"]!,
    });

    const signature = imagekit.getAuthenticationParameters();

    return signature;
  }

  private async verifyEmailUniqueness(email: string) {
    const existingUser = await Account.findOne({ email, isDeleted: false });
    if (existingUser) {
      throw new AppError(400, "Email already exists");
    }
    return true;
  }
}
