import {
  Configuration,
  IConfiguration,
} from "../../models/Configuration.Model";

export class ConfigurationService {
  public async getConfiguration() {
    let configuration = await Configuration.findOne();
    if (!configuration) {
      configuration = await Configuration.create({});
    }
    return configuration;
  }

  public async updateConfiguration(payload: IConfiguration) {
    const { serviceFee, VAT } = payload;
    const configuration = await Configuration.findOneAndUpdate(
      {},
      { serviceFee, VAT },
      { new: true, upsert: true },
    );
    return configuration;
  }
}
