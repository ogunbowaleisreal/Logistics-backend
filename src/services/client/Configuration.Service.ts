import { Configuration } from "../../models/Configuration.Model";

export class ConfigurationService {
  public async getConfiguration() {
    const config = await Configuration.findOne();
    if (!config) {
      throw new Error("Configuration not found, please contact support");
    }
    return config;
  }
}
