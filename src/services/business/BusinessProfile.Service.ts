import { Business, IBusiness } from "../../models/Business.Model";
import AppError from "../../utilities/ErrorHandler";

type SocialLinksPayload = Partial<IBusiness["socialLinks"]>;
type SupportsPayload = {
  phone?: Partial<IBusiness["supports"]["phone"]>;
  email?: Partial<IBusiness["supports"]["email"]>;
  whatsapp?: Partial<IBusiness["supports"]["whatsapp"]>;
};

export class BusinessProfileService {
  public async getProfile(businessId: string) {
    const business = await Business.findById(businessId).select(
      "-password -__v -isDeleted",
    );
    if (!business) throw new AppError(404, "Business not found");
    return business;
  }

  public async updateSocialLinks(
    businessId: string,
    payload: SocialLinksPayload,
  ) {
    const update: Record<string, any> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined) update[`socialLinks.${key}`] = value;
    }
    const business = await Business.findByIdAndUpdate(
      businessId,
      { $set: update },
      { new: true, select: "socialLinks" },
    );
    if (!business) throw new AppError(404, "Business not found");
    return business.socialLinks;
  }

  public async updateSupport(businessId: string, payload: SupportsPayload) {
    const update: Record<string, any> = {};
    for (const [channel, fields] of Object.entries(payload)) {
      if (!fields) continue;
      for (const [field, value] of Object.entries(fields)) {
        if (value !== undefined) update[`supports.${channel}.${field}`] = value;
      }
    }
    const business = await Business.findByIdAndUpdate(
      businessId,
      { $set: update },
      { new: true, select: "supports" },
    );
    if (!business) throw new AppError(404, "Business not found");
    return business.supports;
  }
}
