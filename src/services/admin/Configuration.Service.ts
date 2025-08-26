import { Configuration } from "../../models/Configuration.Model";

export class ConfigurtionService {
  public async getConfiguration() {
    let configuration = await Configuration.findOne();
    if (!configuration) {
      configuration = await Configuration.create({});
    }
    return configuration;
  }

  public async updateConfiguration(payload: any) {
    const { referralBonus, itemReward, pingRequest } = payload;
    const configuration = await Configuration.findOneAndUpdate(
      {},
      { referralBonus, itemReward, pingRequest },
      { new: true, $upsert: true }
    );
    return configuration;
  }
}
