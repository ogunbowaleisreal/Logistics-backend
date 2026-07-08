import { ClientSession } from "mongoose";
import { BusinessConfiguration } from "../../models/BusinessConfiguration.Model";
import { tenantScope } from "../../utilities/TenantScope";

export class BusinessConfigurationService {
  public async getConfiguration(businessId: string, session?: ClientSession) {
    let configuration = await BusinessConfiguration.findOne(
      tenantScope({}, businessId),
    ).session(session ?? null);
    if (!configuration) {
      configuration = await BusinessConfiguration.create({ businessId });
    }
    return configuration;
  }

  public async updateConfiguration(businessId: string, payload: any) {
    const { shippingSettings, rideTypeConfig, shippingRegion, autoAssign } =
      payload;
    const update: any = {};
    // if (pricePerKm !== undefined) update.pricePerKm = pricePerKm;
    // if (minimumCharge !== undefined) update.minimumCharge = minimumCharge;
    if (shippingSettings !== undefined) update.shippingSettings = shippingSettings;
    if (rideTypeConfig !== undefined) update.rideTypeConfig = rideTypeConfig;
    if (shippingRegion !== undefined) update.shippingRegion = shippingRegion;
    if (autoAssign !== undefined) update.autoAssign = autoAssign;
    const configuration = await BusinessConfiguration.findOneAndUpdate(
      tenantScope({}, businessId),
      update,
      { new: true, upsert: true },
    );
    return configuration;
  }
}
