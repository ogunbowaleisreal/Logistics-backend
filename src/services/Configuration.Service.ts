import { Configuration } from "../models/Configuration.Model";

export class ConfigurationService {
  public async getConfiguration() {
    let configuration = await Configuration.findOne();
    if (!configuration) {
      throw new Error(
        "Shipping requirement settings not found, please contact admin",
      );
    }
    return configuration;
  }
}
