import { BusinessConfiguration } from "../../models/BusinessConfiguration.Model";
import { Theme } from "../../models/Themes.Model";
import { tenantScope } from "../../utilities/TenantScope";

export class BusinessConfigurationService {
  public async getConfiguration(businessId: string) {
    const config = await BusinessConfiguration.findOne(
      tenantScope({}, businessId),
    );
    if (!config) {
      throw new Error("Configuration not found, please contact support");
    }
    return config;
  }

  public async getBusinessTheme(businessId: string) {
    const theme = await Theme.findOne(tenantScope({}, businessId));
    if (!theme) {
      throw new Error("Theme not found, please contact support");
    }
    return theme;
  }
}
