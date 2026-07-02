import { Staff } from "../../models/Staff.Model";
import AppError from "../../utilities/ErrorHandler";
import { Hasher } from "../../utilities/Hasher";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { EmailService } from "../Email.Service";
import { PasswordGeneratorService } from "../Unique.Service";
import { StaffRoleService } from "./StaffRole.Service";

export class StaffService {
  private hasher: Hasher;
  private emailService: EmailService;
  private passwordGenerator: PasswordGeneratorService;
  private staffRoleService: StaffRoleService;

  constructor(
    hasher: Hasher,
    emailService: EmailService,
    passwordGenerator: PasswordGeneratorService,
    staffRoleService: StaffRoleService,
  ) {
    this.hasher = hasher;
    this.emailService = emailService;
    this.passwordGenerator = passwordGenerator;
    this.staffRoleService = staffRoleService;
  }

  public async createStaff(businessId: string, payload: any) {
    const { firstname, lastname, email, phone, roleId } = payload;

    const roleDoc = await this.staffRoleService.getRoleById(businessId, roleId);

    const existing = await Staff.findOne({
      businessId,
      email: email.toLowerCase(),
    });
    if (existing)
      throw new AppError(409, "Staff with this email already exists");

    const tempPassword =
      this.passwordGenerator.generateTemporaryPasswordForNewAdmin(10);
    const hashedPassword = await this.hasher.hashPassword(tempPassword);

    const staff = await Staff.create({
      businessId,
      firstname,
      lastname,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: roleDoc._id,
    });

    await this.emailService.sendStaffWelcomeEmail({
      email: email.toLowerCase(),
      firstname,
      password: tempPassword,
    });

    return staff;
  }

  public async getStaff(businessId: string, filter: any) {
    const { staffId, page, limit, status } = filter;

    if (staffId) {
      const staff = await Staff.findOne({
        _id: staffId,
        businessId,
        isDeleted: false,
      }).populate("role");
      if (!staff) throw new AppError(404, "Staff not found");
      return staff;
    }

    const query: any = { businessId, isDeleted: false };
    if (status) query.status = status;

    return await paginateModel(Staff, query, page, limit);
  }

  public async updateStaff(businessId: string, payload: any) {
    const { staffId, firstname, lastname, phone, status } = payload;

    const staff = await Staff.findOne({
      _id: staffId,
      businessId,
      isDeleted: false,
    });
    if (!staff) throw new AppError(404, "Staff not found");

    if (firstname) staff.firstname = firstname;
    if (lastname) staff.lastname = lastname;
    if (phone) staff.phone = phone;
    if (status) staff.status = status;

    if (payload.roleId) {
      const roleDoc = await this.staffRoleService.getRoleById(
        businessId,
        payload.roleId,
      );
      staff.role = roleDoc._id as any;
    }

    return await staff.save();
  }

  public async deleteStaff(businessId: string, staffId: string) {
    const staff = await Staff.findOne({
      _id: staffId,
      businessId,
      isDeleted: false,
    });
    if (!staff) throw new AppError(404, "Staff not found");

    staff.isDeleted = true;
    await staff.save();
    return;
  }
}
