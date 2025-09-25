import { Configuration } from "../../models/Configuration.Model";

export class ConfigurationService {
  public async getConfiguration() {
    let configuration = await Configuration.findOne();
    if (!configuration) {
      configuration = await Configuration.create({});
    }
    return configuration;
  }

  public async updateConfiguration(payload: any) {
    const { pricePerKm, minimumCharge } = payload;
    const configuration = await Configuration.findOneAndUpdate(
      {},
      { pricePerKm, minimumCharge },
      { new: true, $upsert: true }
    );
    return configuration;
  }
}
