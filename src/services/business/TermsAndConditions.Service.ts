import { TermsAndConditions } from "../../models/TermsAndConditions.Model";
import AppError from "../../utilities/ErrorHandler";

export class TermsAndConditionsService {
  public async createOrUpdateTermsAndConditions(
    businessId: string,
    body: string,
  ) {
    const termsAndConditions = await TermsAndConditions.findOneAndUpdate(
      { businessId },
      { body },
      { new: true, upsert: true },
    );
    if (!termsAndConditions) {
      throw new AppError(404, "Terms and conditions not found");
    }
    return termsAndConditions;
  }

  public async getTermsAndConditions(businessId: string) {
    const termsAndConditions = await TermsAndConditions.findOne({ businessId });
    if (!termsAndConditions) {
      throw new AppError(404, "Terms and conditions not found");
    }
    return termsAndConditions;
  }
}
