import {
  StaffRole,
  StaffPermissions,
  StaffRoleType,
  StaffRoleTypeValue,
} from "../../models/StaffRole.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";

const DEFAULT_ROLE_PERMISSIONS: Record<StaffRoleTypeValue, string[]> = {
  customer_service: ["GETORDERS", "UPTORDER"],
  manager: [
    "GETORDERS",
    "UPTORDER",
    "CRTSTAFF",
    "UPTSTAFF",
    "GETSTAFF",
    "DELSTAFF",
    "CRTRIDER",
    "UPTRIDER",
    "GETRIDERS",
    "DELRIDER",
    "GETCFG",
    "GETBIZPROFILE",
    "UPTBIZPROFILE",
    "GETPRV",
    "UPTPRV",
    "GETTC",
    "CRTTC",
    "CRTSHIPPING",
    "UPTSHIPPING",
    "GETSHIPPINGS",
    "DELSHIPPING",
  ],
  admin: [
    "GETORDERS",
    "UPTORDER",
    "CRTSTAFF",
    "UPTSTAFF",
    "GETSTAFF",
    "DELSTAFF",
    "CRTRIDER",
    "UPTRIDER",
    "GETRIDERS",
    "DELRIDER",
    "GETCFG",
    "GETBIZPROFILE",
    "UPTBIZPROFILE",
    "UPTCFG",
    "CRTBANNER",
    "UPTBANNER",
    "GETBANNERS",
    "DELBANNER",
    "CRTFAQ",
    "UPTFAQ",
    "GETFAQS",
    "DELFAQ",
    "CRTTHEME",
    "UPTTHEME",
    "GETTHEMES",
    "DELTHEME",
    "CRTBANK",
    "GETBANKS",
    "DELBANK",
    "GETSTFROLES",
    "UPTSTFROLE",
    "GETPRV",
    "UPTPRV",
    "GETTC",
    "CRTTC",
    "CRTSHIPPING",
    "UPTSHIPPING",
    "GETSHIPPINGS",
    "DELSHIPPING",
  ],
};

const DEFAULT_ROLE_TITLES: Record<StaffRoleTypeValue, string> = {
  customer_service: "Customer Service",
  manager: "Manager",
  admin: "Admin",
};

export class StaffRoleService {
  public async seedDefaultRoles(
    businessId: string,
  ): Promise<{ created: number; skipped: number }> {
    const types = Object.values(StaffRoleType) as StaffRoleTypeValue[];
    const results = await Promise.all(
      types.map((type) =>
        StaffRole.updateOne(
          { businessId, type },
          {
            $setOnInsert: {
              businessId,
              type,
              title: DEFAULT_ROLE_TITLES[type],
              permissions: DEFAULT_ROLE_PERMISSIONS[type],
              staffCount: 0,
              status: "active",
            },
          },
          { upsert: true },
        ),
      ),
    );
    const created = results.filter((r) => r.upsertedCount > 0).length;
    return { created, skipped: types.length - created };
  }

  public async updateRole(businessId: string, payload: any) {
    const { roleId, title, status, permissions } = payload;

    const role = await StaffRole.findOne({ _id: roleId, businessId });
    if (!role) throw new AppError(404, "Role not found");

    if (title && title !== role.title) {
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

  public async addPermissionsToExistingRoles(
    additions: Partial<Record<StaffRoleTypeValue, string[]>>,
  ): Promise<{ updated: number }> {
    let updated = 0;

    for (const [type, permissions] of Object.entries(additions)) {
      const result = await StaffRole.updateMany(
        { type },
        { $addToSet: { permissions: { $each: permissions } } },
      );
      updated += result.modifiedCount;
    }

    return { updated };
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

  public async getRoleById(businessId: string, roleId: string) {
    const role = await StaffRole.findOne({ _id: roleId, businessId });
    if (!role) throw new AppError(404, "Role not found");
    return role;
  }

  public async getRoleByType(businessId: string, roleType: string) {
    const validType = Object.values(StaffRoleType).find((t) => t === roleType);
    if (!validType)
      throw new AppError(
        400,
        `Invalid role type. Must be one of: ${Object.values(StaffRoleType).join(", ")}`,
      );

    const role = await StaffRole.findOne({ businessId, type: validType });
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
    return permissions.filter((p) =>
      StaffPermissions.some((sp) => sp.code === p),
    );
  }
}
