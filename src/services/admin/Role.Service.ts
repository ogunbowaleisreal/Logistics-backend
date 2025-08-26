import { Role } from "../../models/Role.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { Permissions } from "../../models/Role.Model";

export class RoleServices {
  public async createRole(payload: any) {
    const { title, permissions } = payload;
    const validPermission = await this.getPermissionsCode(permissions);

    const validRole = await this.verifyRoleByTitle(title);
    if (!validRole) throw new AppError(400, "Role already exist");

    payload.role = {
      title: validRole,
      permissions: validPermission,
    };

    const role = await Role.create(payload.role);

    return role;
  }

  public async updateRole(payload: any) {
    const { roleID, title, status, permissions } = payload;

    const role = await Role.findById(roleID);
    if (!role) {
      throw new AppError(400, "Invalid role id passed");
    }
    const currentTitle = role.title;

    if (title) {
      if (role.title !== title) {
        const updatedTitle = await this.verifyRoleByTitle(title);
        if (updatedTitle) role.title = updatedTitle;
        else {
          throw new AppError(409, "Role already exist");
        }
      }
    }
    if (permissions) {
      const validPermission = await this.getPermissionsCode(permissions);
      role.permissions = validPermission;
    }

    if (status) {
      role.status = status;
    }

    const updatedRole = await role.save();

    return updatedRole;
  }

  public async getRoles(filter: any) {
    const { roleID, title, limit, page } = filter;

    if (roleID) {
      const role = await Role.findById(roleID);
      if (!role) throw new AppError(400, "Invalid role id passed");
      return role;
    }
    const query: any = {};
    if (title) {
      query.title = { $regex: title, $options: "i" };
    }
    const roles = await paginateModel(Role, query, page, limit);
    return roles;
  }

  public getPermissions(filter: any) {
    const { code } = filter;
    if (code) {
      let permission;
      for (var item of Permissions) {
        if (item.code === code) {
          permission = item;
        }
      }

      if (!permission) {
        throw new AppError(400, "Invalid permission passed");
      }
      return permission;
    }

    return Permissions;
  }

  public async createSuperAdminRole() {
    const permissionKeys = [];
    for (var item of Permissions) {
      permissionKeys.push(item.code);
    }
    const rolePayload = {
      title: "Super Admin",
      permissions: permissionKeys,
    };

    const role = await this.createRole(rolePayload);

    return role;
  }

  public async getPermissionsCode(permissions: any) {
    let validPermissions = [];
    for (var permission of permissions) {
      const response = Permissions.find((item) => {
        return item.code == permission;
      });

      if (response) {
        validPermissions.push(response.code);
      }
    }
    return validPermissions;
  }

  public async verifyRoleByTitle(title: string) {
    const role = await Role.findOne({
      title: { $regex: `^${title}$`, $options: "i" },
    });

    if (!role) {
      return title;
    }
    return null;
  }

  public async verifyRoleByID(roleID: string) {
    const role = await Role.findById(roleID);
    if (!role) {
      throw new AppError(400, "Invalid role id passed");
    }
    const validPermissions = await this.getPermissionsCode(role.permissions);
    return { roleID, role };
  }
}
