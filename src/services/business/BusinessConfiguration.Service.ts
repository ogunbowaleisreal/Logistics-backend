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
    const { shippingSettings, rideTypeConfig, shippingRegion } = payload;
    const update: any = {};
    // if (pricePerKm !== undefined) update.pricePerKm = pricePerKm;
    // if (minimumCharge !== undefined) update.minimumCharge = minimumCharge;
    if (shippingSettings !== undefined) update.shippingSettings = shippingSettings;
    if (rideTypeConfig !== undefined) update.rideTypeConfig = rideTypeConfig;
    if (shippingRegion !== undefined) update.shippingRegion = shippingRegion;
    const configuration = await BusinessConfiguration.findOneAndUpdate(
      tenantScope({}, businessId),
      update,
      { new: true, upsert: true },
    );
    return configuration;
  }
}
