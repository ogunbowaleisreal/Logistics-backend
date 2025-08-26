import { Account } from "../../models/Account.Model";
import { Admin } from "../../models/Admin.Model";
import { Transaction } from "../../models/Transaction.Model";
import AppError from "../../utilities/ErrorHandler";
import { Hasher } from "../../utilities/Hasher";
import { paginateModelWithPopulate } from "../../utilities/Pagination.Helper";
import { CacheService } from "../Cache.Service";
import { EmailService } from "../Email.Service";
import { AuthenticationTokenGenerator } from "../Unique.Service";
import { RoleServices } from "./Role.Service";
import ImageKit from "imagekit";

export class AdminService {
  private authenticationTokenGenerator: AuthenticationTokenGenerator;
  private cacheService: CacheService;
  private emailService: EmailService;
  private hasher: Hasher;
  private roleService: RoleServices;

  constructor(
    authenticationTokenGenerator: AuthenticationTokenGenerator,
    cacheService: CacheService,
    emailService: EmailService,
    hasher: Hasher,
    roleService: RoleServices
  ) {
    this.authenticationTokenGenerator = authenticationTokenGenerator;
    this.cacheService = cacheService;
    this.emailService = emailService;
    this.hasher = hasher;
    this.roleService = roleService;
  }
  public async getProfile(adminID: string) {
    const admin = await Admin.findOne({ _id: adminID }).populate({
      path: "role",
      select: "title permissions",
    });
    if (!admin) throw new AppError(404, "Admin not found");
    return admin;
  }

  public async updateProfile(adminID: string, payload: any) {
    const updatedAdmin = await Admin.findOneAndUpdate(
      { _id: adminID },
      payload,
      {
        new: true,
      }
    );
    if (!updatedAdmin) throw new AppError(404, "Admin not found");
    return updatedAdmin;
  }

  public async updatePassword(adminID: string, payload: any) {
    const { oldPassword, newPassword } = payload;

    const admin = await Admin.findOne({ _id: adminID });
    if (!admin) {
      throw new AppError(404, "Admin not found");
    }
    const { password } = admin;
    const validOldPassword = await this.hasher.verifyPassword(
      oldPassword,
      password!
    );
    if (!validOldPassword) {
      throw new AppError(404, "Admin password not found");
    }
    admin.password = await this.hasher.hashPassword(newPassword);
    return await admin.save();
  }

  // public async requestPasswordUpdate(adminID: string) {
  //   const admin = await Admin.findOne({ _id: adminID });
  //   if (!admin) {
  //     throw new AppError(404, "Admin not found");
  //   }

  //   const otp = await this.getPasswordUpdateOTP(adminID);

  //   await this.emailService.sendPasswordResetOTP({ email: admin.email, otp });
  //   return;
  // }
  // public async verifyPasswordUpdateOTP(adminID: string, payload: any) {
  //   const { otp } = payload;
  //   const admin = await Admin.findOne({ _id: adminID });
  //   if (!admin) {
  //     throw new AppError(404, "Admin not found");
  //   }
  //   let cachedResponse = await this.cacheService.getCachedPasswordUpdateOTP(
  //     adminID
  //   );
  //   let cachedResponseJSON = JSON.parse(cachedResponse);
  //   if (cachedResponseJSON.otp !== otp) {
  //     throw new AppError(400, "Invalid OTP");
  //   }
  //   cachedResponseJSON.isOTPValid = true;
  //   await this.cacheService.cachePasswordUpdateOTP(
  //     adminID,
  //     JSON.stringify(cachedResponseJSON)
  //   );
  //   return admin;
  // }

  // public async updatePassword(adminID: string, payload: any) {
  //   const { password } = payload;
  //   let admin = await Admin.findOne({ _id: adminID });
  //   if (!admin) {
  //     throw new AppError(404, "Account not found");
  //   }

  //   let cachedResponse = await this.cacheService.getCachedPasswordUpdateOTP(
  //     adminID
  //   );
  //   let cachedResponseJSON = JSON.parse(cachedResponse);
  //   if (cachedResponseJSON.isOTPValid === false) {
  //     throw new AppError(400, "Expired OTP");
  //   }
  //   this.cacheService.deleteCachedPasswordUpdateOTP(adminID);
  //   admin.password = await this.hasher.hashPassword(password);
  //   admin = await admin.save();
  //   return admin;
  // }
  public async updateAdmin2FA(
    adminID: string,
    twoFactorAuthentication: boolean
  ) {
    const admin = await Admin.findOne({ _id: adminID });
    if (!admin) throw new AppError(400, "Admin not found");
    if (twoFactorAuthentication == true) {
      admin.twoFactorAuthentication = true;
    } else {
      admin.twoFactorAuthentication = false;
    }

    return await admin.save();
  }

