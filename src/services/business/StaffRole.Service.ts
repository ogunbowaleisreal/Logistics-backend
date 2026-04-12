import { StaffRole, StaffPermissions } from "../../models/StaffRole.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";

export class StaffRoleService {
  public async createRole(businessId: string, payload: any) {
    const { title, permissions } = payload;

    const validPermissions = this.getPermissionsCodes(permissions);

    const existing = await StaffRole.findOne({ businessId, title: { $regex: `^${title}$`, $options: "i" } });
    if (existing) throw new AppError(409, "Role already exists");

    const role = await StaffRole.create({ businessId, title, permissions: validPermissions });
    return role;
  }

  public async updateRole(businessId: string, payload: any) {
    const { roleId, title, status, permissions } = payload;

    const role = await StaffRole.findOne({ _id: roleId, businessId });
    if (!role) throw new AppError(404, "Role not found");

    if (title && title !== role.title) {
      const duplicate = await StaffRole.findOne({ businessId, title: { $regex: `^${title}$`, $options: "i" } });
      if (duplicate) throw new AppError(409, "Role already exists");
      role.title = title;
    }

    if (permissions) {
      role.permissions = this.getPermissionsCodes(permissions);
    }

    if (status) {
      role.status = status;
    }

    return await role.save();
  }

  public async getRoles(businessId: string, filter: any) {
    const { roleId, title, page, limit } = filter;

    if (roleId) {
      const role = await StaffRole.findOne({ _id: roleId, businessId });
      if (!role) throw new AppError(404, "Role not found");
      return role;
    }

    const query: any = { businessId };
    if (title) query.title = { $regex: title, $options: "i" };

    return await paginateModel(StaffRole, query, page, limit);
  }

  public async verifyRoleByID(businessId: string, roleId: string) {
    const role = await StaffRole.findOne({ _id: roleId, businessId });
    if (!role) throw new AppError(404, "Role not found");
    return role;
  }

  public getPermissions(filter: any) {
    const { code } = filter;
    if (code) {
      const permission = StaffPermissions.find((p) => p.code === code);
      if (!permission) throw new AppError(400, "Invalid permission code");
      return permission;
    }
    return StaffPermissions;
  }

  private getPermissionsCodes(permissions: string[]): string[] {
    return permissions.filter((p) => StaffPermissions.some((sp) => sp.code === p));
  }
}
