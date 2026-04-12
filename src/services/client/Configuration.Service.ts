import { Configuration } from "../../models/Configuration.Model";
import { tenantScope } from "../../utilities/TenantScope";

export class ConfigurationService {
  public async getConfiguration(businessId: string) {
    const config = await Configuration.findOne(tenantScope({}, businessId));
    if (!config) {
      throw new Error("Configuration not found, please contact support");
    }
    return config;
  }
}