  // Update admin
  public async updateAdmin(payload: any) {
    const { adminID, firstname, lastname, email, phone, status, role } =
      payload;
    const admin: any = await Admin.findOne({ _id: adminID });

    if (!admin) throw new AppError(400, "Admin not found");

    if (firstname) admin.firstname = firstname;
    if (lastname) admin.lastname = lastname;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;
    if (status) admin.status = status;
    if (role) {
      const { role: adminRole } = await this.roleService.verifyRoleByID(role);
      admin.role = role;
      adminRole.admins += 1;
      await adminRole.save();
    }

    return await admin.save();
  }

  // Get admins
  public async getAdmins(filter: any) {
    const { adminID, search, roleID, page, limit } = filter;
    if (adminID) {
      const admin = await Admin.findOne({ _id: adminID }).populate({
        path: "role",
        select: "title",
      });
      if (!admin) throw new AppError(400, "Admin not found");
      return admin;
    }
    const query: any = {};
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: "i" } },
        { lastname: { $regex: search, $options: "i" } },
      ];
    }
    if (roleID) {
      query.role = roleID;
    }

    const admins = await paginateModelWithPopulate(
      Admin,
      query,
      page,
      limit,
      { createdAt: -1 },
      { path: "role", select: "title" }
    );
    return admins;
  }

  public async deleteAdmin(adminID: string) {
    const admin = await Admin.findOneAndDelete({ _id: adminID });
    if (!admin) {
      throw new AppError(404, "Admin not found!");
    }
    return;
  }

  private async getPasswordUpdateOTP(adminID: string) {
    const otp = this.authenticationTokenGenerator.generateOTP(6);

    await this.cacheService.cachePasswordUpdateOTP(
      adminID,
      JSON.stringify({ otp, isOTPValid: false })
    );
    return otp;
  }

  //////////////////// Image Upload ///////////////////
  public async generateImageUploadSignature() {
    var imagekit = new ImageKit({
      publicKey: process.env["IMAGE_KIT_PUBLIC_KEY"]!,
      privateKey: process.env["IMAGE_KIT_PRIVATE_KEY"]!,
      urlEndpoint: process.env["IMAGE_KIT_URL_ENDPOINT"]!,
    });

    const signature = imagekit.getAuthenticationParameters();

    return signature;
  }

  // Dashboard
  public async adminDashboard() {
    // let cachedDashboardResponse =
    //   await this.cacheService.getCachedAdminDashboardResponse();
    // if (!cachedDashboardResponse) {
    //   const totalRevenue = await this.getTotalRevenue();
    //   const downlinesOverTime = await this.getDownlineOverTime();
    //   const totalActiveAgents = await this.getActiveAgents();
    //   const totalInactiveAgents = await this.getInactiveAgents();
    //   const allAgents = await this.getAllAgents();

    //   const dashboardResponse = {
    //     totalRevenue: totalRevenue[0]["totalRevenue"],
    //     downlinesOverTime,
    //     totalActiveAgents: totalActiveAgents[0],
    //     totalInactiveAgents: totalInactiveAgents[0],
    //     totalAgents: allAgents,
    //   };

    //   await this.cacheService.cacheAdminDashboardResponse(dashboardResponse);
    //   return dashboardResponse;
    // }

    // return await JSON.parse(cachedDashboardResponse);

    const users = await this.getTotalUsers();
    const transactions = await this.getTotalTransactions();

    return { users, transactions };
    // const point = await
  }

  private async getTotalTransactions() {
    const transaction = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $cond: [{ $eq: ["$type", "point-purchase"] }, "$amount", 0],
            },
          },
          totalPointPurchased: {
            $sum: {
              $cond: [{ $eq: ["$type", "point-purchase"] }, "$points", 0],
            },
          },
        },
      },
      { $project: { _id: 0, totalAmount: 1, totalPointPurchased: 1 } },
    ]);

    return transaction[0];
  }

  private async getTotalUsers() {
    const users = await Account.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalUsers: {
            $sum: 1,
          },
          totalVerifiedUsers: {
            $sum: {
              $cond: [{ $eq: ["$isVerified", true] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalUsers: 1,
          totalVerifiedUsers: 1,
        },
      },
    ]);

    return users[0];
  }
}
