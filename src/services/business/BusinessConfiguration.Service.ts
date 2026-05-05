import { BusinessConfiguration } from "../../models/BusinessConfiguration.Model";
import { tenantScope } from "../../utilities/TenantScope";

export class BusinessConfigurationService {
  public async getConfiguration(businessId: string) {
    let configuration = await BusinessConfiguration.findOne(
      tenantScope({}, businessId),
    );
    if (!configuration) {
      configuration = await BusinessConfiguration.create({ businessId });
    }
    return configuration;
  }

  public async updateConfiguration(businessId: string, payload: any) {
    const { pricePerKm, minimumCharge, shippingSettings } = payload;
    const configuration = await BusinessConfiguration.findOneAndUpdate(
      tenantScope({}, businessId),
      { pricePerKm, minimumCharge, shippingSettings },
      { new: true, upsert: true },
    );
    return configuration;
  }
}
