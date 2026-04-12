import { Configuration } from "../../models/Configuration.Model";
import { tenantScope } from "../../utilities/TenantScope";

export class ConfigurationService {
  public async getConfiguration(businessId: string) {
    let configuration = await Configuration.findOne(
      tenantScope({}, businessId),
    );
    if (!configuration) {
      configuration = await Configuration.create({ businessId });
    }
    return configuration;
  }

  public async updateConfiguration(businessId: string, payload: any) {
    const { pricePerKm, minimumCharge } = payload;
    const configuration = await Configuration.findOneAndUpdate(
      tenantScope({}, businessId),
      { pricePerKm, minimumCharge },
      { new: true, upsert: true },
    );
    return configuration;
  }
}
