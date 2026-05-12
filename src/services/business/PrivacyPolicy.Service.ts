import { PrivacyPolicy } from "../../models/PrivacyPolicy.Model";
import AppError from "../../utilities/ErrorHandler";

export class PrivacyPolicyService {
  public async createOrUpdatePrivacyPolicy(businessId: string, body: string) {
    const policy = await PrivacyPolicy.findOneAndUpdate(
      { businessId },
      { body },
      { new: true, upsert: true },
    );
    if (!policy) {
      throw new AppError(404, "Privacy policy not found");
    }
    return policy;
  }

  public async getPrivacyPolicy(businessId: string) {
    const policy = await PrivacyPolicy.findOne({ businessId });
    if (!policy) {
      throw new AppError(404, "Privacy policy not found");
    }
    return policy;
  }
}
