import { BusinessConfiguration } from "../../models/BusinessConfiguration.Model";
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
}
