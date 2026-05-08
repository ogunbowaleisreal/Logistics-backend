import { Business } from "../../models/Business.Model";
import AppError from "../../utilities/ErrorHandler";

export class BusinessProfileService {
  public async getBusinessProfile(businessId: string) {
    const business = await Business.findOne(
      { _id: businessId, isDeleted: false },
      { socialLinks: 1, supports: 1 },
    ).lean();
    if (!business) throw new AppError(404, "Business not found");
    return { socialLinks: business.socialLinks, supports: business.supports };
  }
}
